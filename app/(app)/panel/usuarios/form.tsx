"use client";

import { useActionState, useEffect } from "react";
import {
  saveUsuario,
  type FormState,
} from "@/lib/modules/usuarios/actions";

export function UsuarioForm({
  initial,
}: {
  initial?: {
    id?: number;
    nombre?: string;
    email?: string;
    rol?: string;
  };
} = {}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveUsuario,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      const form = document.getElementById("user-form") as HTMLFormElement | null;
      if (!initial?.id) form?.reset();
    }
  }, [state, initial]);

  return (
    <form id="user-form" action={formAction} className="space-y-3">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="nombre"
          placeholder="Nombre completo"
          defaultValue={initial?.nombre ?? ""}
          required
          className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
        />
        <input
          name="email"
          type="email"
          placeholder="Correo"
          defaultValue={initial?.email ?? ""}
          required
          className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
        />
        <input
          name="password"
          type="password"
          placeholder={
            initial?.id
              ? "Nueva contraseña (opcional)"
              : "Contraseña (mín. 6)"
          }
          required={!initial?.id}
          minLength={initial?.id ? undefined : 6}
          className="rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
        />
        <select
          name="rol"
          required
          defaultValue={initial?.rol ?? "DOCENTE"}
          className="rounded-md border border-border bg-card px-3 py-2 text-text outline-none focus:border-primary"
        >
          <option value="ADMIN">Administrador</option>
          <option value="DOCENTE">Docente</option>
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="PADRE">Padre</option>
        </select>
      </div>
      {state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-success">Usuario guardado</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Crear usuario"}
      </button>
    </form>
  );
}
