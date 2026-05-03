/*
  Warnings:

  - You are about to drop the column `patientProfileId` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `therapistProfileId` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `patientProfileId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `therapistProfileId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `patientProfileId` on the `Scenario` table. All the data in the column will be lost.
  - You are about to drop the column `therapistProfileId` on the `Scenario` table. All the data in the column will be lost.
  - You are about to drop the column `patientProfileId` on the `TherapeuticObjective` table. All the data in the column will be lost.
  - You are about to drop the column `therapistProfileId` on the `TherapeuticObjective` table. All the data in the column will be lost.
  - Added the required column `patientId` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapistId` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapistId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapistId` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `TherapeuticObjective` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapistId` to the `TherapeuticObjective` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Consultation` DROP FOREIGN KEY `Consultation_patientProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Consultation` DROP FOREIGN KEY `Consultation_therapistProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_patientProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_therapistProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Scenario` DROP FOREIGN KEY `Scenario_patientProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `Scenario` DROP FOREIGN KEY `Scenario_therapistProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `TherapeuticObjective` DROP FOREIGN KEY `TherapeuticObjective_patientProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `TherapeuticObjective` DROP FOREIGN KEY `TherapeuticObjective_therapistProfileId_fkey`;

-- AlterTable
ALTER TABLE `Consultation` DROP COLUMN `patientProfileId`,
    DROP COLUMN `therapistProfileId`,
    ADD COLUMN `patientId` INTEGER NOT NULL,
    ADD COLUMN `therapistId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Report` DROP COLUMN `patientProfileId`,
    DROP COLUMN `therapistProfileId`,
    ADD COLUMN `patientId` INTEGER NOT NULL,
    ADD COLUMN `therapistId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Scenario` DROP COLUMN `patientProfileId`,
    DROP COLUMN `therapistProfileId`,
    ADD COLUMN `patientId` INTEGER NOT NULL,
    ADD COLUMN `therapistId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `TherapeuticObjective` DROP COLUMN `patientProfileId`,
    DROP COLUMN `therapistProfileId`,
    ADD COLUMN `patientId` INTEGER NOT NULL,
    ADD COLUMN `therapistId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Consultation_patientId_idx` ON `Consultation`(`patientId`);

-- CreateIndex
CREATE INDEX `Consultation_therapistId_idx` ON `Consultation`(`therapistId`);

-- CreateIndex
CREATE INDEX `Report_patientId_idx` ON `Report`(`patientId`);

-- CreateIndex
CREATE INDEX `Report_therapistId_idx` ON `Report`(`therapistId`);

-- CreateIndex
CREATE INDEX `Scenario_patientId_idx` ON `Scenario`(`patientId`);

-- CreateIndex
CREATE INDEX `Scenario_therapistId_idx` ON `Scenario`(`therapistId`);

-- CreateIndex
CREATE INDEX `TherapeuticObjective_patientId_idx` ON `TherapeuticObjective`(`patientId`);

-- CreateIndex
CREATE INDEX `TherapeuticObjective_therapistId_idx` ON `TherapeuticObjective`(`therapistId`);

-- AddForeignKey
ALTER TABLE `TherapeuticObjective` ADD CONSTRAINT `TherapeuticObjective_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `PatientProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapeuticObjective` ADD CONSTRAINT `TherapeuticObjective_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scenario` ADD CONSTRAINT `Scenario_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `PatientProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scenario` ADD CONSTRAINT `Scenario_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consultation` ADD CONSTRAINT `Consultation_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `PatientProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consultation` ADD CONSTRAINT `Consultation_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `PatientProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
