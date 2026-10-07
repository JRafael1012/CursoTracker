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
        className="field-input"
      />
      {state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-[12px] text-success">Guardado correctamente</p>
      ) : null}
      <button type="submit" disabled={pending} className="primary-button">
        {pending ? "Guardando…" : "Agregar asignatura"}
      </button>
    </form>
  );
}
