-- CreateTable
CREATE TABLE `Centro` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `subdominio` VARCHAR(191) NULL,
    `estado` ENUM('ACTIVO', 'SUSPENDIDO') NOT NULL DEFAULT 'ACTIVO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Centro_nombre_key`(`nombre`),
    UNIQUE INDEX `Centro_subdominio_key`(`subdominio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL DEFAULT '',
    `rol` ENUM('SUPERADMIN', 'RECTOR', 'ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE', 'PADRE') NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activo',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_centroId_idx`(`centroId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estudiante` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activo',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Estudiante_usuarioId_key`(`usuarioId`),
    INDEX `Estudiante_centroId_idx`(`centroId`),
    UNIQUE INDEX `Estudiante_centroId_documento_key`(`centroId`, `documento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EstudiantePadre` (
    `id` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `padreId` VARCHAR(191) NOT NULL,
    `parentesco` VARCHAR(191) NOT NULL DEFAULT '',

    INDEX `EstudiantePadre_padreId_idx`(`padreId`),
    UNIQUE INDEX `EstudiantePadre_estudianteId_padreId_key`(`estudianteId`, `padreId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Curso` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NOT NULL DEFAULT '',

    INDEX `Curso_centroId_idx`(`centroId`),
    UNIQUE INDEX `Curso_centroId_nombre_key`(`centroId`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Periodo` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Periodo_centroId_nombre_key`(`centroId`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignatura` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Asignatura_centroId_nombre_key`(`centroId`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CursoAsignaturaDocente` (
    `id` VARCHAR(191) NOT NULL,
    `asignaturaId` VARCHAR(191) NOT NULL,
    `docenteId` VARCHAR(191) NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,

    INDEX `CursoAsignaturaDocente_cursoId_idx`(`cursoId`),
    UNIQUE INDEX `CursoAsignaturaDocente_asignaturaId_docenteId_cursoId_key`(`asignaturaId`, `docenteId`, `cursoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matricula` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,
    `periodoId` VARCHAR(191) NOT NULL,

    INDEX `Matricula_centroId_cursoId_idx`(`centroId`, `cursoId`),
    UNIQUE INDEX `Matricula_estudianteId_cursoId_periodoId_key`(`estudianteId`, `cursoId`, `periodoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nota` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `cursoAsignaturaDocenteId` VARCHAR(191) NOT NULL,
    `periodoId` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(5, 2) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Nota_centroId_periodoId_idx`(`centroId`, `periodoId`),
    UNIQUE INDEX `Nota_estudianteId_cursoAsignaturaDocenteId_periodoId_key`(`estudianteId`, `cursoAsignaturaDocenteId`, `periodoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evidencia` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NULL,
    `cursoId` VARCHAR(191) NOT NULL,
    `periodoId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL DEFAULT '',
    `archivoUrl` VARCHAR(191) NOT NULL,
    `mime` VARCHAR(191) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Evidencia_centroId_cursoId_periodoId_idx`(`centroId`, `cursoId`, `periodoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cronograma` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,
    `asignaturaId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL DEFAULT '',
    `fecha` DATETIME(3) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Cronograma_centroId_cursoId_fecha_idx`(`centroId`, `cursoId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `centroId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `accion` VARCHAR(191) NOT NULL,
    `entidad` VARCHAR(191) NOT NULL,
    `entidadId` VARCHAR(191) NOT NULL DEFAULT '',
    `descripcion` VARCHAR(191) NOT NULL DEFAULT '',
    `ip` VARCHAR(191) NOT NULL DEFAULT '',
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_centroId_fecha_idx`(`centroId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EstudiantePadre` ADD CONSTRAINT `EstudiantePadre_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EstudiantePadre` ADD CONSTRAINT `EstudiantePadre_padreId_fkey` FOREIGN KEY (`padreId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Curso` ADD CONSTRAINT `Curso_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Periodo` ADD CONSTRAINT `Periodo_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignatura` ADD CONSTRAINT `Asignatura_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CursoAsignaturaDocente` ADD CONSTRAINT `CursoAsignaturaDocente_asignaturaId_fkey` FOREIGN KEY (`asignaturaId`) REFERENCES `Asignatura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CursoAsignaturaDocente` ADD CONSTRAINT `CursoAsignaturaDocente_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CursoAsignaturaDocente` ADD CONSTRAINT `CursoAsignaturaDocente_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_periodoId_fkey` FOREIGN KEY (`periodoId`) REFERENCES `Periodo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_cursoAsignaturaDocenteId_fkey` FOREIGN KEY (`cursoAsignaturaDocenteId`) REFERENCES `CursoAsignaturaDocente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_periodoId_fkey` FOREIGN KEY (`periodoId`) REFERENCES `Periodo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidencia` ADD CONSTRAINT `Evidencia_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidencia` ADD CONSTRAINT `Evidencia_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidencia` ADD CONSTRAINT `Evidencia_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidencia` ADD CONSTRAINT `Evidencia_periodoId_fkey` FOREIGN KEY (`periodoId`) REFERENCES `Periodo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidencia` ADD CONSTRAINT `Evidencia_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cronograma` ADD CONSTRAINT `Cronograma_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cronograma` ADD CONSTRAINT `Cronograma_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cronograma` ADD CONSTRAINT `Cronograma_asignaturaId_fkey` FOREIGN KEY (`asignaturaId`) REFERENCES `Asignatura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cronograma` ADD CONSTRAINT `Cronograma_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
