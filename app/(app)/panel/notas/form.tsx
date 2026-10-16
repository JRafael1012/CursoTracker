"use client";

import { useActionState } from "react";
import { saveNotas, type FormState } from "@/lib/modules/notas/actions";

type Alumno = { estudianteId: string; nombre: string };

export function NotasGrid({
  claseId,
  periodoId,
  corte,
  alumnos,
  existentes,
  escala,
}: {
  claseId: string;
  periodoId: string;
  corte: string;
  alumnos: Alumno[];
  existentes: Record<string, string>;
  escala: { min: number; max: number; step: number };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveNotas,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="claseId" value={claseId} />
      <input type="hidden" name="periodoId" value={periodoId} />
      <input type="hidden" name="corte" value={corte} />

      <table className="data-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th className="w-[160px]">Nota ({corte})</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((a) => (
            <tr key={a.estudianteId}>
              <td>{a.nombre}</td>
              <td>
                <input
                  type="number"
                  name={`valor_${a.estudianteId}`}
                  defaultValue={existentes[a.estudianteId] ?? ""}
                  min={escala.min}
                  max={escala.max}
                  step={escala.step}
                  className="field-input"
                  placeholder="—"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-[12px] text-success">Notas guardadas</p>
      ) : null}

      <button type="submit" disabled={pending} className="primary-button">
        {pending ? "Guardando…" : "Guardar notas"}
      </button>
    </form>
  );
}
