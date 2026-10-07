import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deletePeriodo } from "@/lib/modules/periodos/actions";
import { PeriodoForm } from "./form";

export default async function PeriodosPage() {
  const user = await requireRole("ADMIN");

  const periodos = await prisma.periodo.findMany({
    where: { centroId: user.centroId },
    orderBy: { fechaInicio: "desc" },
    include: { _count: { select: { notas: true } } },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="mb-4 text-xl font-bold text-text">Períodos académicos</h1>
        <PeriodoForm />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-sec">
              <th className="py-2">Nombre</th>
              <th className="py-2">Inicio</th>
              <th className="py-2">Fin</th>
              <th className="py-2">Notas cargadas</th>
              <th className="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodos.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-text-sec">
                  Sin períodos aún.
                </td>
              </tr>
            ) : (
              periodos.map((p) => (
                <tr key={p.id} className="border-b border-border text-text">
                  <td className="py-2">{p.nombre}</td>
                  <td className="py-2">
                    {p.fechaInicio.toLocaleDateString("es")}
                  </td>
                  <td className="py-2">{p.fechaFin.toLocaleDateString("es")}</td>
                  <td className="py-2">{p._count.notas}</td>
                  <td className="py-2 text-right">
                    <form action={deletePeriodo} className="inline">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-border px-2 py-1 text-danger hover:bg-danger/10"
                      >
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
