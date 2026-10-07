import { redirect } from "next/navigation";
import { auth } from "./index";
import type { Rol } from "@prisma/client";

export type SessionUser = {
  id: string;
  rol: Rol;
  centroId: string | null;
  name?: string | null;
  email?: string | null;
};

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/login");
  return {
    id: user.id,
    rol: user.rol as Rol,
    centroId: user.centroId,
    name: user.name,
    email: user.email,
  };
}

export async function requireRole(...roles: Rol[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.rol)) redirect("/panel");
  return user;
}