# Fase 08 — Operación y mantenimiento

## Objetivo

Operar **v1.0.0** en la red local de forma estable: respaldos automáticos con
retención, verificación de salud, actualizaciones controladas, bitácora de
incidentes y restauración periódica. Base: `docs/backup-restore.md` y
`plans/fase07_liberacion_despliegue.md`.

## Decisiones (propuestas)

- D1: Backup **diario** con el Programador de tareas de Windows ejecutando
  `scripts/backup-prisma.js`; retención **30 días**; la carpeta `backups/`
  queda fuera de Git (ya está en `.gitignore`). Aprobada 2026-10-25; hora
  **23:00**.
- D2: **Health check** `GET /login` + consulta `SELECT 1` a MySQL. Script
  `scripts/healthcheck.mjs`; ejecución manual o diaria.
- D3: Arranque con `scripts/start-prod.ps1`. Sin PM2. Reinicio tras apagón
  documentado (tarea programada opcional, no obligatoria).
- D4: Actualizaciones en **ventana mensual**: `npm audit` → `lint`/`tsc`/
  `test` → `build` → smoke → backup previo → tag nuevo.
- D5: Bitácora en `docs/operacion.md` (fecha, síntoma, causa, acción, estado).
  La auditoría funcional sigue en `AuditLog`.
- D6: Monitoreo externo **no** (LAN); logs locales (`prod-server.log`) y
  revisión semanal manual.

## Alcance

### Incluye
- Runbook de operación (arranque, parada, backup, restore, health check).
- Tarea programada de backup con retención y evidencia de una ejecución.
- Script de health check y su primera ejecución.
- Plan de actualización mensual y bitácora inicial.
- Ensayo de restauración trimestral (repetir procedimiento de Fase 07).

### No incluye
- Alta disponibilidad, clúster, monitoreo 24/7.
- HTTPS, dominio público, nube o PaaS.
- Backups fuera del equipo (se evaluará en Fase 09).

## Criterios de aceptación

- Tarea de backup creada y ejecutada al menos una vez con log OK.
- Retención de 30 días aplicada (borra backups antiguos).
- `healthcheck` en verde (HTTP + BD).
- Runbook probado: parar y arrancar producción siguiendo el documento.
- Restauración de un backup reciente en BD `*_test` con conteos iguales.
- `docs/operacion.md` con la primera entrada.

## Riesgos

- El equipo debe estar encendido para la tarea programada.
- `backups/` contiene datos y hashes: restringir permisos de la carpeta.
- Credenciales en `.env`: no versionar ni copiar a backups.
- Actualizar Next/Prisma puede repetir fallos de build (ver Fase 07 D6).

## Evidencia

- Tarea **CursoTracker Backup** registrada (diaria 23:00); 3 ejecuciones con
  `LastTaskResult=0` y backup de 31 KB en `backups/`.
- Retención probada: archivo simulado de 40 días eliminado (1 borrado).
- `healthcheck.mjs` → `HEALTH OK` (HTTP 200 + `SELECT 1`), también tras
  reiniciar producción con `start-prod.ps1`.
- Restauración trimestral: **85/85 filas**, conteos iguales, BD temporal
  eliminada.
- `docs/operacion.md` con runbook y bitácora inicial.

## Estado

Completada — 2026-10-25.
