"use client";

import { useActionState, useEffect } from "react";
import {
  saveEstudiante,
  type FormState,
} from "@/lib/modules/estudiantes/actions";

type Initial = {
  id?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
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
      if (!initial.id) form?.reset();
    }
  }, [state, initial]);

  return (
    <form id="est-form" action={formAction} className="space-y-3">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="nombre"
          defaultValue={initial.nombre ?? ""}
          placeholder="Nombres"
          required
          className="field-input"
        />
        <input
          name="apellido"
          defaultValue={initial.apellido ?? ""}
          placeholder="Apellidos"
          className="field-input"
        />
        <input
          name="email"
          type="email"
          defaultValue={initial.email ?? ""}
          placeholder="Correo del estudiante"
          required
          className="field-input"
        />
        <input
          name="documento"
          defaultValue={initial.documento ?? ""}
          placeholder="Documento (cédula/DNI)"
          required
          className="field-input"
        />
        <input
          name="password"
          type="password"
          placeholder={initial.id ? "Nueva contraseña (opcional)" : "Contraseña (mín. 6)"}
          required={!initial.id}
          minLength={initial.id ? undefined : 6}
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
        {pending ? "Guardando…" : initial.id ? "Actualizar" : "Agregar"}
      </button>
    </form>
  );
}