# Fase 04 — Planificación y preparación

## Objetivo

Convertir arquitectura y requisitos en un plan de ejecución concreto:
tareas ordenadas, hitos y entorno listo antes de escribir código (Fase 05).

## Decisiones

- D1: Orden de construcción por capas: entorno → BD/modelo → auth+tenant →
  módulos de negocio → exportación → pruebas.
- D2: Hitos = módulos verticales funcionales (ver abajo), no "capas sueltas".
- D3: Herramientas verificadas: Node 22.17, npm 10.9, Git 2.50, XAMPP (BD).
- D4: Todo el registro vive en este plan; requisitos en `docs/requirements.md`.

## Hitos (M1..M6)

- **M0 Entorno** ✅ (verificado 2026-10-07): scaffold Next.js 15 + TS + Tailwind + ESLint en la raíz; BD `empresa` creada en XAMPP; Prisma 6.19 conectado; `npm run dev` responde 200 en `localhost:3000` escuchando en todas las interfaces (red local). Pendiente menor: 3 advisories high en el CLI de Prisma (dev-only, `deepmerge-ts`) — reevaluar en M5.
- **M1 Modelo + Auth** ✅ (verificado 2026-10-07): schema Prisma de
  `docs/data-model.md` migrado (11 modelos, `prisma migrate dev` OK); seed con
  centro demo + 4 usuarios; auth JWT (Auth.js/next-auth) con roles y `centroId`
  desde sesión (BD, nunca del cliente); helpers `requireUser`/`requireRole`;
  guardias en `proxy.ts` (Next 16) + layout de panel; login probado:
  credenciales OK → `/panel` 200 "Bienvenido"; sin sesión → 307 `/login`;
  `tsc --noEmit` y `eslint` limpios.
- **M2 Gestión** ✅ (verificado 2026-10-07): 5 módulos CRUD con patrón
  `lib/modules/X/{actions,queries}` + página + formulario cliente:
  Estudiantes (alta/edición/baja), Cursos, Períodos, Asignaturas, Usuarios
  (crear/editar/suspender, solo ADMIN). Nav por rol en el layout; auditoría
  (`AuditLog`) en toda escritura; validación Zod. Evidencia HTTP: admin → 200
  en las 5 secciones; docente → 307 bloqueado en períodos/asignaturas/usuarios;
  raíz `/` redirige al login; `tsc` y `eslint` limpios.
- **M3..M7**: código de Fase 05 — modelo v2+roles, config de calificación,
  notas/asistencia, reportes y despliegue. Ver `plans/fase05_desarrollo_integracion.md`.

## Registro de decisiones (ampliación 2026-10-07)

- D5: PK **UUID** en todas las tablas. D6: **Estudiante = Usuario** + `EstudiantePadre`.
- D7: **enum de roles** extendido. D8: `Nota` → `CursoAsignaturaDocente`.
- D1/D2: escala y cortes **configurables por el rector**. D3: `COORDINADOR` gestiona lo académico.
- Taxonomía completa (~25 roles) y fases: `docs/roles.md`; roadmap: `docs/ideas.md`.

## Alcance

### Incluye

- Desglose de tareas por hito y dependencias entre ellos.
- Preparación del entorno (M0) como primera ejecución.
- Criterios de verificación por hito.

### No incluye

- Ejecutar M1..M5 (eso es Fase 05).

## Criterios de aceptación

- Tareas de M0–M5 listadas en orden con su criterio de "hecho".
- Entorno M0 verificado (`npm run dev` + XAMPP respondiendo).
- Aprobación del usuario para iniciar Fase 05.

## Riesgos

- Construir por capas y no poder probar nada hasta el final → mitigado por hitos verticales.
- XAMPP apagado o puerto 3306 ocupado → verificar antes de cada sesión.

## Evidencia

- Salida de `npm run dev` y prueba de conexión a BD (M0).
- Plan aprobado.
