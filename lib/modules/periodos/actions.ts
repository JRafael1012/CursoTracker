"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";

const schema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido"),
  fechaInicio: z.string().min(1, "Fecha de inicio requerida"),
  fechaFin: z.string().min(1, "Fecha de fin requerida"),
});

export type FormState = { error?: string; ok?: boolean };

export async function savePeriodo(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");

  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { nombre, fechaInicio, fechaFin } = parsed.data;
  if (new Date(fechaFin) <= new Date(fechaInicio)) {
    return { error: "La fecha de fin debe ser posterior al inicio" };
  }

  try {
    await prisma.periodo.create({
      data: {
        centroId: user.centroId!,
        nombre,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
      },
    });
    await logAudit({
      centroId: user.centroId!,
      usuarioId: user.id,
      accion: "CREATE",
      entidad: "Periodo",
    });
  } catch {
    return { error: "No se pudo guardar: ¿período duplicado?" };
  }

  revalidatePath("/panel/periodos");
  return { ok: true };
}

export async function deletePeriodo(formData: FormData) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.periodo.delete({ where: { id, centroId: user.centroId! } });
    await logAudit({
      centroId: user.centroId!,
      usuarioId: user.id,
      accion: "DELETE",
      entidad: "Periodo",
      entidadId: id,
    });
  } catch {
    // FK restrict: el período ya tiene notas
  }
  revalidatePath("/panel/periodos");
}