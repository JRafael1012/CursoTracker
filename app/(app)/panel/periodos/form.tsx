"use client";

import { useActionState, useEffect } from "react";
import { savePeriodo, type FormState } from "@/lib/modules/periodos/actions";

export function PeriodoForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    savePeriodo,
    {},
  );

  useEffect(() => {
    if (state.ok) (document.getElementById("periodo-form") as HTMLFormElement | null)?.reset();
  }, [state]);

  return (
    <form id="periodo-form" action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="nombre"
          placeholder="Ej. Trimestre 1"
          required
          className="field-input"
        />
        <input
          name="fechaInicio"
          type="date"
          required
          className="field-input"
        />
        <input
          name="fechaFin"
          type="date"
          required
          className="field-input"
        />
      </div>
      {state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-[12px] text-success">Guardado correctamente</p>
      ) : null}
      <button type="submit" disabled={pending} className="primary-button">
        {pending ? "Guardando…" : "Agregar período"}
      </button>
    </form>
  );
}
