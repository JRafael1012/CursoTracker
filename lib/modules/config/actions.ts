"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";
import { CORTES_MAX, ESCALAS, ESCALA_KEYS } from "./calificacion";

const schema = z.object({
  escala: z.enum(ESCALA_KEYS),
  notaAprobatoria: z.coerce.number(),
});

export type FormState = { error?: string; ok?: boolean };

export async function saveConfigCalificacion(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("RECTOR", "ADMIN");
  if (!user.centroId) return { error: "Tu cuenta no pertenece a un centro" };

  const parsed = schema.safeParse({
    escala: formData.get("escala"),
    notaAprobatoria: formData.get("notaAprobatoria"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const cortes = formData
    .getAll("corte")
    .map((c) => String(c).trim())
    .filter(Boolean);
  if (cortes.length === 0) return { error: "Define al menos un corte" };
  if (cortes.length > CORTES_MAX) {
    return { error: `Máximo ${CORTES_MAX} cortes por período` };
  }

  const { escala, notaAprobatoria } = parsed.data;
  const rango = ESCALAS[escala];
  if (notaAprobatoria < rango.min || notaAprobatoria > rango.max) {
    return {
      error: `La nota de aprobación debe estar entre ${rango.min} y ${rango.max}`,
    };
  }

  try {
    await prisma.centro.update({
      where: { id: user.centroId },
      data: { config: { escala, notaAprobatoria, cortes } },
    });
    await logAudit({
      centroId: user.centroId,
      usuarioId: user.id,
      accion: "UPDATE",
      entidad: "ConfigCalificacion",
      descripcion: `escala=${escala}, aprueba=${notaAprobatoria}, cortes=${cortes.length}`,
    });
  } catch {
    return { error: "No se pudo guardar la configuración" };
  }

  revalidatePath("/panel/configuracion");
  return { ok: true };
}
