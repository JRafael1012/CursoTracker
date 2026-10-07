import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deleteCurso } from "@/lib/modules/cursos/actions";
import { CursoForm } from "./form";

export default async function CursosPage() {
  const user = await requireRole("ADMIN", "DOCENTE");

  const cursos = await prisma.curso.findMany({
    where: { centroId: user.centroId },
    orderBy: { nombre: "asc" },
    include: {
      _count: { select: { matriculas: true, asignaturaDocentes: true } },
    },
  });

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h1>Cursos</h1>
          <p>{cursos.length} cursos registrados en el centro.</p>
        </div>
      </section>

      <section className="data-card mb-[15px]">
        <CursoForm />
      </section>

      <section className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Nivel</th>
              <th>Matriculados</th>
              <th>Asignaciones</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-note">
                  Sin cursos aún.
                </td>
              </tr>
            ) : (
              cursos.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="font-medium">{c.nombre}</span>
                  </td>
                  <td className="text-muted">{c.nivel || "—"}</td>
                  <td>{c._count.matriculas}</td>
                  <td>{c._count.asignaturaDocentes}</td>
                  <td className="text-right">
                    <form action={deleteCurso} className="inline">
                      <input type="hidden" name="id" value={c.id} />
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