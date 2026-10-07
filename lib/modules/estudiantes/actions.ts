"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hash } from "bcryptjs";
import { Rol } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";

const schema = z
  .object({
    id: z.string().optional(),
    nombre: z.string().trim().min(2, "Nombre requerido"),
    apellido: z.string().trim().optional(),
    email: z.string().trim().email("Correo inválido"),
    documento: z.string().trim().min(3, "Documento requerido"),
    password: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!value.id && value.password.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Contraseña: mínimo 6 caracteres",
        path: ["password"],
      });
    }
    if (value.id && value.password && value.password.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Contraseña: mínimo 6 caracteres",
        path: ["password"],
      });
    }
  });

export type FormState = { error?: string; ok?: boolean };

export async function saveEstudiante(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido") ?? "",
    email: formData.get("email"),
    documento: formData.get("documento"),
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, nombre, apellido, email, documento, password } = parsed.data;
  const centroId = user.centroId!;

  try {
    if (id) {
      await prisma.estudiante.update({
        where: { id, centroId },
        data: {
          documento,
          usuario: {
            update: {
              nombre,
              apellido: apellido ?? "",
              email,
              passwordHash: password ? await hash(password, 10) : undefined,
            },
          },
        },
      });
      await logAudit({
        centroId,
        usuarioId: user.id,
        accion: "UPDATE",
        entidad: "Estudiante",
        entidadId: id,
      });
    } else {
      const cuenta = await prisma.usuario.create({
        data: {
          centroId,
          email,
          nombre,
          apellido: apellido ?? "",
          rol: Rol.ESTUDIANTE,
          passwordHash: await hash(password, 10),
        },
      });
      const estudiante = await prisma.estudiante.create({
        data: { centroId, documento, usuarioId: cuenta.id },
      });
      await logAudit({
        centroId,
        usuarioId: user.id,
        accion: "CREATE",
        entidad: "Estudiante",
        entidadId: estudiante.id,
      });
    }
  } catch {
    return { error: "No se pudo guardar: ¿correo o documento duplicado?" };
  }

  revalidatePath("/panel/estudiantes");
  return { ok: true };
}

export async function deleteEstudiante(formData: FormData) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.estudiante.update({
    where: { id, centroId: user.centroId! },
    data: { estado: "baja", usuario: { update: { estado: "inactivo" } } },
  });
  await logAudit({
    centroId: user.centroId!,
    usuarioId: user.id,
    accion: "BAJA",
    entidad: "Estudiante",
    entidadId: id,
  });
  revalidatePath("/panel/estudiantes");
}