import { requireUser } from "@/lib/modules/auth/session";

export default async function PanelPage() {
  const user = await requireUser();

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h1 className="mb-2 text-xl font-bold text-text">
        Bienvenido, {user.name}
      </h1>
      <p className="text-sm text-text-sec">
        Sesión activa — rol <strong className="text-text">{user.rol}</strong>,
        centro #{user.centroId}.
      </p>
      <p className="mt-4 text-sm text-text-sec">
        Módulos (estudiantes, cursos, notas, reportes) se construyen en M2–M4.
      </p>
    </section>
  );
}
