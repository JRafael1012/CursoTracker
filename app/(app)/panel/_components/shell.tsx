"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/modules/auth/actions";
import { Icon, type IconName } from "@/components/icon";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  roles?: string[];
};

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "MENÚ PRINCIPAL",
    items: [
      { href: "/panel", label: "Mi inicio", icon: "grid" },
      {
        href: "/panel/estudiantes",
        label: "Estudiantes",
        icon: "students",
        roles: ["ADMIN", "DOCENTE"],
      },
      { href: "/panel/cursos", label: "Cursos", icon: "book" },
      {
        href: "/panel/asignaturas",
        label: "Asignaturas",
        icon: "chart",
        roles: ["ADMIN", "DOCENTE"],
      },
      {
        href: "/panel/periodos",
        label: "Períodos",
        icon: "calendar",
        roles: ["ADMIN", "DOCENTE"],
      },
    ],
  },
  {
    label: "ADMINISTRACIÓN",
    items: [
      {
        href: "/panel/usuarios",
        label: "Usuarios",
        icon: "settings",
        roles: ["ADMIN"],
      },
    ],
  },
];

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Rector / Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  PADRE: "Acudiente",
};

function initials(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Shell({
  user,
  centroNombre,
  children,
}: {
  user: { name?: string | null; email?: string | null; rol: string };
  centroNombre: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const nombre = user.name ?? user.email ?? "";
  const rolLabel = ROL_LABEL[user.rol] ?? user.rol;
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.roles || item.roles.includes(user.rol),
    ),
  })).filter((group) => group.items.length > 0);

  const isActive = (href: string) =>
    href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/logor.png" alt="CursoTracker" className="h-9 w-auto" />
          <div>
            <strong>{centroNombre}</strong>
            <small>Panel académico</small>
          </div>
          <button
            className="icon-button sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          {groups.map((group, index) => (
            <div key={group.label}>
              <p className={`nav-label ${index > 0 ? "mt-7" : ""}`}>
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                  {isActive(item.href) && <span className="active-line" />}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="upgrade-card">
          <div className="upgrade-icon">
            <Icon name="trend" size={18} />
          </div>
          <strong>{centroNombre}</strong>
          <p>Gestión de estudiantes, cursos, notas y reportes del centro.</p>
        </div>

        <div className="user-card">
          <div className="avatar avatar-admin">{initials(nombre)}</div>
          <div className="min-w-0">
            <strong className="truncate">{nombre}</strong>
            <span>{rolLabel}</span>
          </div>
          <form action={logoutAction} className="ml-auto">
            <button className="plain-button" aria-label="Cerrar sesión">
              <Icon name="logout" size={18} />
            </button>
          </form>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Icon name="menu" />
          </button>
          <div className="search-box">
            <Icon name="search" size={19} />
            <input
              aria-label="Buscar"
              placeholder="Buscar estudiantes, cursos..."
            />
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button notification-button"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notificaciones"
            >
              <Icon name="bell" />
            </button>
            <div className="compact-profile">
              <div className="avatar avatar-admin">{initials(nombre)}</div>
              <div className="max-sm:hidden">
                <strong>{nombre.split(" ")[0]}</strong>
                <span>{rolLabel}</span>
              </div>
              <Icon name="chevron" size={15} />
            </div>
          </div>
          {notifOpen && (
            <div className="notification-popover">
              <div className="popover-head">
                <strong>Notificaciones</strong>
              </div>
              <p>Sin novedades por ahora.</p>
            </div>
          )}
        </header>
        {children}
      </main>
    </div>
  );
}