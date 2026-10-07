import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deleteCurso } from "@/lib/modules/cursos/actions";
import { CursoForm } from "./form";

export default async function CursosPage() {
  const user = await requireRole("ADMIN", "DOCENTE");

  const cursos = await prisma.curso.findMany({
    where: { centroId: user.centroId },
    orderBy: { nombre: "asc" },
    include: { _count: { select: { matriculas: true, asignaturaDocentes: true } } },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="mb-4 text-xl font-bold text-text">Cursos</h1>
        <CursoForm />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-sec">
              <th className="py-2">Nombre</th>
              <th className="py-2">Nivel</th>
              <th className="py-2">Matriculados</th>
              <th className="py-2">Asignaciones</th>
              <th className="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-text-sec">
                  Sin cursos aún.
                </td>
              </tr>
            ) : (
              cursos.map((c) => (
                <tr key={c.id} className="border-b border-border text-text">
                  <td className="py-2">{c.nombre}</td>
                  <td className="py-2">{c.nivel || "—"}</td>
                  <td className="py-2">{c._count.matriculas}</td>
                  <td className="py-2">{c._count.asignaturaDocentes}</td>
                <td className="py-2 text-right">
                  <form action={deleteCurso} className="inline">
                    <input type="hidden" name="id" value={c.id} />
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
