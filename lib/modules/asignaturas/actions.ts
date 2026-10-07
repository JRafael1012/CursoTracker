"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";

const schema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido"),
});

export type FormState = { error?: string; ok?: boolean };

export async function saveAsignatura(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("ADMIN");

  const parsed = schema.safeParse({ nombre: formData.get("nombre") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.asignatura.create({
      data: { centroId: user.centroId, nombre: parsed.data.nombre },
    });
    await logAudit({
      centroId: user.centroId,
      usuarioId: Number(user.id),
      accion: "CREATE",
      entidad: "Asignatura",
    });
  } catch {
    return { error: "No se pudo guardar: ¿asignatura duplicada?" };
  }

  revalidatePath("/panel/asignaturas");
  return { ok: true };
}

export async function deleteAsignatura(formData: FormData) {
  const user = await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;

  try {
    await prisma.asignatura.delete({ where: { id, centroId: user.centroId } });
    await logAudit({
      centroId: user.centroId,
      usuarioId: Number(user.id),
      accion: "DELETE",
      entidad: "Asignatura",
      entidadId: id,
    });
  } catch {
    // FK restrict: la asignatura tiene notas/docentes
  }
  revalidatePath("/panel/asignaturas");
}
