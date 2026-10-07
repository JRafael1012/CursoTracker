import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { toggleUsuario } from "@/lib/modules/usuarios/actions";
import { UsuarioForm } from "./form";

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  PADRE: "Padre",
};

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const admin = await requireRole("ADMIN");
  const { editar } = await searchParams;

  const [usuarios, editando] = await Promise.all([
    prisma.usuario.findMany({
      where: { centroId: admin.centroId },
      orderBy: { nombre: "asc" },
    }),
    editar
      ? prisma.usuario.findFirst({
          where: { id: Number(editar), centroId: admin.centroId },
        })
      : null,
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="mb-4 text-xl font-bold text-text">
          {editando ? `Editar: ${editando.nombre}` : "Usuarios"}
        </h1>
        <UsuarioForm
          key={editando?.id ?? "nuevo"}
          initial={
            editando
              ? { id: editando.id, nombre: editando.nombre, email: editando.email, rol: editando.rol }
              : undefined
          }
        />
        {editando ? (
          <a
            href="/panel/usuarios"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            Cancelar edición
          </a>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-sec">
              <th className="py-2">Nombre</th>
              <th className="py-2">Correo</th>
              <th className="py-2">Rol</th>
              <th className="py-2">Estado</th>
              <th className="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-border text-text">
                <td className="py-2">{u.nombre}</td>
                <td className="py-2">{u.email}</td>
                <td className="py-2">{ROL_LABEL[u.rol] ?? u.rol}</td>
                <td className="py-2">
                  <span
                    className={
                      u.estado === "activo" ? "text-success" : "text-danger"
                    }
                  >
                    {u.estado}
                  </span>
                </td>
                <td className="py-2 text-right">
                  {u.id === Number(admin.id) ? (
                    <span className="text-text-sec">(tú)</span>
                  ) : (
                    <>
                      <a
                        href={`/panel/usuarios?editar=${u.id}`}
                        className="mr-2 rounded-md border border-border px-2 py-1 text-primary hover:bg-bg"
                      >
                        Editar
                      </a>
                      <form action={toggleUsuario} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="estado" value={u.estado} />
                        <button
                          type="submit"
                          className="rounded-md border border-border px-2 py-1 text-text-sec hover:text-danger"
                        >
                          {u.estado === "activo" ? "Suspender" : "Reactivar"}
                        </button>
                      </form>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
