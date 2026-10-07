# Modelo de datos — empresa

Requisitos: `docs/requirements.md`. MySQL/MariaDB (XAMPP) + Prisma. Todas las
entidades
operativas llevan `centroId` (multi-tenant, REQ-F-11) y auditoría básica
(`createdAt`, `updatedAt`).

## Entidades

### Centro (tenant)
`id`, `nombre`, `config`, `createdAt`, `updatedAt`

### Usuario
`id`, `centroId` FK, `email` único por centro, `passwordHash`, `nombre`,
`rol` enum (`ADMIN`, `DOCENTE`, `ESTUDIANTE`, `PADRE`), `estado`,
`createdAt`, `updatedAt`

### Estudiante
`id`, `centroId` FK, `nombre`, `documento`, `estado`, fechas, `createdAt`, `updatedAt`
- Relación: muchos–mucho con Curso vía Matrícula.

### Curso
`id`, `centroId` FK, `nombre`, `nivel`, `periodoActivoId` FK

### Periodo
`id`, `centroId` FK, `nombre` (ej. "Trimestre 1"), `fechaInicio`, `fechaFin`

### Asignatura
`id`, `centroId` FK, `nombre`
- Docentes ↔ Asignaturas: `AsignaturaDocente` (m–m, con `cursoId`).

### Matricula
`id`, `centroId` FK, `estudianteId` FK, `cursoId` FK, `periodoId` FK
- Índice único: (`estudianteId`, `cursoId`, `periodoId`).

### Nota
`id`, `centroId` FK, `estudianteId` FK, `asignaturaId` FK, `cursoId` FK,
`periodoId` FK, `valor` Decimal(5,2), `autorId` FK (docente/admin),
`fecha`, `updatedAt`
- Índice: (`estudianteId`, `asignaturaId`, `periodoId`).
- Regla: editar = solo docente de la asignatura o admin (REQ-F-05).

### Evidencia
`id`, `centroId` FK, `estudianteId`? FK, `cursoId` FK, `periodoId` FK,
`titulo`, `descripcion`, `archivoUrl`, `mime`, `autorId` FK, `createdAt`

### Cronograma
`id`, `centroId` FK, `cursoId` FK, `asignaturaId` FK, `titulo`,
`descripcion`, `fecha`, `autorId` FK, `createdAt`, `updatedAt`

### AuditLog
`id`, `centroId` FK, `usuarioId` FK, `accion`, `entidad`, `entidadId`,
`fecha`
- Solo inserción/lectura (REQ-NF-05).

## Relaciones (resumen)

```
Centro 1–* Usuario, Estudiante, Curso, Periodo, Asignatura
Estudiante *–* Curso (Matricula, por periodo)
Curso 1–* Matricula, Nota, Evidencia, Cronograma
Asignatura 1–* Nota, Cronograma; *–* Docente (AsignaturaDocente)
Nota *–1 Usuario (autor)
```

## Derivadas (no almacenar)

Promedios, aprobados/suspenso y estadísticas (REQ-F-08) se **calculan al
consultar** desde Nota, evitando duplicación.

## Seguridad de datos

- FKs con `ON DELETE RESTRICT` en datos académicos (trazabilidad).
- Todo listado filtrado por `centroId` de sesión.
