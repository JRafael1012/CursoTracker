# Requisitos — empresa (MVP)

Alcance de producto en `README.md`. Roles: Admin, Docente, Estudiante, Padre
(+ roles futuros ampliables). Carga de notas: manual.

## Requisitos funcionales

### REQ-F-01 Autenticación y sesiones
- Registro/login seguro de usuarios, pertenecientes a un centro (tenant).
- Criterio: un usuario solo ve datos de su centro.

### REQ-F-02 Gestión de usuarios y roles
- Admin crea/edita/desactiva usuarios y asigna roles (Admin, Docente, Estudiante, Padre).
- Criterio: cada acción queda registrada con usuario y fecha.

### REQ-F-03 Gestión de estudiantes
- Alta/baja/edición de ficha: nombre, documento, curso, estado.
- Criterio: búsqueda por nombre, documento o curso.

### REQ-F-04 Gestión de cursos y asignaturas
- Admin/Docente organiza cursos, asignaturas, períodos (trimestres/semestres) y matrículas.
- Criterio: un estudiante pertenece a uno o más cursos por período.

### REQ-F-05 Carga manual de notas
- Docente introduce y edita notas por estudiante, asignatura y período.
- Criterio: solo el docente de la asignatura (o admin) puede editar; cada nota registra autor y fecha.

### REQ-F-06 Boletines
- Generación de boletín de notas por estudiante/período.
- Criterio: exportable en PDF y Excel; datos consistentes con REQ-F-05.

### REQ-F-07 Listados por curso/asignatura
- Listado de notas y calificaciones por curso o asignatura.
- Criterio: exportable en PDF y Excel.

### REQ-F-08 Estadísticas
- Promedios, aprobados/suspenso, comparativas por curso/asignatura/período.
- Criterio: valores calculados desde las notas almacenadas, sin duplicación.

### REQ-F-09 Evidencias académicas
- Docente adjunta evidencias (trabajos, constancias) asociadas a estudiante/curso/período.
- Criterio: formato imagen/PDF; descarga y visualización autorizada por rol.

### REQ-F-10 Cronogramas del docente
- Docente crea cronogramas/actividades por curso y asignatura.
- Criterio: visible por estudiantes y padres del curso; exportable en PDF.

### REQ-F-11 Multi-tenant
- Cada colegio/academia es un inquilino aislado con su propia configuración.
- Criterio: ningún dato cruza entre centros (verificable por consulta).

### REQ-F-12 Panel por rol
- Cada rol ve un panel con sus acciones y datos relevantes.
- Criterio: un rol nunca ve acciones de otro rol en la interfaz.

## Requisitos no funcionales

### REQ-NF-01 Privacidad de datos de menores
- Mínimo privilegio, cifrado en tránsito, sin exposición de datos sensibles en URLs/logs.

### REQ-NF-02 Disponibilidad y respaldo
- Copias de seguridad periódicas de la base de datos con procedimiento de restauración probado.

### REQ-NF-03 Rendimiento
- Carga de páginas principales < 3 s con datos de un curso típico (≤ 50 estudiantes).

### REQ-NF-04 Accesibilidad y responsive
- Uso cómodo en móvil, tablet y escritorio; contraste y navegación por teclado básicos.

### REQ-NF-05 Auditoría
- Registro de acciones críticas (notas, usuarios, configuración) con autor y fecha.

### REQ-NF-06 Exportación fiable
- PDF/Excel generados sin pérdida de datos, con encoding correcto (acentos, ñ).

## Modelo de datos inicial (alto nivel)

Centro → Usuarios (rol) → Cursos → Asignaturas → Matrículas (Estudiante)
→ Notas (estudiante, asignatura, período) · Evidencias · Cronogramas.

## Trazabilidad

Cada requisito se vinculará a diseño (Fase 03), código (Fase 05) y pruebas
(Fase 06) en sus planes correspondientes.
