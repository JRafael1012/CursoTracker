import { prisma } from "@/lib/db";

export async function logAudit(input: {
  centroId: string;
  usuarioId: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  descripcion?: string;
  ip?: string;
}) {
  await prisma.auditLog.create({
    data: {
      centroId: input.centroId,
      usuarioId: input.usuarioId,
      accion: input.accion,
      entidad: input.entidad,
      entidadId: input.entidadId ?? "",
      descripcion: input.descripcion ?? "",
      ip: input.ip ?? "",
    },
  });
}