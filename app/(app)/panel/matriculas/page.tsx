import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deleteMatricula } from "@/lib/modules/matriculas/actions";
import { MatriculaForm } from "./form";

export default async function MatriculasPage() {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");
  const centroId = user.centroId ?? "";

  const [estudiantes, cursos, periodos, matriculas] = await Promise.all([
    prisma.estudiante.findMany({
      where: { centroId },
      select: {
        id: true,
        usuario: { select: { nombre: true, apellido: true } },
      },
    }),
    prisma.curso.findMany({
      where: { centroId },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.periodo.findMany({
      where: { centroId },
      orderBy: { fechaInicio: "desc" },
      select: { id: true, nombre: true },
    }),
    prisma.matricula.findMany({
      where: { centroId },
      include: {
        estudiante: {
          select: { usuario: { select: { nombre: true, apellido: true } } },
        },
        curso: { select: { nombre: true } },
        periodo: { select: { nombre: true } },
      },
    }),
  ]);

  estudiantes.sort((a, b) =>
    `${a.usuario.nombre} ${a.usuario.apellido}`.localeCompare(
      `${b.usuario.nombre} ${b.usuario.apellido}`,
    ),
  );
  matriculas.sort(
    (a, b) =>
      a.curso.nombre.localeCompare(b.curso.nombre) ||
      a.periodo.nombre.localeCompare(b.periodo.nombre) ||
      `${a.estudiante.usuario.nombre} ${a.estudiante.usuario.apellido}`.localeCompare(
        `${b.estudiante.usuario.nombre} ${b.estudiante.usuario.apellido}`,
      ),
  );

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h1>Matrículas</h1>
          <p>{matriculas.length} matrículas registradas en el centro.</p>
        </div>
      </section>

      <section className="data-card mb-[15px]">
        <MatriculaForm
          estudiantes={estudiantes}
          cursos={cursos}
          periodos={periodos}
        />
      </section>

      <section className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Período</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matriculas.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-note">
                  Sin matrículas aún.
                </td>
              </tr>
            ) : (
              matriculas.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.estudiante.usuario.nombre} {m.estudiante.usuario.apellido}
                  </td>
                  <td>{m.curso.nombre}</td>
                  <td>{m.periodo.nombre}</td>
                  <td className="text-right">
                    <form action={deleteMatricula} className="inline">
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="chip-button-danger">
                        Eliminar
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
