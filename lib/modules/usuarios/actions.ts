"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";

const ROLES = [
  "RECTOR",
  "ADMIN",
  "COORDINADOR",
  "DOCENTE",
  "ESTUDIANTE",
  "PADRE",
] as const;

const schema = z
  .object({
    id: z.string().optional(),
    nombre: z.string().trim().min(2, "Nombre requerido"),
    apellido: z.string().trim().optional(),
    email: z.string().trim().email("Correo inválido"),
    password: z.string(),
    rol: z.enum(ROLES),
  })
  .superRefine((value, ctx) => {
    if (!value.id && value.password.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Mínimo 6 caracteres",
        path: ["password"],
      });
    }
    if (value.id && value.password && value.password.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Mínimo 6 caracteres",
        path: ["password"],
      });
    }
  });

export type FormState = { error?: string; ok?: boolean };

export async function saveUsuario(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireRole("RECTOR", "ADMIN");

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido") ?? "",
    email: formData.get("email"),
    password: formData.get("password") ?? "",
    rol: formData.get("rol"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, nombre, apellido, email, password, rol } = parsed.data;
  const centroId = admin.centroId!;

  try {
    if (id) {
      await prisma.usuario.update({
        where: { id, centroId },
        data: {
          nombre,
          apellido: apellido ?? "",
          email,
          rol,
          passwordHash: password ? await hash(password, 10) : undefined,
        },
      });
      await logAudit({
        centroId,
        usuarioId: admin.id,
        accion: "UPDATE",
        entidad: "Usuario",
        entidadId: id,
      });
    } else {
      await prisma.usuario.create({
        data: {
          centroId,
          nombre,
          apellido: apellido ?? "",
          email,
          rol,
          passwordHash: await hash(password, 10),
        },
      });
      await logAudit({
        centroId,
        usuarioId: admin.id,
        accion: "CREATE",
        entidad: "Usuario",
      });
    }
  } catch {
    return { error: "No se pudo guardar: ¿correo ya registrado?" };
  }

  revalidatePath("/panel/usuarios");
  return { ok: true };
}

export async function toggleUsuario(formData: FormData) {
  const admin = await requireRole("RECTOR", "ADMIN");
  const id = String(formData.get("id") ?? "");
  const estado = String(formData.get("estado"));
  if (!id || id === admin.id) return;

  await prisma.usuario.update({
    where: { id, centroId: admin.centroId! },
    data: { estado: estado === "activo" ? "inactivo" : "activo" },
  });
  await logAudit({
    centroId: admin.centroId!,
    usuarioId: admin.id,
    accion: estado === "activo" ? "SUSPENDER" : "REACTIVAR",
    entidad: "Usuario",
    entidadId: id,
  });
  revalidatePath("/panel/usuarios");
}