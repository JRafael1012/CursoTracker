# Mejoras priorizadas — v1.x

Prioridad = `riesgo × valor ÷ esfuerzo` (1–5 cada factor). Estado: propuesto,
no implementado. Origen: `docs/evaluacion-v1.md`.

| # | Mejora | Riesgo | Valor | Esfuerzo | Score | Estado |
|---|---|---|---|---|---|---|
| 1 | Actualizar `next` a 16.4.3 y `next-auth` 5.0.0-beta.32 | 5 | 5 | 1 | 25.0 | Propuesto |
| 2 | Backup externo (unidad/nube) + alerta si falla | 4 | 5 | 2 | 10.0 | Propuesto |
| 3 | Alertas de healthcheck y backup (correo/Telegram) | 3 | 4 | 2 | 6.0 | Propuesto |
| 4 | Sustituir `xlsx` 0.18.5 (sin fix) por exceljs o SheetJS 0.20.3 | 4 | 4 | 3 | 5.3 | Propuesto |
| 5 | E2E con Playwright: login, logout, notas, export | 3 | 4 | 3 | 4.0 | Propuesto |

## Notas

- #1 es bloqueante de seguridad: `next` tiene RCE en Image Optimization y
  `next-auth` fail-open. Verificar login, roles y smoke tras actualizar.
- #4: `xlsx` solo se usa para exportar; validar fórmulas y compatibilidad.
- #2 y #3 reducen el riesgo de perder datos y de fallos silenciosos.
- #5 cubriría lo que el smoke HTTP no ve (UI, menú de perfil, formularios).

## Criterio de cierre

Cada mejora pasa a "Hecho" solo con evidencia: pruebas en verde, smoke 22/22,
build de producción y CI verde. Las de seguridad requieren además revisión del
`npm audit`.
