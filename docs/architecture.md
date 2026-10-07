# Arquitectura — empresa

Requisitos: `docs/requirements.md`. Datos: `docs/data-model.md`.

## Stack (decidido, Fase 03)

- **App**: Next.js 15 (App Router, TypeScript, React) — frontend + API en un solo proyecto.
- **UI**: Tailwind CSS, responsive.
- **BD**: MySQL/MariaDB (XAMPP) + Prisma ORM.
- **Auth**: Auth.js con credenciales + hash bcrypt; sesión con cookie httpOnly.
- **Exportación**: SheetJS (`xlsx`) para Excel, `@react-pdf/renderer` para PDF.
- **Validación**: Zod en bordes de API. **Tests**: Vitest + Playwright.

## Principio modular (decidido)

Todo se organiza por módulos de negocio independientes, cada uno con su
código, tipos y tests:

```
lib/modules/
  auth/  tenants/  estudiantes/  cursos/  notas/  reportes/  evidencias/  cronogramas/
```

La app (`app/`) solo orquesta: importa módulos, nunca contiene la lógica de
negocio. Un módulo se puede probar y cambiar sin tocar los demás.

## Despliegue local (decidido)

- **BD**: XAMPP → MySQL/MariaDB en `localhost:3306`.
- **App**: `npm run dev` (Next.js en `localhost:3000`).
- **Red local**: app escuchada en `0.0.0.0` → accesible desde
  `http://IP-de-este-PC:3000` en la red del colegio/pruebas.
- **Backups**: `mysqldump` a carpeta local con fecha (REQ-NF-02), no en la nube.

## Estructura de componentes

```
app/
  (auth)/login/          → autenticación
  (app)/panel/           → paneles por rol (admin, docente, estudiante, padre)
  api/                   → rutas de API (server-side)
lib/                     → auth, tenant, validación, export (pdf/excel)
prisma/schema.prisma     → modelo de datos
```

## Multi-tenant (REQ-F-11)

- Cada fila con datos por centro lleva `centroId` (FK).
- Helper `requireTenant(session)` en toda ruta API: el `centroId` sale de la
  sesión, **nunca** del cliente.
- Pruebas obligatorias: consulta de un centro no puede devolver datos de otro.

## Autorización (REQ-F-02, REQ-F-12)

- Middleware de sesión + `requireRole(roles[])` por ruta/acción.
- Regla por recurso: notas solo docente de la asignatura o admin.

## Seguridad y privacidad (REQ-NF-01, REQ-NF-05)

- HTTPS en producción; contraseñas con bcrypt; sin datos sensibles en URLs.
- Auditoría: tabla `AuditLog` (usuario, acción, entidad, fecha) en escrituras críticas.
- Parámetros siempre por Prisma parametrizado (sin SQL crudo).

## Exportación (REQ-F-06..F-08, F-10, NF-06)

- Generación server-side; plantilla única por tipo de documento.
- Encoding UTF-8 verificado (acentos, ñ) — caso de prueba.

## Flujos principales

1. Login → sesión con `centroId` y `role` → panel según rol.
2. Docente carga notas → validación Zod → guardar + AuditLog → recalcula derivadas al consultar.
3. Generar reporte → consultar datos del tenant → plantilla PDF/Excel → descarga.

## Respuestas a no funcionales

| Req | Diseño |
|-----|--------|
| NF-01 | Auth + mínimo privilegio + HTTPS + sin logs sensibles |
| NF-02 | `mysqldump` diario a carpeta local + restauración probada (Fase 07) |
| NF-03 | Índices en consultas por `centroId`/curso/período |
| NF-04 | Tailwind responsive + foco/contraste básicos |
| NF-05 | AuditLog en escrituras críticas |
| NF-06 | Tests de encoding en exportación |

## Pendiente de Fase 04

- Desglose de tareas, hitos y estimaciones.
