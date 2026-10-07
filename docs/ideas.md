# Ideas y roadmap de implementación (CursoTracker)

> Documento vivo. Registra el plan de sprint propuesto (hitos + módulos + estimaciones),
> qué parte ya está hecha y qué falta. No duplica requisitos ni arquitectura:
> ver `docs/requirements.md`, `docs/architecture.md`, `docs/data-model.md` y `plans/fase04_planificacion_preparacion.md`.
> La taxonomía completa de roles (~25) y su modelo de autorización están en `docs/roles.md`.

## Objetivo

Convertir el plan de sprint en trabajo verificable, señalando coincidencias con lo ya
construido, huecos y mejoras sugeridas.

## Hitos propuestos (plan de sprint, no fases MIDEGS)

| # | Hito | Estado |
|---|------|--------|
| 1 | DB multi-tenant + Auth.js + `proxy.ts` + aislamiento por `centroId` | Hecho |
| 2 | CRUDs modulares (usuarios, estudiantes, cursos, períodos, asignaturas) | Hecho |
| 3 | Notas + cronogramas + asistencia + Zod + `AuditLog` automático | Pendiente |
| 4 | Reportes: Excel (SheetJS) y PDF (`@react-pdf/renderer`) | Pendiente |
| 5 | Despliegue local (0.0.0.0) + `mysqldump` diario | Pendiente |

Aclaración: el plan de sprint **omite** dos fases MIDEGS — verificación (pruebas/QA)
y operación/retiro. Se cubren en los hitos 4–5 con pruebas y respaldo.

## Módulos propuestos vs. lo existente

| Módulo propuesto | Equivalente actual | Estado |
|---|---|---|
| Setup ORM + migración + seed | `prisma/schema.prisma`, `prisma/seed.ts` | Hecho (falta seed con 2 centros) |
| `requireTenant` (centroId desde sesión) | `lib/modules/auth/session.ts` (`requireUser`, `requireRole`) | Hecho |
| Login credenciales + bcrypt | `lib/modules/auth/`, `next-auth` + `bcryptjs` | Hecho |
| `requireRole` en `/panel` | `proxy.ts` + `requireRole` | Hecho |
| Mapeo familiar (PADRE → varios hijos) | — | **No existe en el modelo** (falta relación acudiente↔estudiante) |
| Carga de notas (Zod) + auditoría | `lib/modules/audit` listo | Pendiente (M3) |
| Asignación docente↔asignatura↔curso | `AsignaturaDocente` (modelo) | Modelo listo, sin UI |
| Reportes PDF/Excel | — | Pendiente (M4) |
| Backup + pruebas de aislamiento (Vitest) | — | Pendiente (M5) |

## Decisiones tomadas

- D1: Escala de calificación **configurable por el rector** (0–10 decimales, 0–10 enteros, 1–5, 0–100).
- D2: **Cortes por período configurables** (1 nota o varios cortes que promedian).
- D3: `COORDINADOR` gestiona todo lo académico, salvo usuarios y escala de calificación.
- D4: Modelado de roles **en espera** (no se toca el enum hasta confirmar).

## Buenas ideas a implementar (no estaban en el plan)

1. Roles `RECTOR` y `COORDINADOR` (varios coordinadores por colegio).
2. Config de calificación por centro (D1+D2): campo de configuración en `Centro` + módulo `lib/modules/config`.
3. Pruebas automatizadas con Vitest + CI (GitHub Actions): usar el seed de 2 centros para probar aislamiento.
4. Importación masiva CSV de estudiantes/matrículas.
5. Backup con **restauración probada**, no solo `mysqldump`.
6. Matriz de trazabilidad REQ → diseño → código → prueba (MIDEGS §13).
7. Relación acudiente↔estudiante para el rol `PADRE` (hoy el modelo no la tiene).

## Ajustes al plan propuesto

- XAMPP/MySQL sirve para local; para producción real usar MySQL/MariaDB propio (o Postgres) con backups versionados.
- Tiempos (22–28 días hábiles) son optimistas en reportes PDF y QA: reservar +30–40%.
- Resolver las 8 vulnerabilidades `high` transitivas de `eslint-config-next` en la fase de verificación.

## Orden sugerido de ejecución

1. M3 — Carga de notas (con auditoría) y, antes, config de calificación (D1+D2).
2. Asignación docente↔asignatura↔curso (UI sobre `AsignaturaDocente`).
3. M4 — Reportes Excel y luego PDF.
4. M5 — Despliegue local, backup con restore probado y pruebas de aislamiento.

## Pendiente de decisión

- Modelado de roles (D4): renombrar `ADMIN`→`RECTOR` o añadir `RECTOR`/`COORDINADOR` junto a `ADMIN`.
- Seed de 2 centros para pruebas de aislamiento.