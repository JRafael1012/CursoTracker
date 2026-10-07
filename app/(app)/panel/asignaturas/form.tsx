"use client";

import { useActionState, useEffect } from "react";
import {
  saveAsignatura,
  type FormState,
} from "@/lib/modules/asignaturas/actions";

export function AsignaturaForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveAsignatura,
    {},
  );

  useEffect(() => {
    if (state.ok) (document.getElementById("asig-form") as HTMLFormElement | null)?.reset();
  }, [state]);

  return (
    <form id="asig-form" action={formAction} className="space-y-3">
      <input
        name="nombre"
        placeholder="Ej. Matemáticas"
        required
        className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
      />
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
        {pending ? "Guardando…" : "Agregar asignatura"}
      </button>
    </form>
  );
}
