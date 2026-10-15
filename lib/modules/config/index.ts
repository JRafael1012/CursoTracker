import { prisma } from "@/lib/db";
import { parseConfigCalificacion, type ConfigCalificacion } from "./calificacion";

export * from "./calificacion";

export async function getConfigCalificacion(
  centroId: string,
): Promise<ConfigCalificacion> {
  const centro = await prisma.centro.findUnique({
    where: { id: centroId },
    select: { config: true },
  });
  return parseConfigCalificacion(centro?.config);
}
