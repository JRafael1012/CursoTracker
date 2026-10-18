# CursoTracker

SaaS multi-tenant de gestión académica para colegios y academias.

## Propuesta de valor

Automatiza la gestión de estudiantes, cursos y notas, y la generación de
reportes y evidencias académicas en PDF/Excel, con una interfaz amigable y
accesible desde cualquier dispositivo.

## Objetivo

Desarrollar un SaaS multi-tenant para colegios y academias, que permita la
gestión integral de estudiantes, cursos y notas, automatizando la generación
de reportes y evidencias académicas en formato PDF/Excel, con una interfaz
amigable y accesible desde cualquier dispositivo.

## MVP (v1)

- Gestión de estudiantes, cursos y notas.
- Generación de reportes y evidencias en PDF/Excel.
- Multi-tenant (colegios/academias como inquilinos).
- Accesible desde cualquier dispositivo (web responsive).
- Roles: SuperAdmin, Rector, Coordinador Académico, Docente (+Director de
  Grupo), Estudiante, Padre y Secretario Académico (Fase A).

## Stack

Next.js 16 (App Router, React 19, TypeScript, Tailwind 4) · Prisma 6 + MySQL/
MariaDB (XAMPP) · Auth.js (next-auth, JWT) · Zod · bcryptjs · SheetJS (`xlsx`)
y `@react-pdf/renderer` para reportes. Despliegue local (red LAN).

## Perfil MIDEGS

Riguroso — datos sensibles de múltiples usuarios, alto impacto.

## Puesta en marcha

```bash
npm install --legacy-peer-deps
npx prisma migrate dev        # crea/actualiza el esquema
npx prisma db seed            # datos demo
npm run dev                   # http://localhost:3000
```

Requiere MySQL/MariaDB en `localhost:3306` y `.env` con `DATABASE_URL`,
`AUTH_SECRET` y `AUTH_URL`.

### Credenciales demo (centro "Academia Demo")

| Rol | Email | Contraseña |
|---|---|---|
| Admin/Rector | `admin@demo.com` | `Admin123!` |
| Docente | `profe@demo.com` | `Profe123!` |
| Estudiante | `alumno@demo.com` | `Alumno123!` |
| Padre | `padre@demo.com` | `Padre123!` |

### Credenciales demo (centro "Colegio Norte")

| Rol | Email | Contraseña |
|---|---|---|
| Rector | `admin@norte.com` | `Norte123!` |

### Credenciales demo (centro "Masura")

| Rol | Email | Contraseña |
|---|---|---|
| Rector | `ccolaura@yahoo.es` | `123456789` |

## Documentación

- Requisitos: `docs/requirements.md`
- Arquitectura: `docs/architecture.md`
- Modelo de datos: `docs/data-model.md` (incluye **modelo objetivo v2**)
- Roles y permisos: `docs/roles.md`
- Diseño (paleta/assets): `docs/design.md`
- Roadmap de ideas: `docs/ideas.md`

## Fases (MIDEGS)

- [x] Fase 01 — Dirección y viabilidad (`plans/fase01_direccion_viability.md`)
- [x] Fase 02 — Descubrimiento y requisitos (`docs/requirements.md`, vivo)
- [x] Fase 03 — Arquitectura y diseño (`docs/architecture.md`, `docs/data-model.md`)
- [x] Fase 04 — Planificación y preparación (`plans/fase04_planificacion_preparacion.md`)
- [x] Fase 05 — Desarrollo e integración (`plans/fase05_desarrollo_integracion.md`)

## Estado

- Hecho: M0 entorno ·
  M1 modelo+auth (multi-tenant, roles, sesión JWT) ·
  M2 CRUDs (estudiantes, cursos, períodos, asignaturas, usuarios) ·
  M3 modelo v2 (UUID, roles extendidos, `Estudiante` = Usuario + perfil,
  `CursoAsignaturaDocente`, `AuditLog`, sesión con `centroId` nullable) ·
  M4 config de calificación (`Centro.config`: escala, nota de aprobación y
  cortes por período, solo RECTOR/ADMIN) ·
  M5a asignaciones (docente ↔ asignatura ↔ curso) ·
  M5b carga de notas (por clase, período y corte; multicalificación D2;
  solo RECTOR/ADMIN/COORDINADOR/DOCENTE; el DOCENTE solo sus clases) ·
  M5c asistencia diaria (PRESENTE/AUSENTE/TARDE/JUSTIFICADO) ·
  M6 reportes Excel/PDF (boletín por estudiante, sábana por curso,
  estadísticas aprobados/suspenso; AuditLog en cada export; scoping por rol:
  estudiante solo su boletín, padre solo sus hijos)
- Verificado: `tsc` 0 · `eslint` 0 · login de los 4 roles demo → `/panel` 200 ·
  permisos por rol aplicados (estudiante redirigido de `/panel/notas` y
  `/panel/asistencia`) · aislamiento multi-tenant · 6 exports con magic bytes
  correctos (`PK` xlsx, `%PDF` pdf) y encoding UTF-8 · fix de sesión con
  cookie inválida (proxy valida JWE y la limpia).
- Siguiente: Fase 06 — Verificación y validación (pruebas automatizadas,
  aislamiento multi-tenant con Vitest, CI) y M7 (despliegue, backup
  mysqldump con restauración probada, vulnerabilidades npm audit).
