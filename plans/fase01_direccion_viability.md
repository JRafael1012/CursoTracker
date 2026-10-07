# Fase 01 — Dirección estratégica y viabilidad

## Objetivo

Definir la propuesta de valor, alcance inicial y viabilidad del proyecto "empresa":
SaaS de gestión académica para colegios y academias que automatiza notas,
reportes y evidencias.

## Decisiones

- D1: Nombre del producto: **CursoTracker** (carpeta raíz = CursoTracker; BD interna `empresa`).
- D2: Perfil MIDEGS: Riguroso (datos sensibles de menores, múltiples usuarios, alto impacto).
- D3: Stack: Web JS/TS fullstack (a definir framework concreto en Fase 03).
- D4: Plataforma objetivo: web multi-tenant (colegios/academias como inquilinos).
- D5: Documentación viva en `README.md` y `docs/`; este plan solo referencia.

## Alcance

### Incluye

- Propuesta de valor y usuario objetivo.
- Módulos candidatos y priorización inicial (notas, reportes, evidencias, "otros módulos" por descubrir).
- Riesgos legales/privacidad (datos de menores).
- Criterios de viabilidad mínimos para pasar a Fase 02.

### No incluye

- Diseño de arquitectura o modelo de datos.
- Código de implementación.
- Definición de framework, base de datos o infraestructura.

## Criterios de aceptación

- Propuesta de valor escrita en una fuente única (`README.md`).
- Lista priorizada de módulos v1 aprobada por el usuario.
- Riesgos de privacidad identificados y aceptados.
- Aprobación explícita del usuario para iniciar Fase 02.

## Riesgos

- Alcance demasiado amplio ("ama modulos") sin priorización.
- Datos de menores: cumplimiento de privacidad desde el diseño.
- Multi-tenant mal definido temprano genera re-trabajo.

## Evidencia

- Este plan aprobado.
- Decisión de módulos v1 registrada en `README.md`.
