"use client";

import { useActionState, useEffect } from "react";
import {
  saveEstudiante,
  type FormState,
} from "@/lib/modules/estudiantes/actions";

type Initial = {
  id?: number;
  nombre?: string;
  documento?: string;
};

export function EstudianteForm({ initial = {} }: { initial?: Initial }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveEstudiante,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      const form = document.getElementById("est-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [state]);

  return (
    <form id="est-form" action={formAction} className="space-y-3">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="nombre"
          defaultValue={initial.nombre ?? ""}
          placeholder="Nombre completo"
          required
          className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
        />
        <input
          name="documento"
          defaultValue={initial.documento ?? ""}
          placeholder="Documento (cédula/DNI)"
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
        {pending ? "Guardando…" : initial.id ? "Actualizar" : "Agregar"}
      </button>
    </form>
  );
}
