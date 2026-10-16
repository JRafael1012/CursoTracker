"use client";

import { useActionState } from "react";
import { saveAsistencias, type FormState } from "@/lib/modules/asistencia/actions";

type Alumno = { estudianteId: string; nombre: string };

const ESTADOS = ["PRESENTE", "AUSENTE", "TARDE", "JUSTIFICADO"] as const;

export function AsistenciaGrid({
  claseId,
  periodoId,
  fecha,
  alumnos,
  existentes,
}: {
  claseId: string;
  periodoId: string;
  fecha: string;
  alumnos: Alumno[];
  existentes: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveAsistencias,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="claseId" value={claseId} />
      <input type="hidden" name="periodoId" value={periodoId} />
      <input type="hidden" name="fecha" value={fecha} />

      <table className="data-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((a) => (
            <tr key={a.estudianteId}>
              <td>{a.nombre}</td>
              <td>
                <select
                  name={`estado_${a.estudianteId}`}
                  defaultValue={existentes[a.estudianteId] ?? "PRESENTE"}
                  className="field-input"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-[12px] text-success">Asistencia guardada</p>
      ) : null}

      <button type="submit" disabled={pending} className="primary-button">
        {pending ? "Guardando…" : "Guardar asistencia"}
      </button>
    </form>
  );
}
