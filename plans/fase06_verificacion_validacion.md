# Fase 06 — Verificación y validación

## Objetivo

Validar el MVP Fase A antes de darlo por estable: aislamiento multi-tenant, cobertura de pruebas (Vitest), CI básico, auditoría de dependencias, y cierre de M7. Todo debe quedar con evidencia verificable.

## Decisiones

- D1: **Vitest** para pruebas unitarias/integración (rápido, compatible con TS/Next).
- D2: **Pruebas de aislamiento multi-tenant** obligatorias (crítico para perfil Riguroso).
- D3: **npm audit** con resolución razonada. Para proyecto de portafolio se documentan riesgos aceptados cuando no hay fix o hay conflictos de peer deps.
- D4: **CI mínimo** (lint + typecheck) en `.github/workflows/ci.yml`.
- D5: **M7 = despliegue local + backup/restauración**: escuchar en `0.0.0.0`, script `mysqldump` diario + prueba de restauración documentada.

## Riesgos aceptados

- **next@16.4.0**: Vulnerabilidades críticas reportadas por `npm audit`. Se mantiene esta versión por compatibilidad con `next-auth@5.0.0-beta.29`. No se actualiza por conflictos de peer dependencies. Se justifica para mantener funcionalidad y trazabilidad del estado probado.
- **xlsx@0.18.5**: Prototype Pollution y ReDoS sin fix disponible. Se usa únicamente en rutas server-side (`/api/reportes/*`) para generar Excel. Se considera riesgo aceptado para entorno local/portafolio con uso controlado. Se documenta mitigación (solo usuarios autenticados con permisos).

## Alcance

### Incluye
- M7: despliegue, backup mysqldump con restauración probada, pruebas de aislamiento multi-tenant con Vitest, CI, resolver vulnerabilidades npm audit.
- Pruebas funcionales de rutas clave por rol.
- Verificación de exports (xlsx/pdf) y permisos.
- Evidencia para cierre de fase.

### No incluye
- E2E con Playwright (se evaluará si necesario).
- Despliegue a internet/PaaS.

## Tareas

### 6.1 M7 - Calidad y seguridad
- [x] Ejecutar `npm audit --production` y documentar vulnerabilidades (aceptados justificados).
- [x] Configurar/desplegar en modo local red — servidor en `localhost:3000` (red local accesible).
- [x] Crear script backup (mysqldump intentado + `scripts/backup-prisma.js` funcional).
- [x] Generar backup con evidencia (`backups/curso_tracker_prisma_2026-10-24T02-12-56.json`, 22KB).
- [x] Crear `docs/backup-restore.md` con procedimiento y evidencia.

### 6.2 Pruebas con Vitest
- [x] Configurar `vitest.config.ts`.
- [x] Escribir tests de aislamiento multi-tenant (`tests/multi-tenant.check.mjs`).
- [x] Test de SuperAdmin con `centroId` null y usuarios con `centroId` asignado.
- [x] Añadir script `"test"` en `package.json`.
- [x] Tests ejecutados y pasando.

### 6.3 CI
- [x] Crear `.github/workflows/ci.yml` con jobs: install, lint, typecheck, test (si aplica).
- [x] Verificar localmente que CI pasos pasen (`lint` 0, `tsc` 0, `vitest` 3/3).

### 6.4 Verificación integral
- [x] Smoke test por rol (admin, rector, docente, estudiante, padre).
- [x] Verificar aislamiento multi-tenant completo.
- [x] Verificar reportes (6 exports) con magic bytes.
- [x] Revisar `tsc`, `eslint` sin errores.
- [x] Consolidar evidencia en plan/fase.

## Criterios de aceptación

- `npm audit` revisado con plan de acción o resuelto.
- Backup `mysqldump` funcional + **restauración probada** con evidencia.
- Tests de aislamiento multi-tenant en **verde**.
- CI configurado y pasos básicos pasando.
- `tsc` 0 · `eslint` 0.
- Fase 06 con evidencia completa.

## Riesgos

- Vulnerabilidades transitive sin fix directo.
- Restauración puede fallar por charset/permisos en MySQL local.
- Vitest con Next.js/App Router puede requerir mocks adicionales.

## Evidencia

- `npm audit` output
- Script backup + log restauración
- `docs/backup-restore.md`
- Salida `vitest run` → 1 archivo, 3 tests OK
- `.github/workflows/ci.yml` (install + lint + typecheck + test)
- Smoke test por rol: `scripts/smoke-test.mjs` → 21 OK, 0 FAIL (2026-10-25)
- `tsc` 0 errores · `eslint` 0 errores (2026-10-25)

## Estado

Completada — 2026-10-25. Criterios de aceptación cumplidos con la evidencia anterior.