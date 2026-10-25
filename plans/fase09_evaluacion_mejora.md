# Fase 09 — Evaluación y mejora

## Objetivo

Evaluar **v1.0.0** tras el primer ciclo de operación: medir uso y calidad,
priorizar mejoras, registrar lecciones y decidir si se itera o se avanza a la
Fase 10 (retiro/reemplazo). Base: `docs/operacion.md` y
`plans/fase08_operacion_mantenimiento.md`.

## Decisiones (propuestas)

- D1: Ciclo **trimestral**. Baseline al cerrar Fase 08 y primera revisión en
  **2027-01-25**.
- D2: Métricas **sin APM**, desde BD y logs: usuarios por rol, notas y
  asistencias registradas, exports en `AuditLog`, backups con exit 0 y
  resultado del health check.
- D3: Feedback cualitativo con encuesta breve a rector/docente (3 preguntas).
  Se registra textual; **no se inventan respuestas**.
- D4: Backlog priorizado por `riesgo × valor ÷ esfuerzo` en
  `docs/mejoras.md`.
- D5: Criterios de continuidad: uso semanal real, backups sin fallos y cero
  incidentes críticos abiertos.
- D6: Lecciones y deuda técnica en `docs/evaluacion-v1.md`.

## Alcance

### Incluye
- Informe de evaluación con baseline reproducible.
- Top 5 de mejoras priorizadas con estimación.
- Lecciones aprendidas y deuda técnica conocida.
- Decisión documentada: continuar, iterar o preparar retiro.

### No incluye
- Implementar las mejoras (abre un nuevo ciclo de Fase 05).
- APM, monitoreo 24/7 o encuestas automatizadas.

## Criterios de aceptación

- Baseline medido y reproducible (script o consultas documentadas).
- Top 5 de mejoras con criterio y esfuerzo.
- Encuesta aplicada o registrada explícitamente como pendiente.
- Decisión de continuidad documentada con sus datos.
- `lint`/`tsc`/`test` y CI en verde.

## Riesgos

- Sin usuarios reales el uso medido será bajo y poco concluyente.
- La encuesta puede no responderse; no se sustituirá con datos ficticios.
- `AuditLog` solo cubre exports y acciones instrumentadas, no toda la app.

## Evidencia

- `docs/evaluacion-v1.md` con baseline y decisión.
- Salida de las métricas.
- `docs/mejoras.md` priorizado.
- Encuesta (o su estado pendiente).
