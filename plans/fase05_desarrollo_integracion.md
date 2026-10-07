# Fase 05 — Desarrollo e integración

## Objetivo

Ejecutar el backlog de construcción sobre el modelo objetivo v2 y la taxonomía de
roles, hasta el MVP (Fase A). Requisitos: `docs/requirements.md`. Modelo:
`docs/data-model.md`. Roles: `docs/roles.md`. Roadmap de ideas: `docs/ideas.md`.

## Decisiones

- D1: Escala de calificación **configurable por el rector** (0–10 decimales, 0–10 enteros, 1–5, 0–100).
- D2: **Cortes por período configurables** (1 nota o varios cortes que promedian).
- D3: `COORDINADOR` gestiona todo lo académico (no usuarios ni escala de calificación).
- D5: **PK UUID** en todas las tablas.
- D6: **Estudiante = Usuario** (rol `ESTUDIANTE`) + perfil `Estudiante`; `EstudiantePadre` (N:M multi-hijo).
- D7: **Enum de roles** extendido (sin tablas RBAC) + mapa rol→permisos en código.
- D8: `Nota` cuelga de **`CursoAsignaturaDocente`** (una FK).

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

- **M3 Modelo v2 + roles.** Migrar schema a UUID; `Usuario.centroId` nullable
  (SuperAdmin) y `email` único global; `+apellido`; enum `SUPERADMIN/RECTOR/
  ADMIN/COORDINADOR/DOCENTE/ESTUDIANTE/PADRE`; unificar Estudiante↔Usuario;
  `EstudiantePadre`; renombrar `AsignaturaDocente`→`CursoAsignaturaDocente`;
  `Nota → CursoAsignaturaDocente`; `AuditLog +descripcion/ip`; reescribir seed
  (2 centros para pruebas de aislamiento) y sesión (`centroId` nullable, `roles`).
  *Aceptación:* `prisma migrate` OK, `tsc`/`eslint` limpios, login de los 4 roles demo.
- **M4 Configuración de calificación (D1+D2).** Módulo `lib/modules/config` +
  vista para el rector; config por centro (escala y cortes).
  *Aceptación:* el rector cambia escala/cortes y se persiste por `centroId`.
- **M5 Asignación académica + Notas y asistencia.** UI sobre
  `CursoAsignaturaDocente` (qué docente dicta qué asignatura en cada curso);
  endpoint de carga de notas con Zod y `AuditLog` automático; boletines por
  cortes según D1/D2; asistencia diaria.
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