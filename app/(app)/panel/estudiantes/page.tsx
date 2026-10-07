import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { deleteEstudiante } from "@/lib/modules/estudiantes/actions";
import { EstudianteForm } from "./form";

export default async function EstudiantesPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const user = await requireRole("ADMIN", "DOCENTE");
  const { editar } = await searchParams;

  const [estudiantes, editando] = await Promise.all([
    prisma.estudiante.findMany({
      where: { centroId: user.centroId, estado: "activo" },
      orderBy: { nombre: "asc" },
      include: { _count: { select: { matriculas: true, notas: true } } },
    }),
    editar
      ? prisma.estudiante.findFirst({
          where: { id: Number(editar), centroId: user.centroId },
        })
      : null,
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <h1 className="mb-4 text-xl font-bold text-text">
          {editando ? `Editar: ${editando.nombre}` : "Estudiantes"}
        </h1>
        <EstudianteForm
          key={editando?.id ?? "nuevo"}
          initial={
            editando
              ? { id: editando.id, nombre: editando.nombre, documento: editando.documento }
              : {}
          }
        />
        {editando ? (
          <a
            href="/panel/estudiantes"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            Cancelar edición
          </a>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-sec">
              <th className="py-2">Nombre</th>
              <th className="py-2">Documento</th>
              <th className="py-2">Cursos</th>
              <th className="py-2">Notas</th>
              <th className="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-text-sec">
                  Sin estudiantes aún. Agrega el primero arriba.
                </td>
              </tr>
            ) : (
              estudiantes.map((e) => (
                <tr key={e.id} className="border-b border-border text-text">
                  <td className="py-2">{e.nombre}</td>
                  <td className="py-2">{e.documento}</td>
                  <td className="py-2">{e._count.matriculas}</td>
                  <td className="py-2">{e._count.notas}</td>
                  <td className="py-2 text-right">
                    <a
                      href={`/panel/estudiantes?editar=${e.id}`}
                      className="mr-2 rounded-md border border-border px-2 py-1 text-primary hover:bg-bg"
                    >
                      Editar
                    </a>
                    <form action={deleteEstudiante} className="inline">
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-border px-2 py-1 text-danger hover:bg-danger/10"
                      >
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
