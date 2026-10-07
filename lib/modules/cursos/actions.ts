"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";

const schema = z.object({
  id: z.coerce.number().optional(),
  nombre: z.string().trim().min(2, "Nombre demasiado corto"),
  nivel: z.string().trim().default(""),
});

export type FormState = { error?: string; ok?: boolean };

export async function saveCurso(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("ADMIN", "DOCENTE");

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    nombre: formData.get("nombre"),
    nivel: formData.get("nivel") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, nombre, nivel } = parsed.data;

  try {
    if (id) {
      await prisma.curso.update({
        where: { id, centroId: user.centroId },
        data: { nombre, nivel },
      });
      await logAudit({
        centroId: user.centroId,
        usuarioId: Number(user.id),
        accion: "UPDATE",
        entidad: "Curso",
        entidadId: id,
      });
    } else {
      await prisma.curso.create({
        data: { centroId: user.centroId, nombre, nivel },
      });
      await logAudit({
        centroId: user.centroId,
        usuarioId: Number(user.id),
        accion: "CREATE",
        entidad: "Curso",
      });
    }
  } catch {
    return { error: "No se pudo guardar: ¿curso duplicado en el centro?" };
  }

  revalidatePath("/panel/cursos");
  return { ok: true };
}

export async function deleteCurso(formData: FormData) {
  const user = await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;

  try {
    await prisma.curso.delete({ where: { id, centroId: user.centroId } });
    await logAudit({
      centroId: user.centroId,
      usuarioId: Number(user.id),
      accion: "DELETE",
      entidad: "Curso",
      entidadId: id,
    });
  } catch {
    // FK restrict: el curso tiene matriculados/notas
  }
  revalidatePath("/panel/cursos");
}
