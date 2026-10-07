# Fase 02 — Descubrimiento y requisitos

## Objetivo

Recoger y documentar los requisitos del MVP definido en `README.md`:
quién lo usa, qué necesita hacer y con qué criterios de calidad.

## Decisiones

- D1: Fuente de verdad del alcance: `README.md` (no duplicar aquí).
- D2: Requisitos funcionales numerados: `REQ-F-XX`; no funcionales: `REQ-NF-XX`.
- D3: Historias de usuario en `docs/requirements.md`, trazables a requisitos.

## Alcance

### Incluye

- Requisitos funcionales del MVP (estudiantes, cursos, notas, reportes/evidencias PDF/Excel, multi-tenant, roles).
- Requisitos no funcionales: seguridad, privacidad de datos de menores, rendimiento, accesibilidad, responsive.
- Criterios de aceptación por requisito.
- Modelo de datos inicial (entidades y relaciones de alto nivel).

### No incluye

- Arquitectura técnica, stack concreto ni infraestructura (Fase 03).
- Diseño de interfaz.
- Código de implementación.

## Criterios de aceptación

- `docs/requirements.md` completo y aprobado por el usuario.
- Cada requisito tiene criterio de aceptación.
- Cada módulo del MVP cubierto por al menos un requisito.
- Aprobación explícita para iniciar Fase 03.

## Riesgos

- Requisitos ambiguos ("y otros módulos") → pedir ejemplos concretos.
- Olvidar roles/permisos en multi-tenant.
- Requisitos de privacidad de menores no traducidos a requisitos verificables.

## Evidencia

- `docs/requirements.md` revisado y aprobado.
