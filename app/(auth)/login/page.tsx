"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/modules/auth/actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] rounded-[13px] border border-border bg-card p-8 shadow-[0_18px_45px_rgba(15,23,42,.08)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/logor.png"
          alt="CursoTracker"
          className="mb-4 h-12 w-auto"
        />
        <h1 className="text-[22px] font-bold tracking-[-0.5px] text-text">
          CursoTracker
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Gestión académica para colegios y academias.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="field-label">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="usuario@centro.edu"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="field-input"
            />
          </div>

          {error ? (
            <p className="rounded-[9px] bg-danger/10 px-3 py-2 text-[12px] text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="primary-button w-full justify-center"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}