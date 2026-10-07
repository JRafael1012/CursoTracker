import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deleteAsignatura } from "@/lib/modules/asignaturas/actions";
import { AsignaturaForm } from "./form";

export default async function AsignaturasPage() {
  const user = await requireRole("ADMIN", "DOCENTE");

  const asignaturas = await prisma.asignatura.findMany({
    where: { centroId: user.centroId },
    orderBy: { nombre: "asc" },
    include: {
      _count: { select: { docentes: true, notas: true, cronogramas: true } },
    },
  });

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h1>Asignaturas</h1>
          <p>{asignaturas.length} asignaturas registradas en el centro.</p>
        </div>
      </section>

      <section className="data-card mb-[15px]">
        <AsignaturaForm />
      </section>

      <section className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Docentes asignados</th>
              <th>Notas</th>
              <th>Cronogramas</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-note">
                  Sin asignaturas aún.
                </td>
              </tr>
            ) : (
              asignaturas.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="font-medium">{a.nombre}</span>
                  </td>
                  <td>{a._count.docentes}</td>
                  <td>{a._count.notas}</td>
                  <td>{a._count.cronogramas}</td>
                  <td className="text-right">
                    <form action={deleteAsignatura} className="inline">
                      <input type="hidden" name="id" value={a.id} />
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