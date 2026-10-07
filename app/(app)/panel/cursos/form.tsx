"use client";

import { useActionState, useEffect } from "react";
import { saveCurso, type FormState } from "@/lib/modules/cursos/actions";

export function CursoForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveCurso,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      (document.getElementById("curso-form") as HTMLFormElement | null)?.reset();
    }
  }, [state]);

  return (
    <form id="curso-form" action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="nombre"
          placeholder="Nombre (ej. 5to A)"
          required
          className="field-input"
        />
        <input
          name="nivel"
          placeholder="Nivel (ej. Primaria)"
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
        {pending ? "Guardando…" : "Agregar curso"}
      </button>
    </form>
  );
}
