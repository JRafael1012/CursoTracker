# Fase 05 — Desarrollo e integración

## Objetivo

Ejecutar el backlog de construcción sobre el modelo objetivo v2 y la taxonomía de
roles, hasta el MVP (Fase A). Requisitos: `docs/requirements.md`. Modelo:
`docs/data-model.md`. Roles: `docs/roles.md`. Roadmap de ideas: `docs/ideas.md`.

## Decisiones

- D1: Escala de calificación **configurable por el rector** (0–10 decimales, 0–10 enteros, 1–5, 0–100).
- D2: **Cortes por período configurables** (1 nota o varios cortes que promedian).
  Aclaración (2026-10-15, aprobada): los cortes viven en la **config del centro**
  (`Centro.config`) y aplican a todos los períodos.
- D9 (2026-10-15, aprobada): la config incluye **`notaAprobatoria`** (mínima de
  aprobación), además de escala y cortes.
- D3: `COORDINADOR` gestiona todo lo académico (no usuarios ni escala de calificación).
- D5: **PK UUID** en todas las tablas.
- D6: **Estudiante = Usuario** (rol `ESTUDIANTE`) + perfil `Estudiante`; `EstudiantePadre` (N:M multi-hijo).
- D7: **Enum de roles** extendido (sin tablas RBAC) + mapa rol→permisos en código.
- D8: `Nota` cuelga de **`CursoAsignaturaDocente`** (una FK).
- D10 (2026-10-15, aprobada): la asignación docente↔asignatura↔curso usa
  `CursoAsignaturaDocente` (única por la terna); un curso puede tener varios
  docentes por asignatura. La gestionan RECTOR/ADMIN/COORDINADOR.

## Alcance

### Incluye (MVP — Fase A)
SuperAdmin, Rector, Coordinador Académico, Docente (+Director de Grupo),
Estudiante, Padre, Secretario Académico. Notas, asistencia, reportes PDF/Excel,
despliegue local con respaldo.

### No incluye
Módulos de dominio de Fases B y C (convivencia/observador, NEE/PIAR, salud,
biblioteca, laboratorio, finanzas, admisiones/CRM, logística, cafetería,
transporte, votaciones) — ver `docs/roles.md`.

## Hitos (M3..M7)

- **M3 Modelo v2 + roles.** ✅ (2026-10-07) Migrado el schema a UUID; `Usuario.centroId`
  nullable (SuperAdmin) y `email` único global; `+apellido`; enum `SUPERADMIN/RECTOR/
  ADMIN/COORDINADOR/DOCENTE/ESTUDIANTE/PADRE`; Estudiante = Usuario + perfil;
  `EstudiantePadre`; `AsignaturaDocente`→`CursoAsignaturaDocente`; `Nota →
  CursoAsignaturaDocente`; `AuditLog +descripcion/ip`. Migración `init_v2` aplicada,
  seed con 2 centros, sesión con `centroId` nullable. Evidencia: `tsc`/`eslint` 0;
  login de los 4 roles demo → `/panel` 200; docente/estudiante bloqueados en
  períodos/usuarios; **aislamiento multi-tenant** verificado (admin@norte solo ve
  Colegio Norte y 0 estudiantes de demo).
- **M4 Configuración de calificación (D1+D2+D9).** ✅ (2026-10-15) Campo
  `Centro.config Json?`; módulo `lib/modules/config` (`calificacion.ts` puro +
  `index.ts` con `getConfigCalificacion` + `actions.ts` con Zod y `AuditLog`);
  vista `/panel/configuracion` solo RECTOR/ADMIN; enlace en el shell.
  *Aceptación:* ✅ el rector de Masura (`ccolaura@yahoo.es`) carga la vista (HTTP
  200) y la config persiste por `centroId` (default → guardado → fallback ante
  datos corruptos). Evidencia: `tsc`/`eslint` 0.
- **M5a Asignación académica** (parte de M5). ✅ (2026-10-15) UI y acciones
  sobre `CursoAsignaturaDocente` (qué docente dicta qué asignatura en cada
  curso): módulo `lib/modules/asignaciones` (Zod + `AuditLog`; asigna/elimina
  solo RECTOR/ADMIN/COORDINADOR) y vista `/panel/asignaciones` (ACADEMICO ve;
  directivos gestionan). *Aceptación:* ✅ página HTTP 200 para rector y docente;
  el docente la ve **sin** formulario; el estudiante es redirigido a `/panel`;
  datos filtrados por `centroId`. Evidencia: `tsc`/`eslint` 0. (Además, el tipo
  `FormState` —duplicado en 6 módulos— se unificó en `lib/modules/form.ts`.)
- **M5b Carga de notas.** ✅ (2026-10-18) `corte` agregado a `Nota` (String,
  default `""`), índice único `[estudianteId, cursoAsignaturaDocenteId,
  periodoId, corte]` (D2/D8). Módulo `lib/modules/notas` (Zod + `AuditLog`,
  valida escala y corte contra la config del centro). Vista `/panel/notas` con
  grid por clase/período/corte; el DOCENTE solo ve sus clases.
  *Aceptación:* ✅ HTTP 200 para admin y docente; `tsc`/`eslint` 0.
- **M5c Asistencia diaria.** ✅ (2026-10-18) Modelo `Asistencia` (enum
  `EstadoAsistencia`, índice único `[estudianteId, cursoAsignaturaDocenteId,
  fecha]`). Módulo `lib/modules/asistencia`. Vista `/panel/asistencia`.
  *Aceptación:* ✅ HTTP 200 para docente; `tsc`/`eslint` 0.
- **Fix auth (post-M5c).** ✅ (2026-10-18) `proxy.ts` valida el JWE de Auth.js
  (HKDF sha256) en vez de solo comprobar presencia de cookie; cookie inválida
  se borra automáticamente. Rompe el bucle `/login` ↔ `/panel` con cookies
  viejas. Evidencia: curl (6 escenarios en verde) + commit `bc549db`.
- **M6 Reportes.** Excel (SheetJS) y PDF (`@react-pdf/renderer`) con pruebas de
  encoding (acentos/ñ); sábanas para docentes/directivos; boletines.
- **M7 Despliegue y calidad.** Escucha en `0.0.0.0`; `mysqldump` diario **con
  restauración probada**; pruebas de aislamiento multi-tenant con Vitest + CI;
  resolver las 8 vulnerabilidades `high`.

## Criterios de aceptación (fase)

MVP Fase A operativo en red local: login por rol, CRUDs, carga de notas con
auditoría, boletín PDF y sábana Excel, respaldo restaurable y pruebas de
aislamiento en verde.

## Riesgos

- Migrar a UUID y unificar Estudiante↔Usuario toca todos los módulos existentes
  (reescribir queries y sesión).
- 25 roles reales implican módulos aún no planificados: se implementan por fases.

## Evidencia

Salidas de `prisma migrate`, `tsc`, `eslint`, `vitest`, y captura/HTTP de cada
módulo funcionando en la red local.