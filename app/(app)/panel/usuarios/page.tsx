import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { toggleUsuario } from "@/lib/modules/usuarios/actions";
import { UsuarioForm } from "./form";

const ROL_LABEL: Record<string, string> = {
  SUPERADMIN: "Superadministrador",
  RECTOR: "Rector(a)",
  COORDINADOR: "Coordinador(a)",
  ADMIN: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  PADRE: "Acudiente",
};

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const admin = await requireRole("RECTOR", "ADMIN");
  const { editar } = await searchParams;

  const [usuarios, editando] = await Promise.all([
    prisma.usuario.findMany({
      where: { centroId: admin.centroId ?? "" },
      orderBy: { nombre: "asc" },
    }),
    editar
      ? prisma.usuario.findFirst({
          where: { id: editar, centroId: admin.centroId ?? "" },
        })
      : null,
  ]);

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">ADMINISTRACIÓN</p>
          <h1>{editando ? `Editar: ${editando.nombre}` : "Usuarios"}</h1>
          <p>{usuarios.length} usuarios en el centro.</p>
        </div>
      </section>

      <section className="data-card mb-[15px]">
        <UsuarioForm
          key={editando?.id ?? "nuevo"}
          initial={
            editando
              ? {
                  id: editando.id,
                  nombre: editando.nombre,
                  apellido: editando.apellido,
                  email: editando.email,
                  rol: editando.rol,
                }
              : undefined
          }
        />
        {editando ? (
          <a
            href="/panel/usuarios"
            className="mt-3 inline-block text-[12px] text-primary hover:underline"
          >
            Cancelar edición
          </a>
        ) : null}
      </section>

      <section className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="font-medium">{u.nombre}</span>
                </td>
                <td className="text-muted">{u.email}</td>
                <td>{ROL_LABEL[u.rol] ?? u.rol}</td>
                <td>
                  <span
                    className={
                      u.estado === "activo" ? "text-success" : "text-danger"
                    }
                  >
                    {u.estado}
                  </span>
                </td>
                <td className="text-right">
                  {u.id === admin.id ? (
                    <span className="text-muted">(tú)</span>
                  ) : (
                    <>
                      <a
                        href={`/panel/usuarios?editar=${u.id}`}
                        className="chip-button"
                      >
                        Editar
                      </a>
                      <form action={toggleUsuario} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="estado" value={u.estado} />
                        <button
                          type="submit"
                          className="rounded-md border border-border px-2 py-1 text-[11px] text-muted hover:text-danger"
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