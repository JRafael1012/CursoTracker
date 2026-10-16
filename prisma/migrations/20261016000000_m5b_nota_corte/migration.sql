-- AlterTable
ALTER TABLE `nota` ADD COLUMN `corte` VARCHAR(191) NOT NULL DEFAULT '';

-- DropForeignKey
ALTER TABLE `nota` DROP FOREIGN KEY `Nota_estudianteId_fkey`;

-- DropIndex
DROP INDEX `Nota_estudianteId_cursoAsignaturaDocenteId_periodoId_key` ON `nota`;

-- CreateIndex
CREATE UNIQUE INDEX `Nota_estudianteId_cursoAsignaturaDocenteId_periodoId_corte_key` ON `nota`(`estudianteId`, `cursoAsignaturaDocenteId`, `periodoId`, `corte`);

-- AddForeignKey
ALTER TABLE `nota` ADD CONSTRAINT `Nota_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
