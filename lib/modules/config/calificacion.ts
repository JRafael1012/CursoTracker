export const ESCALAS = {
  "0-10-decimal": { label: "0 – 10 (decimales)", min: 0, max: 10, step: 0.1 },
  "0-10-entero": { label: "0 – 10 (enteros)", min: 0, max: 10, step: 1 },
  "1-5": { label: "1 – 5", min: 1, max: 5, step: 0.1 },
  "0-100": { label: "0 – 100", min: 0, max: 100, step: 1 },
} as const;

export type EscalaKey = keyof typeof ESCALAS;

export const ESCALA_KEYS = Object.keys(ESCALAS) as EscalaKey[];

export type ConfigCalificacion = {
  escala: EscalaKey;
  notaAprobatoria: number;
  cortes: string[];
};

export const CORTES_MAX = 10;

export const CONFIG_DEFAULT: ConfigCalificacion = {
  escala: "1-5",
  notaAprobatoria: 3,
  cortes: ["Corte 1", "Corte 2", "Corte 3"],
};

export function isEscala(value: unknown): value is EscalaKey {
  return typeof value === "string" && Object.hasOwn(ESCALAS, value);
}

export function parseConfigCalificacion(raw: unknown): ConfigCalificacion {
  const config: ConfigCalificacion = { ...CONFIG_DEFAULT, cortes: [...CONFIG_DEFAULT.cortes] };
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (isEscala(r.escala)) config.escala = r.escala;
    if (typeof r.notaAprobatoria === "number" && Number.isFinite(r.notaAprobatoria)) {
      config.notaAprobatoria = r.notaAprobatoria;
    }
    if (Array.isArray(r.cortes)) {
      const cortes = r.cortes
        .filter((c): c is string => typeof c === "string")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cortes.length > 0) config.cortes = cortes;
    }
  }
  return config;
}
