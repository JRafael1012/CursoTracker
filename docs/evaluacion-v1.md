# Evaluación v1.0.0 — Fase 09

**Fecha:** 2026-10-25 · **Alcance:** baseline de uso y calidad de la versión
`v1.0.0` desplegada en LAN. La encuesta a usuarios sigue **pendiente**.

## Baseline de uso

Datos de la BD actual (`scripts/metrics.mjs`). Son datos de demo/pruebas: no
hay usuarios reales todavía, así que el uso no permite conclusiones de producto.

| Métrica | Valor |
|---|---|
| Centros | 4 |
| Usuarios | 15 (RECTOR 4, ADMIN 5, COORDINADOR 2, DOCENTE 2, ESTUDIANTE 1, PADRE 1) |
| Estudiantes / cursos / asignaturas | 1 / 1 / 1 |
| Períodos / matrículas | 2 / 1 |
| Notas / asistencias | 2 / 0 |
| Evidencias / cronogramas | 0 / 0 |
| Usuarios con actividad (30 d, `AuditLog`) | 5 |
| Acciones auditadas | 86 (EXPORT 71, UPDATE 15; incluye smoke tests) |
| Backups | 7 archivos, último 31 KB, antigüedad 1 h |

Lectura: el uso es de laboratorio. Asistencias, evidencias y cronogramas no
tienen datos; no se puede afirmar que funcionen mal, solo que no se usaron.

## Calidad

- 3 pruebas unitarias y 22 checks de smoke en verde; CI verde; build de 25 rutas.
- Cobertura limitada: no hay pruebas E2E de navegador; el smoke es HTTP.
- Aviso no bloqueante de Vitest por `configLoader`/`vite-tsconfig-paths`.

## Seguridad (`npm audit --omit=dev`)

4 vulnerabilidades: **3 críticas, 1 alta**. No se aplicó ningún parche en esta
fase (fuera de alcance); quedan como prioridad 1.

- `next` 16.0.0–16.4.0: RCE en Image Optimization (`<=16.4.0`) y DoS con Server
  Actions. Hay parche disponible.
- `next-auth` 5.0.0-beta.29 (`@auth/core`): fail-open ante errores de
  configuración y bypass de normalización de correo. Parche: beta.32.
- `xlsx` 0.18.5: prototype pollution y ReDoS; **sin fix en npm** (SheetJS
  migró a distribución propia).

**Actualización 2026-10-25:** se aplicaron los parches de `next` (16.4.3) y
`next-auth` (5.0.0-beta.32). Tras el cambio, `npm audit --omit=dev` reporta
**1 vulnerabilidad alta** (`xlsx`, sin fix) y ya no hay críticas en producción.
Quedan 3 avisos altos en dependencias de desarrollo del CLI de Prisma.

## Incidentes

- Ninguno crítico en operación.
- Una incidencia menor: acentos corruptos en `backups/backup.log` por
  PowerShell 5.1 + Node; resuelta usando salida ASCII en el script.

## Lecciones aprendidas

1. Next 16.4 con `cacheComponents` exige `instant = false` en layouts con datos
   dinámicos, o el build falla en el prerender.
2. En producción, los redirects por rol de Server Components llegan como
   `200` + `NEXT_REDIRECT`; el smoke debe aceptar ambos formatos.
3. PowerShell 5.1 no decodifica bien la salida UTF-8 de Node; el log debe ser
   ASCII o escrito por Node.
4. El guard `*_test` de `restore-prisma.mjs` evita restaurar sobre producción.

## Decisión

**Continuar con la línea v1.x** (no iniciar retiro). El producto no tiene aún
uso real; el siguiente ciclo debe priorizar seguridad, backup externo y
pruebas E2E antes de sumar funcionalidades.

Top 5 priorizado en `docs/mejoras.md`. Próxima revisión: **2027-01-25** o antes
si ingresan usuarios reales. La encuesta a rector/docente queda pendiente y no
se sustituye con respuestas simuladas.
