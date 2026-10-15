"use client";

import { useActionState, useEffect } from "react";
import {
  saveAsignacion,
  type FormState,
} from "@/lib/modules/asignaciones/actions";

type Opcion = { id: string; nombre: string };
type DocenteOpcion = { id: string; nombre: string; apellido: string };

export function AsignacionForm({
  cursos,
  asignaturas,
  docentes,
}: {
  cursos: Opcion[];
  asignaturas: Opcion[];
  docentes: DocenteOpcion[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveAsignacion,
    {},
  );

  useEffect(() => {
    if (state.ok)
      (document.getElementById("asig-form") as HTMLFormElement | null)?.reset();
  }, [state]);

  const listo =
    cursos.length > 0 && asignaturas.length > 0 && docentes.length > 0;

  return (
    <form id="asig-form" action={formAction} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
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
          name="asignaturaId"
          required
          defaultValue=""
          className="field-input"
        >
          <option value="" disabled>
            Asignatura…
          </option>
          {asignaturas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        <select
          name="docenteId"
          required
          defaultValue=""
          className="field-input"
        >
          <option value="" disabled>
            Docente…
          </option>
          {docentes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre} {d.apellido}
            </option>
          ))}
        </select>
      </div>
      {!listo ? (
        <p className="text-[12px] text-danger">
          Necesitas cursos, asignaturas y docentes registrados para asignar.
        </p>
      ) : null}
      {state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-[12px] text-success">Asignación guardada</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !listo}
        className="primary-button"
      >
        {pending ? "Guardando…" : "Asignar docente"}
      </button>
    </form>
  );
}
