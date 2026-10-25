# Operación y mantenimiento

## Runbook

### Arrancar producción

```powershell
npm run build                              # solo si hubo cambios
powershell -File scripts/start-prod.ps1    # next start en 0.0.0.0:3000
```

Verificar `http://IP-LAN:3000/login`.

### Parar producción

Identificar el proceso que escucha en `:3000` y detenerlo. Solo detener el
`next start` propio del proyecto, nunca MySQL ni procesos ajenos.

### Health check

```powershell
node --env-file=.env scripts/healthcheck.mjs
```

Comprueba `GET /login` (200) y `SELECT 1` en MySQL. Esperado: `HEALTH OK`.

### Backup

- Manual: `node --env-file=.env scripts/backup-prisma.js`
- Automático: tarea de Windows **CursoTracker Backup**, diaria a las **23:00**,
  ejecuta `scripts/backup-task.ps1` y escribe `backups/backup.log`.
- Retención: **30 días** (`BACKUP_RETENTION_DAYS`). Solo borra
  `curso_tracker_prisma_*.json` antiguos.

### Restauración

Seguir `docs/backup-restore.md`. Siempre en una BD `*_test`; el script
`scripts/restore-prisma.mjs` rechaza cualquier otra URL. Al finalizar,
eliminar la BD temporal.

### Actualización mensual

Backup → `npm audit` → `npm run lint` → `npx tsc --noEmit` → `npm test` →
`npm run build` → smoke test → tag nuevo.

### Rollback

Ver `docs/backup-restore.md` (commit estable anterior + backup previo).

## Bitácora

| Fecha | Evento | Acción | Estado |
|---|---|---|---|
| 2026-10-25 | Release v1.0.0 | build prod, smoke 21/21, tag v1.0.0 | OK |
| 2026-10-25 | Backup automático | tarea Windows 23:00, retención 30 d, ejecución exit 0 | OK |
| 2026-10-25 | Runbook | parada + arranque con `start-prod.ps1` + health check | OK |
| 2026-10-25 | Restauración trimestral | BD temporal, 85/85 filas, BD eliminada | OK |
| 2026-10-25 | Mejora UX | botón "Cerrar sesión" visible en la barra superior | OK |

Próxima restauración de prueba: **2027-01-25**. Próxima revisión de
actualizaciones: **2026-11-25**.
