"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAction } from "@/lib/modules/auth/actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <Image
          src="/logo/logor.png"
          alt="CursoTracker"
          width={45}
          height={48}
          className="mb-4 h-12 w-auto"
          priority
        />
        <h1 className="mb-1 text-2xl font-bold text-text">CursoTracker</h1>
        <p className="mb-6 text-sm text-text-sec">
          Inicia sesión para continuar
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-text">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-border px-3 py-2 text-text outline-none focus:border-primary"
            />
          </div>

          {error ? (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
