"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";
import type { FormState } from "@/lib/modules/form";

export type { FormState };

const schema = z.object({
  cursoId: z.string().min(1, "Selecciona un curso"),
  asignaturaId: z.string().min(1, "Selecciona una asignatura"),
  docenteId: z.string().min(1, "Selecciona un docente"),
});

export async function saveAsignacion(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");
  const centroId = user.centroId;
  if (!centroId) return { error: "Tu cuenta no pertenece a un centro" };

  const parsed = schema.safeParse({
    cursoId: formData.get("cursoId"),
    asignaturaId: formData.get("asignaturaId"),
    docenteId: formData.get("docenteId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { cursoId, asignaturaId, docenteId } = parsed.data;

  const [curso, asignatura, docente] = await Promise.all([
    prisma.curso.findFirst({ where: { id: cursoId, centroId } }),
    prisma.asignatura.findFirst({ where: { id: asignaturaId, centroId } }),
    prisma.usuario.findFirst({
      where: { id: docenteId, centroId, rol: "DOCENTE" },
    }),
  ]);
  if (!curso || !asignatura) return { error: "Curso o asignatura no válidos" };
  if (!docente) return { error: "El docente seleccionado no es válido" };

  try {
    await prisma.cursoAsignaturaDocente.create({
      data: { cursoId, asignaturaId, docenteId },
    });
    await logAudit({
      centroId,
      usuarioId: user.id,
      accion: "CREATE",
      entidad: "CursoAsignaturaDocente",
    });
  } catch {
    return { error: "Esa asignación ya existe" };
  }

  revalidatePath("/panel/asignaciones");
  return { ok: true };
}

export async function deleteAsignacion(formData: FormData) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");
  const centroId = user.centroId;
  const id = String(formData.get("id") ?? "");
  if (!centroId || !id) return;

  try {
    const asignacion = await prisma.cursoAsignaturaDocente.findFirst({
      where: { id, curso: { centroId } },
    });
    if (!asignacion) return;

    await prisma.cursoAsignaturaDocente.delete({ where: { id } });
    await logAudit({
      centroId,
      usuarioId: user.id,
      accion: "DELETE",
      entidad: "CursoAsignaturaDocente",
      entidadId: id,
    });
  } catch {
    // FK restrict: la asignación ya tiene notas
  }
  revalidatePath("/panel/asignaciones");
}
