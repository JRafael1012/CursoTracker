"use client";

import { useActionState, useState } from "react";
import { saveConfigCalificacion, type FormState } from "@/lib/modules/config/actions";
import {
  CORTES_MAX,
  ESCALAS,
  ESCALA_KEYS,
  type ConfigCalificacion,
  type EscalaKey,
} from "@/lib/modules/config/calificacion";

export function ConfigCalificacionForm({
  config,
}: {
  config: ConfigCalificacion;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveConfigCalificacion,
    {},
  );
  const [escala, setEscala] = useState<EscalaKey>(config.escala);
  const [cortes, setCortes] = useState<string[]>(config.cortes);

  const rango = ESCALAS[escala];

  const setCorte = (index: number, value: string) =>
    setCortes((prev) => prev.map((c, i) => (i === index ? value : c)));
  const addCorte = () =>
    setCortes((prev) =>
      prev.length >= CORTES_MAX ? prev : [...prev, `Corte ${prev.length + 1}`],
    );
  const removeCorte = (index: number) =>
    setCortes((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Escala de calificación</span>
          <select
            name="escala"
            required
            value={escala}
            onChange={(e) => setEscala(e.target.value as EscalaKey)}
            className="field-input"
          >
            {ESCALA_KEYS.map((key) => (
              <option key={key} value={key}>
                {ESCALAS[key].label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">
            Nota de aprobación ({rango.min} – {rango.max})
          </span>
          <input
            name="notaAprobatoria"
            type="number"
            required
            min={rango.min}
            max={rango.max}
            step={rango.step}
            defaultValue={config.notaAprobatoria}
            className="field-input"
          />
        </label>
      </div>

      <div>
        <span className="field-label">Cortes por período</span>
        <p className="mb-2 text-[11px] text-muted">
          Cada período se califica con esta cantidad de cortes; el promedio
          define la nota del período.
        </p>
        <div className="space-y-2">
          {cortes.map((corte, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                name="corte"
                value={corte}
                onChange={(e) => setCorte(index, e.target.value)}
                required
                className="field-input"
              />
              <button
                type="button"
                onClick={() => removeCorte(index)}
                disabled={cortes.length <= 1}
                className="chip-button-danger disabled:opacity-40"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCorte}
          disabled={cortes.length >= CORTES_MAX}
          className="chip-button mt-2 inline-block disabled:opacity-40"
        >
          + Agregar corte
        </button>
      </div>

      {state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-[12px] text-success">Configuración guardada</p>
      ) : null}

      <button type="submit" disabled={pending} className="primary-button">
        {pending ? "Guardando…" : "Guardar configuración"}
      </button>
    </form>
  );
}
