# Fase 07 — Liberación y despliegue

## Objetivo

Liberar el MVP Fase A como **v1.0.0** en la red local, con build de producción,
respaldo/restauración probados y rollback documentado. Despliegue decidido en
`docs/architecture.md`; respaldo en `docs/backup-restore.md`.

## Decisiones

- D1: Versión **v1.0.0** con tag anotado en Git y release en GitHub.
  (aprobada 2026-10-25)
- D2: Producción local con `next build` + `next start` en `0.0.0.0:3000`
  (no `next dev`), más script `scripts/start-prod.ps1`. Sin PM2 ni PaaS.
  (aprobada 2026-10-25)
- D3: Cerrar REQ-NF-02 con **ensayo de restauración real** del backup Prisma en
  una BD temporal `curso_tracker_restore_test` (crear → restaurar → comparar
  conteos → eliminar). No toca la BD real. (aprobada 2026-10-25)
- D4: Backup previo al release y backup posterior verificado.
- D5: Rollback = tag anterior + backup previo; procedimiento en el doc de
  respaldo. `mysqldump` sigue descartado por `caching_sha2_password`.
- D6 (2026-10-25): con `cacheComponents`, el panel requiere
  `export const instant = false` en `panel/layout.tsx` para poder construir.
  En producción, un redirect de rol puede emitirse tras el shell: HTTP 200 con
  `NEXT_REDIRECT` y sin contenido de la página. El cliente redirige; no hay
  fuga de datos.

## Alcance

### Incluye
- Build de producción y arranque en LAN.
- Migraciones con `prisma migrate deploy`.
- Ensayo de restauración (D3) y registro de evidencia.
- Smoke test `scripts/smoke-test.mjs` contra producción.
- Tag `v1.0.0`, push y verificación de CI.
- Actualizar README/plan con evidencia.

### No incluye
- Internet, dominio, HTTPS o PaaS.
- Backups automáticos programados y monitoreo (Fase 08).
- Cambios funcionales o nuevas features.

## Criterios de aceptación

- `next build` sin errores y `next start` sirviendo en la IP LAN.
- Smoke test **21/21** contra el servidor de producción.
- Restauración real OK: conteos por tabla iguales al backup.
- Backup previo y posterior generados y verificados.
- Tag `v1.0.0` pusheado y CI en verde.
- Rollback documentado y probado al menos en seco.

## Riesgos

- `next start` en LAN sin HTTPS: aceptado para red interna.
- Restauración puede fallar por FKs u orden de inserción.
- Diferencias entre datos vivos y backup del 2026-10-24.
- El puerto 3000 está ocupado por el dev server actual: detenerlo antes.

## Evidencia

- `next build` OK: 25 rutas, panel dinámico (`ƒ`).
- `next start` en `0.0.0.0:3000`; `/login` por LAN (`192.168.80.12`) HTTP 200.
- Smoke test contra producción: **21/21** (permisos, tenants, 6 exports).
- Restauración real: **67/67 filas**, conteos iguales; BD temporal eliminada.
- Backups: previo `18-27-16` (25 KB) y posterior `18-34-29` (31 KB).
- Rollback ensayado en seco (commit `c0cabe9` + backup previo disponibles).
- Tag `v1.0.0` y CI: se registran al push del commit de cierre.

## Estado

Completada — 2026-10-25 (sujeta a CI en verde tras el push del tag).
