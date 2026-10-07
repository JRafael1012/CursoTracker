# Fase 03 — Arquitectura y diseño

## Objetivo

Definir la arquitectura técnica y el diseño del sistema para el MVP
descrito en `docs/requirements.md`.

## Decisiones

- D1: Fuente de verdad de requisitos: `docs/requirements.md` (vivo).
- D2: Arquitectura documentada en `docs/architecture.md` (una decisión → una fuente).
- D3: Entorno verificado: Node 22.17, npm 10.9, Git 2.50 en Windows.
- D4: Stack concreto: Next.js 15 (React + TS) + Tailwind, MySQL/MariaDB (XAMPP)
  + Prisma, Auth.js (roles), exportación: SheetJS (Excel) + @react-pdf/renderer (PDF).
  Validación con Zod; tests Vitest (unit) + Playwright (e2e).
- D4b: Despliegue 100% local: XAMPP (BD) + `npm run dev` (app), accesible en
  la red local. Sin servicios en la nube.
- D5: Multi-tenant: aislamiento por `centro_id` en todas las entidades (diseñar antes de codificar).
- D6: Modelo de datos: ER en `docs/data-model.md`, con claves y relaciones.

## Alcance

### Incluye

- Stack concreto y justificación breve.
- `docs/architecture.md`: componentes, flujos, seguridad, multi-tenant.
- `docs/data-model.md`: entidades, relaciones, claves.
- Diagrama de alta nivel (flux/despliegue).

### No incluye

- Código de implementación (Fase 05).
- Infraestructura de despliegue real (Fase 07).

## Criterios de aceptación

- Stack decidido y aprobado por el usuario.
- `docs/architecture.md` y `docs/data-model.md` revisados.
- Cada requisito no funcional con una respuesta de diseño.
- Aprobación para iniciar Fase 04.

## Riesgos

- Elegir tecnología solo por moda (regla: dependencias justificadas).
- Modelo multi-tenant tardío → migraciones costosas.
- Exportación PDF/Excel mal estimada (librerías con licencias/limitaciones).

## Evidencia

- Documentos aprobados por el usuario.
