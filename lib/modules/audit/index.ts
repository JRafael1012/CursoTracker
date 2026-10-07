import { prisma } from "@/lib/db";

export async function logAudit(params: {
  centroId: number;
  usuarioId: number;
  accion: string;
  entidad: string;
  entidadId?: string | number;
}) {
  await prisma.auditLog.create({
    data: {
      centroId: params.centroId,
      usuarioId: params.usuarioId,
      accion: params.accion,
      entidad: params.entidad,
      entidadId: String(params.entidadId ?? ""),
    },
  });
}
