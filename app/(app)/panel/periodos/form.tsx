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
          className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
        />
        <input
          name="fechaInicio"
          type="date"
          required
          className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
        />
        <input
          name="fechaFin"
          type="date"
          required
          className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-success">Guardado correctamente</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar período"}
      </button>
    </form>
  );
}
