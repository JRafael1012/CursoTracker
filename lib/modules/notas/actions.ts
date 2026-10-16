"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";
import { ESCALAS, getConfigCalificacion } from "@/lib/modules/config";
import type { FormState } from "@/lib/modules/form";

export type { FormState };

export async function saveNotas(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId;
  if (!centroId) return { error: "Tu cuenta no pertenece a un centro" };

  const claseId = String(formData.get("claseId") ?? "");
  const periodoId = String(formData.get("periodoId") ?? "");
  const corte = String(formData.get("corte") ?? "");

  const clase = await prisma.cursoAsignaturaDocente.findFirst({
    where: { id: claseId, curso: { centroId }, asignatura: { centroId } },
    select: { id: true, cursoId: true, docenteId: true },
  });
  if (!clase) return { error: "Clase no válida" };
  if (user.rol === "DOCENTE" && clase.docenteId !== user.id) {
    return { error: "No puedes calificar una clase que no dictas" };
  }

  const periodo = await prisma.periodo.findFirst({
    where: { id: periodoId, centroId },
    select: { id: true },
  });
  if (!periodo) return { error: "Período no válido" };

  const config = await getConfigCalificacion(centroId);
  if (!config.cortes.includes(corte)) return { error: "Corte no válido" };
  const escala = ESCALAS[config.escala];

  const matriculas = await prisma.matricula.findMany({
    where: { centroId, cursoId: clase.cursoId, periodoId },
    select: { estudianteId: true },
  });
  const matriculados = new Set(matriculas.map((m) => m.estudianteId));

  const items: { estudianteId: string; valor: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("valor_")) continue;
    const estudianteId = key.slice("valor_".length);
    const raw = String(value).trim();
    if (raw === "") continue;

    const num = Number(raw.replace(",", "."));
    if (!Number.isFinite(num)) return { error: `Valor inválido: ${raw}` };
    if (num < escala.min || num > escala.max) {
      return {
        error: `La nota debe estar entre ${escala.min} y ${escala.max}`,
      };
    }
    if (!matriculados.has(estudianteId)) continue;
    items.push({ estudianteId, valor: num });
  }

  if (items.length === 0) return { ok: true };

  await prisma.$transaction(
    items.map((it) =>
      prisma.nota.upsert({
        where: {
          estudianteId_cursoAsignaturaDocenteId_periodoId_corte: {
            estudianteId: it.estudianteId,
            cursoAsignaturaDocenteId: clase.id,
            periodoId,
            corte,
          },
        },
        create: {
          centroId,
          estudianteId: it.estudianteId,
          cursoAsignaturaDocenteId: clase.id,
          periodoId,
          corte,
          valor: it.valor,
          autorId: user.id,
        },
        update: { valor: it.valor, autorId: user.id },
      }),
    ),
  );

  await logAudit({
    centroId,
    usuarioId: user.id,
    accion: "SAVE",
    entidad: "Nota",
    descripcion: `${items.length} nota(s) en ${corte}`,
  });

  revalidatePath("/panel/notas");
  return { ok: true };
}
