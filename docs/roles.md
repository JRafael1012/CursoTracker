# Roles y permisos (taxonomía objetivo)

> Referencia de diseño. Define la taxonomía completa de roles del SaaS CursoTracker,
> el modelo de autorización propuesto y su implementación por fases.
> Ver también `docs/ideas.md`, `docs/requirements.md` y `docs/data-model.md`.

## Aclaración de alcance

La taxonomía completa son **7 niveles y ~25 roles**. Implementarla entera implica
módulos de dominio nuevos (convivencia/observador, NEE/PIAR, salud, biblioteca,
laboratorio, finanzas, admisiones/CRM, logística, cafetería, transporte, votaciones).
Eso excede el MVP: se implementa por fases (ver abajo).

## Taxonomía objetivo (por nivel)

### 1. Nivel superior (SaaS)
| Rol | Alcance | Permisos clave |
|---|---|---|
| SuperAdmin | Global (multi-centro) | Crear colegios, activar/suspender centros, analíticas globales, config maestra. Sin acceso a datos académicos internos |

### 2. Nivel directivo (por centro)
| Rol | Alcance | Permisos clave |
|---|---|---|
| Admin (Rector/Director) | Su centro | Config institucional, crear cuentas de coordinadores/docentes, tableros financieros y de auditoría, comunicados masivos |
| Consejo Directivo | Su centro | Votaciones internas, actas, historial de reformas del manual de convivencia |

### 3. Gestión y convivencia
| Rol | Alcance | Permisos clave |
|---|---|---|
| Coordinador Académico | Su centro | Mallas curriculares, cursos, asignación docente↔asignatura↔curso, períodos, abrir/cerrar actas |
| Coordinador de Convivencia | Su centro | Observador digital, faltas, citaciones a descargos, planes de mejora |
| Jefe de Departamento | Su área | Revisar/aprobar planeaciones y guías de su área |

### 4. Docencia y aula
| Rol | Alcance | Permisos clave |
|---|---|---|
| Docente | Su carga académica | Tareas, material, asistencia, calificar, anotaciones académicas |
| Director de Grupo | Su curso | Boletines finales del salón, mensajes a padres del curso, alertas de ausentismo |
| Auxiliar de Cátedra | Aulas asignadas | Solo lectura + registrar asistencia + apoyo de tipeo de notas (sin publicar/cerrar) |
| Docente de Inclusión (NEE) | Alumnos asignados | PIAR / ajustes razonables, modificar criterios de evaluación (visibilidad con el docente) |

### 5. Bienestar y recursos
| Rol | Alcance | Permisos clave |
|---|---|---|
| Psicólogo/Orientador | Su centro (confidencial) | Bitácoras confidenciales, derivaciones a salud |
| Enfermero | Su centro | Ficha médica, visitas/accidentes, inventario de medicamentos |
| Bibliotecario | Su centro | Catálogo, préstamos/devoluciones, alertas de retraso |
| Encargado de Laboratorio | Su centro | Reservas de laboratorio, inventario de reactivos/equipos |

### 6. Administrativo y operativo
| Rol | Alcance | Permisos clave |
|---|---|---|
| Secretario Académico | Su centro | Matrículas, expedientes, certificados con firma digital, hojas de vida |
| Contador/Tesorero | Su centro | Órdenes de cobro, pasarelas de pago, nómina, reportes contables |
| Encargado de Admisiones | Su centro | CRM de aspirantes, entrevistas, pre-matrícula |
| Coord. Logística y Mantenimiento | Su centro | Tickets de daños, asignación a operarios, inventario de suministros |
| Cafetería/Nutricionista | Su centro | Menú, inventario de insumos, listado de alergias |
| Coord. de Transporte | Su centro | Rutas, conductores/monitores, alertas de geolocalización |

### 7. Usuarios base
| Rol | Alcance | Permisos clave |
|---|---|---|
| Estudiante | Su curso | Ver asignaturas/material, entregar tareas, exámenes, notas, asistencia |
| Padre/Acudiente | Sus hijos (multi-hijo) | Ver notas/tareas/asistencia/convivencia, justificar inasistencias, recibir cobros/circulares |

## Modelo de autorización propuesto

- **RBAC con permisos**, no un `enum` gigante: tablas `Rol`, `Permiso`, `RolPermiso` y
  `UsuarioRol` (una persona puede tener varios roles: p. ej. Docente + Director de Grupo).
- **Alcance (scope)** por asignación: global (SuperAdmin), centro, curso, asignatura/área.
  Se resuelve con relaciones explícitas (`UsuarioRol.centroId/cursoId/asignaturaId`).
- **SuperAdmin** requiere `Usuario.centroId` **nullable** (hoy es obligatorio) → cambio de schema y de `email` único (hoy `[centroId, email]`).
- **Sesión**: pasar de `rol: string` a `roles: string[]` + `permissions: string[]`; `requireRole` pasa a `requirePermission`.
- **Confidencialidad**: registros de salud/psicología/NEE con visibilidad restringida (no basta el rol; regla por módulo).

## Módulos de dominio nuevos requeridos

Convivencia/Observador · NEE/PIAR · Salud (ficha médica, enfermería) · Bienestar (bitácoras) ·
Biblioteca · Laboratorio · Finanzas (cobros, nómina) · Admisiones/CRM · Logística/Tickets ·
Cafetería · Transporte · Votaciones/Actas · Comunicados · Relación acudiente↔estudiante (multi-hijo).

## Implementación por fases

- **Fase A (MVP actual):** SuperAdmin, Rector, Coordinador Académico, Docente (+flag Director de Grupo), Estudiante, Padre, Secretario Académico.
- **Fase B:** Coordinador de Convivencia, Docente de Inclusión (NEE), Psicólogo, Enfermero, Auxiliar de Cátedra, Jefe de Departamento.
- **Fase C:** Biblioteca, Laboratorio, Contador, Admisiones, Logística, Cafetería, Transporte, Consejo Directivo.

## Decisiones

Resueltas (2026-10-07): **enum de roles extendido** (sin tablas RBAC) y **estudiante = Usuario**.
Numeración canónica en `docs/data-model.md` (Modelo objetivo v2).

Pendientes:
- P1: `centroId` **nullable** + rol global `SUPERADMIN` (necesario para el nivel 1).
- D9: Confirmar la **Fase A** como alcance del MVP (SuperAdmin, Rector, Coordinador Académico, Docente + Director de Grupo, Estudiante, Padre, Secretario).
- D10: Multi-rol por usuario (recomendado: sí) — el enum actual asume 1 rol por usuario.