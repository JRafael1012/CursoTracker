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
    id?: string;
    nombre?: string;
    apellido?: string;
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
          placeholder="Nombres"
          defaultValue={initial?.nombre ?? ""}
          required
          className="field-input"
        />
        <input
          name="apellido"
          placeholder="Apellidos"
          defaultValue={initial?.apellido ?? ""}
          className="field-input"
        />
        <input
          name="email"
          type="email"
          placeholder="Correo"
          defaultValue={initial?.email ?? ""}
          required
          className="field-input"
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
          className="field-input"
        />
        <select
          name="rol"
          required
          defaultValue={initial?.rol ?? "DOCENTE"}
          className="field-input"
        >
          <option value="RECTOR">Rector(a)</option>
          <option value="COORDINADOR">Coordinador(a)</option>
          <option value="ADMIN">Administrador</option>
          <option value="DOCENTE">Docente</option>
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="PADRE">Acudiente</option>
        </select>
      </div>
      {state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-[12px] text-success">Usuario guardado</p>
      ) : null}
      <button type="submit" disabled={pending} className="primary-button">
        {pending ? "Guardando…" : initial?.id ? "Actualizar" : "Crear usuario"}
      </button>
    </form>
  );
}