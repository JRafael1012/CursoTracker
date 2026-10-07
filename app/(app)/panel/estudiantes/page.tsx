import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deleteEstudiante } from "@/lib/modules/estudiantes/actions";
import { EstudianteForm } from "./form";

export default async function EstudiantesPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId ?? "";
  const { editar } = await searchParams;

  const [estudiantes, editando] = await Promise.all([
    prisma.estudiante.findMany({
      where: { centroId, estado: "activo" },
      orderBy: { createdAt: "asc" },
      include: {
        usuario: { select: { nombre: true, apellido: true, email: true } },
        _count: { select: { matriculas: true, notas: true } },
      },
    }),
    editar
      ? prisma.estudiante.findFirst({
          where: { id: editar, centroId },
          include: { usuario: true },
        })
      : null,
  ]);

  const nombreCompleto = (nombre: string, apellido: string) =>
    [nombre, apellido].filter(Boolean).join(" ");

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h1>
            {editando
              ? `Editar: ${nombreCompleto(editando.usuario.nombre, editando.usuario.apellido)}`
              : "Estudiantes"}
          </h1>
          <p>{estudiantes.length} estudiantes activos en el centro.</p>
        </div>
      </section>

      <section className="data-card mb-[15px]">
        <EstudianteForm
          key={editando?.id ?? "nuevo"}
          initial={
            editando
              ? {
                  id: editando.id,
                  nombre: editando.usuario.nombre,
                  apellido: editando.usuario.apellido,
                  email: editando.usuario.email,
                  documento: editando.documento,
                }
              : {}
          }
        />
        {editando ? (
          <a
            href="/panel/estudiantes"
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
              <th>Documento</th>
              <th>Cursos</th>
              <th>Notas</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-note">
                  Sin estudiantes aún. Agrega el primero arriba.
                </td>
              </tr>
            ) : (
              estudiantes.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className="font-medium">
                      {nombreCompleto(e.usuario.nombre, e.usuario.apellido)}
                    </span>
                  </td>
                  <td className="text-muted">{e.usuario.email}</td>
                  <td className="text-muted">{e.documento}</td>
                  <td>{e._count.matriculas}</td>
                  <td>{e._count.notas}</td>
                  <td className="text-right">
                    <a
                      href={`/panel/estudiantes?editar=${e.id}`}
                      className="chip-button"
                    >
                      Editar
                    </a>
                    <form action={deleteEstudiante} className="inline">
                      <input type="hidden" name="id" value={e.id} />
                      <button type="submit" className="chip-button-danger">
                        Dar de baja
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}