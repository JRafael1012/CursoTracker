import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/modules/auth/session";
import { logoutAction } from "@/lib/modules/auth/actions";

const NAV: {
  href: string;
  label: string;
  roles: string[] | null;
}[] = [
  { href: "/panel", label: "Inicio", roles: null },
  { href: "/panel/estudiantes", label: "Estudiantes", roles: null },
  { href: "/panel/cursos", label: "Cursos", roles: null },
  { href: "/panel/periodos", label: "Períodos", roles: null },
  { href: "/panel/asignaturas", label: "Asignaturas", roles: null },
  { href: "/panel/usuarios", label: "Usuarios", roles: ["ADMIN"] },
];

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/panel" className="flex items-center gap-2">
            <Image
              src="/logo/logor.png"
              alt="CursoTracker"
              width={31}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="text-lg font-bold text-primary">CursoTracker</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text">
              {user.name} <span className="text-text-sec">({user.rol})</span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-border px-3 py-1.5 text-text-sec hover:text-danger"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 pb-2">
          {NAV.filter(
            (item) => !item.roles || item.roles.includes(user.rol),
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-text-sec hover:bg-bg hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
