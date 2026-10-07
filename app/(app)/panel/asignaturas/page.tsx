import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deleteAsignatura } from "@/lib/modules/asignaturas/actions";
import { AsignaturaForm } from "./form";

export default async function AsignaturasPage() {
  const user = await requireRole("ADMIN");

  const asignaturas = await prisma.asignatura.findMany({
    where: { centroId: user.centroId },
    orderBy: { nombre: "asc" },
    include: { _count: { select: { docentes: true, notas: true } } },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="mb-4 text-xl font-bold text-text">Asignaturas</h1>
        <AsignaturaForm />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-sec">
              <th className="py-2">Nombre</th>
              <th className="py-2">Docentes asignados</th>
              <th className="py-2">Notas</th>
              <th className="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-text-sec">
                  Sin asignaturas aún.
                </td>
              </tr>
            ) : (
              asignaturas.map((a) => (
                <tr key={a.id} className="border-b border-border text-text">
                  <td className="py-2">{a.nombre}</td>
                  <td className="py-2">{a._count.docentes}</td>
                  <td className="py-2">{a._count.notas}</td>
                  <td className="py-2 text-right">
                    <form action={deleteAsignatura} className="inline">
                      <input type="hidden" name="id" value={a.id} />
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
