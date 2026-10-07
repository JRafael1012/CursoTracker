import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/modules/auth/session";
import { Shell } from "./_components/shell";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const user = await requireUser();
const centro = user.centroId
    ? await prisma.centro.findUnique({ where: { id: user.centroId } })
    : null;

  return (
    <Shell
      user={{ name: user.name, email: user.email, rol: user.rol }}
      centroNombre={centro?.nombre ?? "Mi centro"}
    >
      {children}
    </Shell>
  );
}