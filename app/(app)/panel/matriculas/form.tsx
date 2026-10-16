"use client";

import { useActionState, useEffect } from "react";
import {
  saveMatricula,
  type FormState,
} from "@/lib/modules/matriculas/actions";

type Opcion = { id: string; nombre: string };
type EstudianteOpcion = {
  id: string;
  usuario: { nombre: string; apellido: string };
};

export function MatriculaForm({
  estudiantes,
  cursos,
  periodos,
}: {
  estudiantes: EstudianteOpcion[];
  cursos: Opcion[];
  periodos: Opcion[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveMatricula,
    {},
  );

  useEffect(() => {
    if (state.ok)
      (document.getElementById("mat-form") as HTMLFormElement | null)?.reset();
  }, [state]);

  const listo =
    estudiantes.length > 0 && cursos.length > 0 && periodos.length > 0;

  return (
    <form id="mat-form" action={formAction} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <select
          name="estudianteId"
          required
          defaultValue=""
          className="field-input"
        >
          <option value="" disabled>
            Estudiante…
          </option>
          {estudiantes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.usuario.nombre} {e.usuario.apellido}
            </option>
          ))}
        </select>
        <select name="cursoId" required defaultValue="" className="field-input">
          <option value="" disabled>
            Curso…
          </option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          name="periodoId"
          required
          defaultValue=""
          className="field-input"
        >
          <option value="" disabled>
            Período…
          </option>
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>
      {!listo ? (
        <p className="text-[12px] text-danger">
          Necesitas estudiantes, cursos y períodos registrados para matricular.
        </p>
      ) : null}
      {state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-[12px] text-success">Matrícula guardada</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !listo}
        className="primary-button"
      >
        {pending ? "Guardando…" : "Matricular estudiante"}
      </button>
    </form>
  );
}
