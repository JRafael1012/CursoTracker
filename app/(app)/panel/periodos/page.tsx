import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deletePeriodo } from "@/lib/modules/periodos/actions";
import { PeriodoForm } from "./form";

export default async function PeriodosPage() {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR");

  const periodos = await prisma.periodo.findMany({
    where: { centroId: user.centroId ?? "" },
    orderBy: { fechaInicio: "asc" },
    include: { _count: { select: { notas: true, matriculas: true } } },
  });

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h1>Períodos</h1>
          <p>{periodos.length} períodos definidos en el centro.</p>
        </div>
      </section>

      <section className="data-card mb-[15px]">
        <PeriodoForm />
      </section>

      <section className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Matrículas</th>
              <th>Notas</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodos.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-note">
                  Sin períodos aún.
                </td>
              </tr>
            ) : (
              periodos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-medium">{p.nombre}</span>
                  </td>
                  <td className="text-muted">
                    {new Intl.DateTimeFormat("es", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(p.fechaInicio)}
                  </td>
                  <td className="text-muted">
                    {new Intl.DateTimeFormat("es", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(p.fechaFin)}
                  </td>
                  <td>{p._count.matriculas}</td>
                  <td>{p._count.notas}</td>
                  <td className="text-right">
                    <form action={deletePeriodo} className="inline">
                      <input type="hidden" name="id" value={p.id} />
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