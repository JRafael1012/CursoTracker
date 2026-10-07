import { redirect } from "next/navigation";
import { auth } from "./index";

export type SessionUser = {
  id: string;
  rol: string;
  centroId: number;
  name?: string | null;
  email?: string | null;
};

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.rol)) redirect("/panel");
  return user;
}
