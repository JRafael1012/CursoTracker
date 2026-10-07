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
          className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
        />
        <input
          name="nivel"
          placeholder="Nivel (ej. Primaria)"
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
        {pending ? "Guardando…" : "Agregar curso"}
      </button>
    </form>
  );
}
