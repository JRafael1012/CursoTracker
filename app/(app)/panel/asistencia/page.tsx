import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import {
  listClases,
  listMatriculados,
  listAsistencias,
} from "@/lib/modules/asistencia";
import { AsistenciaGrid } from "./form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pick(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function AsistenciaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId ?? "";
  const esDocente = user.rol === "DOCENTE";

  const [clases, periodos] = await Promise.all([
    listClases(centroId, esDocente ? user.id : undefined),
    prisma.periodo.findMany({
      where: { centroId },
      orderBy: { fechaInicio: "desc" },
      select: { id: true, nombre: true },
    }),
  ]);

  const sp = await searchParams;
  const claseSel = clases.find((c) => c.id === pick(sp.claseId));
  const periodoSel = periodos.find((p) => p.id === pick(sp.periodoId));
  const fechaSel = pick(sp.fecha);

  let alumnos: Awaited<ReturnType<typeof listMatriculados>> = [];
  let existentes: Record<string, string> = {};
  if (claseSel && periodoSel && fechaSel) {
    const fecha = new Date(fechaSel + "T00:00:00.000Z");
    if (!Number.isNaN(fecha.getTime())) {
      [alumnos, existentes] = await Promise.all([
        listMatriculados(centroId, claseSel.cursoId, periodoSel.id),
        listAsistencias(centroId, claseSel.id, periodoSel.id, fecha),
      ]);
    }
  }

  const listo = Boolean(claseSel && periodoSel && fechaSel);

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA</p>
          <h1>Asistencia diaria</h1>
          <p>Registra asistencia por clase y fecha.</p>
        </div>
      </section>

      <section className="data-card mb-[15px]">
        <form method="get" className="grid gap-3 md:grid-cols-4">
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
          <input
            type="date"
            name="fecha"
            defaultValue={fechaSel ?? ""}
            className="field-input"
            required
          />
          <button type="submit" className="primary-button">
            Ver clase
          </button>
        </form>
        {clases.length === 0 ? (
          <p className="mt-3 text-[12px] text-danger">
            No hay clases asignadas. Crea asignaciones primero.
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
            <AsistenciaGrid
              claseId={claseSel!.id}
              periodoId={periodoSel!.id}
              fecha={fechaSel!}
              alumnos={alumnos}
              existentes={existentes}
            />
          )}
        </section>
      ) : (
        <section className="data-card">
          <p className="empty-note">
            Selecciona una clase, período y fecha para registrar asistencia.
          </p>
        </section>
      )}
    </div>
  );
}
