"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";
import type { FormState } from "@/lib/modules/form";

export type { FormState };

const schema = z.object({
  estudianteId: z.string().min(1, "Selecciona un estudiante"),
  cursoId: z.string().min(1, "Selecciona un curso"),
  periodoId: z.string().min(1, "Selecciona un período"),
});

export async function saveMatricula(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");
  const centroId = user.centroId;
  if (!centroId) return { error: "Tu cuenta no pertenece a un centro" };

  const parsed = schema.safeParse({
    estudianteId: formData.get("estudianteId"),
    cursoId: formData.get("cursoId"),
    periodoId: formData.get("periodoId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { estudianteId, cursoId, periodoId } = parsed.data;

  const [estudiante, curso, periodo] = await Promise.all([
    prisma.estudiante.findFirst({ where: { id: estudianteId, centroId } }),
    prisma.curso.findFirst({ where: { id: cursoId, centroId } }),
    prisma.periodo.findFirst({ where: { id: periodoId, centroId } }),
  ]);
  if (!estudiante || !curso || !periodo) {
    return { error: "Datos no válidos para tu centro" };
  }

  try {
    await prisma.matricula.create({
      data: { centroId, estudianteId, cursoId, periodoId },
    });
    await logAudit({
      centroId,
      usuarioId: user.id,
      accion: "CREATE",
      entidad: "Matricula",
    });
  } catch {
    return { error: "Ese estudiante ya está matriculado en ese curso y período" };
  }

  revalidatePath("/panel/matriculas");
  return { ok: true };
}

export async function deleteMatricula(formData: FormData) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");
  const centroId = user.centroId;
  const id = String(formData.get("id") ?? "");
  if (!centroId || !id) return;

  try {
    const matricula = await prisma.matricula.findFirst({
      where: { id, centroId },
    });
    if (!matricula) return;

    await prisma.matricula.delete({ where: { id } });
    await logAudit({
      centroId,
      usuarioId: user.id,
      accion: "DELETE",
      entidad: "Matricula",
      entidadId: id,
    });
  } catch {
    // FK restrict: la matrícula ya tiene notas
  }
  revalidatePath("/panel/matriculas");
}
