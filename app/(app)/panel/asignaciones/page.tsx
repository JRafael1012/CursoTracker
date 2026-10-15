import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deleteAsignacion } from "@/lib/modules/asignaciones/actions";
import { AsignacionForm } from "./form";

export default async function AsignacionesPage() {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId ?? "";
  const canManage = ["RECTOR", "ADMIN", "COORDINADOR"].includes(user.rol);

  const [cursos, asignaturas, docentes, asignaciones] = await Promise.all([
    prisma.curso.findMany({
      where: { centroId },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.asignatura.findMany({
      where: { centroId },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.usuario.findMany({
      where: { centroId, rol: "DOCENTE", estado: "activo" },
      orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
      select: { id: true, nombre: true, apellido: true },
    }),
    prisma.cursoAsignaturaDocente.findMany({
      where: { curso: { centroId } },
      include: {
        curso: { select: { nombre: true } },
        asignatura: { select: { nombre: true } },
        docente: { select: { nombre: true, apellido: true } },
      },
    }),
  ]);

  asignaciones.sort(
    (a, b) =>
      a.curso.nombre.localeCompare(b.curso.nombre) ||
      a.asignatura.nombre.localeCompare(b.asignatura.nombre) ||
      `${a.docente.nombre} ${a.docente.apellido}`.localeCompare(
        `${b.docente.nombre} ${b.docente.apellido}`,
      ),
  );

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h1>Asignaciones</h1>
          <p>
            {asignaciones.length} asignaciones docente–asignatura–curso en el
            centro.
          </p>
        </div>
      </section>

      {canManage && (
        <section className="data-card mb-[15px]">
          <AsignacionForm
            cursos={cursos}
            asignaturas={asignaturas}
            docentes={docentes}
          />
        </section>
      )}

      <section className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Asignatura</th>
              <th>Docente</th>
              {canManage && <th className="text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {asignaciones.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="empty-note">
                  Sin asignaciones aún.
                </td>
              </tr>
            ) : (
              asignaciones.map((a) => (
                <tr key={a.id}>
                  <td>{a.curso.nombre}</td>
                  <td>{a.asignatura.nombre}</td>
                  <td>
                    {a.docente.nombre} {a.docente.apellido}
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <form action={deleteAsignacion} className="inline">
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="chip-button-danger">
                          Eliminar
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
