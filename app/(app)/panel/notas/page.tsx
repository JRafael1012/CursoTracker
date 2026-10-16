import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { getConfigCalificacion, ESCALAS } from "@/lib/modules/config";
import {
  listClases,
  listMatriculados,
  listNotas,
} from "@/lib/modules/notas";
import { NotasGrid } from "./form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pick(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function NotasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId ?? "";
  const esDocente = user.rol === "DOCENTE";

  const [clases, periodos, config] = await Promise.all([
    listClases(centroId, esDocente ? user.id : undefined),
    prisma.periodo.findMany({
      where: { centroId },
      orderBy: { fechaInicio: "desc" },
      select: { id: true, nombre: true },
    }),
    getConfigCalificacion(centroId),
  ]);

  const sp = await searchParams;
  const claseSel = clases.find((c) => c.id === pick(sp.claseId));
  const periodoSel = periodos.find((p) => p.id === pick(sp.periodoId));
  const corteSel = config.cortes.includes(pick(sp.corte) ?? "")
    ? pick(sp.corte)!
    : undefined;

  let alumnos: Awaited<ReturnType<typeof listMatriculados>> = [];
  let existentes: Record<string, string> = {};
  if (claseSel && periodoSel && corteSel) {
    [alumnos, existentes] = await Promise.all([
      listMatriculados(centroId, claseSel.cursoId, periodoSel.id),
      listNotas(centroId, claseSel.id, periodoSel.id, corteSel),
    ]);
  }

  const escala = ESCALAS[config.escala];
  const listo = Boolean(claseSel && periodoSel && corteSel);

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h1>Notas</h1>
          <p>
            Registra calificaciones por corte. Escala actual: {escala.label}
            {" "}(mín. aprobatoria {config.notaAprobatoria}).
          </p>
        </div>
      </section>

      <section className="data-card mb-[15px]">
        <form method="get" className="grid gap-3 md:grid-cols-3">
          <select
            name="claseId"
            defaultValue={claseSel?.id ?? ""}
            className="field-input"
            required
          >
            <option value="" disabled>
              Clase (curso · asignatura · docente)…
            </option>
            {clases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            name="periodoId"
            defaultValue={periodoSel?.id ?? ""}
            className="field-input"
            required
          >
            <option value="" disabled>
              Período…
            </option>
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <select
              name="corte"
              defaultValue={corteSel ?? config.cortes[0]}
              className="field-input"
            >
              {config.cortes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button type="submit" className="primary-button whitespace-nowrap">
              Ver clase
            </button>
          </div>
        </form>
        {clases.length === 0 ? (
          <p className="mt-3 text-[12px] text-danger">
            No hay clases asignadas. Crea asignaciones (docente · asignatura ·
            curso) primero.
          </p>
        ) : null}
      </section>

      {listo ? (
        <section className="data-card">
          {alumnos.length === 0 ? (
            <p className="empty-note">
              No hay estudiantes matriculados en este curso y período.
            </p>
          ) : (
            <NotasGrid
              claseId={claseSel!.id}
              periodoId={periodoSel!.id}
              corte={corteSel!}
              alumnos={alumnos}
              existentes={existentes}
              escala={{ min: escala.min, max: escala.max, step: escala.step }}
            />
          )}
        </section>
      ) : (
        <section className="data-card">
          <p className="empty-note">
            Selecciona una clase, período y corte para cargar notas.
          </p>
        </section>
      )}
    </div>
  );
}
