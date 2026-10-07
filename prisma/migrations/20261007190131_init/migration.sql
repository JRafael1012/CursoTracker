-- CreateTable
CREATE TABLE `Centro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Centro_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE') NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activo',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Usuario_centroId_idx`(`centroId`),
    UNIQUE INDEX `Usuario_centroId_email_key`(`centroId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estudiante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activo',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Estudiante_centroId_nombre_idx`(`centroId`, `nombre`),
    UNIQUE INDEX `Estudiante_centroId_documento_key`(`centroId`, `documento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Curso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NOT NULL DEFAULT '',

    INDEX `Curso_centroId_idx`(`centroId`),
    UNIQUE INDEX `Curso_centroId_nombre_key`(`centroId`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Periodo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Periodo_centroId_nombre_key`(`centroId`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignatura` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Asignatura_centroId_nombre_key`(`centroId`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AsignaturaDocente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asignaturaId` INTEGER NOT NULL,
    `docenteId` INTEGER NOT NULL,
    `cursoId` INTEGER NOT NULL,

    UNIQUE INDEX `AsignaturaDocente_asignaturaId_docenteId_cursoId_key`(`asignaturaId`, `docenteId`, `cursoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matricula` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `estudianteId` INTEGER NOT NULL,
    `cursoId` INTEGER NOT NULL,
    `periodoId` INTEGER NOT NULL,

    INDEX `Matricula_centroId_cursoId_idx`(`centroId`, `cursoId`),
    UNIQUE INDEX `Matricula_estudianteId_cursoId_periodoId_key`(`estudianteId`, `cursoId`, `periodoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nota` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `estudianteId` INTEGER NOT NULL,
    `asignaturaId` INTEGER NOT NULL,
    `cursoId` INTEGER NOT NULL,
    `periodoId` INTEGER NOT NULL,
    `valor` DECIMAL(5, 2) NOT NULL,
    `autorId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Nota_centroId_estudianteId_asignaturaId_periodoId_idx`(`centroId`, `estudianteId`, `asignaturaId`, `periodoId`),
    INDEX `Nota_centroId_cursoId_periodoId_idx`(`centroId`, `cursoId`, `periodoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evidencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `estudianteId` INTEGER NULL,
    `cursoId` INTEGER NOT NULL,
    `periodoId` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL DEFAULT '',
    `archivoUrl` VARCHAR(191) NOT NULL,
    `mime` VARCHAR(191) NOT NULL,
    `autorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Evidencia_centroId_cursoId_periodoId_idx`(`centroId`, `cursoId`, `periodoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cronograma` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `cursoId` INTEGER NOT NULL,
    `asignaturaId` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL DEFAULT '',
    `fecha` DATETIME(3) NOT NULL,
    `autorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Cronograma_centroId_cursoId_fecha_idx`(`centroId`, `cursoId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centroId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `accion` VARCHAR(191) NOT NULL,
    `entidad` VARCHAR(191) NOT NULL,
    `entidadId` VARCHAR(191) NOT NULL DEFAULT '',
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_centroId_fecha_idx`(`centroId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Curso` ADD CONSTRAINT `Curso_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Periodo` ADD CONSTRAINT `Periodo_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignatura` ADD CONSTRAINT `Asignatura_centroId_fkey` FOREIGN KEY (`centroId`) REFERENCES `Centro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturaDocente` ADD CONSTRAINT `AsignaturaDocente_asignaturaId_fkey` FOREIGN KEY (`asignaturaId`) REFERENCES `Asignatura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturaDocente` ADD CONSTRAINT `AsignaturaDocente_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturaDocente` ADD CONSTRAINT `AsignaturaDocente_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_asignaturaId_fkey` FOREIGN KEY (`asignaturaId`) REFERENCES `Asignatura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
