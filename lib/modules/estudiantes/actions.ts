"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";

const schema = z.object({
  id: z.coerce.number().optional(),
  nombre: z.string().trim().min(2, "Nombre demasiado corto"),
  documento: z.string().trim().min(3, "Documento requerido"),
});

export type FormState = { error?: string; ok?: boolean };

export async function saveEstudiante(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("ADMIN", "DOCENTE");

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    nombre: formData.get("nombre"),
    documento: formData.get("documento"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, nombre, documento } = parsed.data;

  try {
    if (id) {
      await prisma.estudiante.update({
        where: { id, centroId: user.centroId },
        data: { nombre, documento },
      });
      await logAudit({
        centroId: user.centroId,
        usuarioId: Number(user.id),
        accion: "UPDATE",
        entidad: "Estudiante",
        entidadId: id,
      });
    } else {
      await prisma.estudiante.create({
        data: { centroId: user.centroId, nombre, documento },
      });
      await logAudit({
        centroId: user.centroId,
        usuarioId: Number(user.id),
        accion: "CREATE",
        entidad: "Estudiante",
      });
    }
  } catch {
    return { error: "No se pudo guardar: ¿documento duplicado?" };
  }

  revalidatePath("/panel/estudiantes");
  return { ok: true };
}

export async function deleteEstudiante(formData: FormData) {
  const user = await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.estudiante.update({
    where: { id, centroId: user.centroId },
    data: { estado: "baja" },
  });
  await logAudit({
    centroId: user.centroId,
    usuarioId: Number(user.id),
    accion: "BAJA",
    entidad: "Estudiante",
    entidadId: id,
  });
  revalidatePath("/panel/estudiantes");
}
