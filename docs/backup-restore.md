# Backup y restauración

## Método operativo: exportación con Prisma ✅

Script: `scripts/backup-prisma.js`

- El `mysqldump` de XAMPP falla por incompatibilidad con
  `caching_sha2_password` (falta el plugin en ese binario).
- El export de Prisma sí funciona: genera
  `backups/curso_tracker_prisma_<fecha>.json` con 10 tablas. `backups/` está
  en `.gitignore` porque contiene datos y hashes.

### Evidencia de backup

- `2026-10-25T18-27-16` — previo al release: 67 filas, 25 KB.
- `2026-10-25T18-34-29` — posterior al release: 31 KB.

## Restauración probada ✅ (2026-10-25)

Procedimiento ejecutado (REQ-NF-02):

1. Crear BD temporal `curso_tracker_restore_test` con `prisma migrate deploy`.
2. Restaurar con `scripts/restore-prisma.mjs` y `RESTORE_DATABASE_URL`.
3. Comparar conteos backup vs BD restaurada.
4. Eliminar la BD temporal.

Resultado: **67 filas restauradas, conteos iguales** (centro 4, usuario 15,
estudiante 1, periodo 2, curso 1, asignatura 1, cursoAsignaturaDocente 1,
nota 2, asistencia 0, auditLog 40). Salida: `RESTAURACION OK`.

El script rechaza URLs que no apunten a una BD `*_test`, así que no puede
sobrescribir la base real.

## Rollback de release

1. Detener `next start`.
2. Volver al commit estable anterior (`c0cabe9`) o revertir el release.
3. Restaurar el backup previo en una BD limpia y ajustar `DATABASE_URL`.
4. `npm ci --legacy-peer-deps` → `npm run build` →
   `powershell -File scripts/start-prod.ps1`.

Ensayado en seco: existen el tag `v1.0.0`, el commit previo `c0cabe9` y el
backup previo. No se ejecutó el rollback destructivo.
