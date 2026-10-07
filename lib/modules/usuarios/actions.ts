"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";

const ROLES = ["ADMIN", "DOCENTE", "ESTUDIANTE", "PADRE"] as const;

const schema = z
  .object({
    id: z.coerce.number().optional(),
    nombre: z.string().trim().min(2, "Nombre requerido"),
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
  const admin = await requireRole("ADMIN");

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    rol: formData.get("rol"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, nombre, email, password, rol } = parsed.data;

  try {
    if (id) {
      await prisma.usuario.update({
        where: { id, centroId: admin.centroId },
        data: {
          nombre,
          email,
          rol,
          passwordHash: password ? await hash(password, 10) : undefined,
        },
      });
      await logAudit({
        centroId: admin.centroId,
        usuarioId: Number(admin.id),
        accion: "UPDATE",
        entidad: "Usuario",
        entidadId: id,
      });
    } else {
      await prisma.usuario.create({
        data: {
          centroId: admin.centroId,
          nombre,
          email,
          rol,
          passwordHash: await hash(password, 10),
        },
      });
      await logAudit({
        centroId: admin.centroId,
        usuarioId: Number(admin.id),
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
  const admin = await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  const estado = String(formData.get("estado"));
  if (!id || id === Number(admin.id)) return;

  await prisma.usuario.update({
    where: { id, centroId: admin.centroId },
    data: { estado: estado === "activo" ? "inactivo" : "activo" },
  });
  await logAudit({
    centroId: admin.centroId,
    usuarioId: Number(admin.id),
    accion: estado === "activo" ? "SUSPENDER" : "REACTIVAR",
    entidad: "Usuario",
    entidadId: id,
  });
  revalidatePath("/panel/usuarios");
}
