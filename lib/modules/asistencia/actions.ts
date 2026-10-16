"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";
import type { FormState } from "@/lib/modules/form";

export type { FormState };

const ESTADOS = ["PRESENTE", "AUSENTE", "TARDE", "JUSTIFICADO"] as const;

export async function saveAsistencias(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId;
  if (!centroId) return { error: "Tu cuenta no pertenece a un centro" };

  const claseId = String(formData.get("claseId") ?? "");
  const periodoId = String(formData.get("periodoId") ?? "");
  const fechaStr = String(formData.get("fecha") ?? "");

  if (!fechaStr) return { error: "Selecciona una fecha" };

  const fecha = new Date(fechaStr + "T00:00:00.000Z");
  if (Number.isNaN(fecha.getTime())) return { error: "Fecha inválida" };

  const clase = await prisma.cursoAsignaturaDocente.findFirst({
    where: { id: claseId, curso: { centroId }, asignatura: { centroId } },
    select: { id: true, cursoId: true, docenteId: true },
  });
  if (!clase) return { error: "Clase no válida" };
  if (user.rol === "DOCENTE" && clase.docenteId !== user.id) {
    return { error: "No puedes registrar asistencia de una clase que no dictas" };
  }

  const periodo = await prisma.periodo.findFirst({
    where: { id: periodoId, centroId },
    select: { id: true },
  });
  if (!periodo) return { error: "Período no válido" };

  const matriculas = await prisma.matricula.findMany({
    where: { centroId, cursoId: clase.cursoId, periodoId },
    select: { estudianteId: true },
  });
  const matriculados = new Set(matriculas.map((m) => m.estudianteId));

  const items: { estudianteId: string; estado: (typeof ESTADOS)[number] }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("estado_")) continue;
    const estudianteId = key.slice("estado_".length);
    const estado = String(value).toUpperCase() as (typeof ESTADOS)[number];
    if (!ESTADOS.includes(estado)) continue;
    if (!matriculados.has(estudianteId)) continue;
    items.push({ estudianteId, estado });
  }

  if (items.length === 0) return { ok: true };

  await prisma.$transaction(
    items.map((it) =>
      prisma.asistencia.upsert({
        where: {
          estudianteId_cursoAsignaturaDocenteId_fecha: {
            estudianteId: it.estudianteId,
            cursoAsignaturaDocenteId: clase.id,
            fecha,
          },
        },
        create: {
          centroId,
          estudianteId: it.estudianteId,
          cursoAsignaturaDocenteId: clase.id,
          periodoId,
          fecha,
          estado: it.estado,
          autorId: user.id,
        },
        update: { estado: it.estado, autorId: user.id },
      }),
    ),
  );

  await logAudit({
    centroId,
    usuarioId: user.id,
    accion: "SAVE",
    entidad: "Asistencia",
    descripcion: `${items.length} registro(s) para ${fechaStr}`,
  });

  revalidatePath("/panel/asistencia");
  return { ok: true };
}
