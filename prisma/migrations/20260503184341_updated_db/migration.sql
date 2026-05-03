/*
  Warnings:

  - You are about to drop the column `sessionId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionIdHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `User_sessionId_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `sessionId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `role` ENUM('PATIENT', 'THERAPIST', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    ADD COLUMN `sessionIdHash` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `PatientProfile` (
    `patientProfileId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `careStatus` ENUM('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'FINISHED') NOT NULL DEFAULT 'NOT_STARTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PatientProfile_userId_key`(`userId`),
    PRIMARY KEY (`patientProfileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TherapistProfile` (
    `therapistProfileId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `professionalRegister` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `specialty` VARCHAR(191) NOT NULL,
    `experience` VARCHAR(191) NOT NULL,
    `attendanceModality` ENUM('ONLINE', 'PRESENTIAL', 'BOTH') NOT NULL DEFAULT 'ONLINE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TherapistProfile_userId_key`(`userId`),
    PRIMARY KEY (`therapistProfileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TherapeuticObjective` (
    `therapeuticObjectiveId` INTEGER NOT NULL AUTO_INCREMENT,
    `patientProfileId` INTEGER NOT NULL,
    `therapistProfileId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `evolution` ENUM('MAINTAINED', 'IMPROVED', 'REGRESSED') NOT NULL DEFAULT 'MAINTAINED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TherapeuticObjective_patientProfileId_idx`(`patientProfileId`),
    INDEX `TherapeuticObjective_therapistProfileId_idx`(`therapistProfileId`),
    PRIMARY KEY (`therapeuticObjectiveId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scenario` (
    `scenarioId` INTEGER NOT NULL AUTO_INCREMENT,
    `patientProfileId` INTEGER NOT NULL,
    `therapistProfileId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'FINISHED') NOT NULL DEFAULT 'NOT_STARTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Scenario_patientProfileId_idx`(`patientProfileId`),
    INDEX `Scenario_therapistProfileId_idx`(`therapistProfileId`),
    PRIMARY KEY (`scenarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Consultation` (
    `consultationId` INTEGER NOT NULL AUTO_INCREMENT,
    `patientProfileId` INTEGER NOT NULL,
    `therapistProfileId` INTEGER NOT NULL,
    `consultationDate` DATETIME(3) NOT NULL,
    `objective` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Consultation_patientProfileId_idx`(`patientProfileId`),
    INDEX `Consultation_therapistProfileId_idx`(`therapistProfileId`),
    INDEX `Consultation_consultationDate_idx`(`consultationDate`),
    PRIMARY KEY (`consultationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `reportId` INTEGER NOT NULL AUTO_INCREMENT,
    `patientProfileId` INTEGER NOT NULL,
    `therapistProfileId` INTEGER NOT NULL,
    `consultationId` INTEGER NULL,
    `sessionObjective` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `evolution` ENUM('MAINTAINED', 'IMPROVED', 'REGRESSED') NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Report_consultationId_key`(`consultationId`),
    INDEX `Report_patientProfileId_idx`(`patientProfileId`),
    INDEX `Report_therapistProfileId_idx`(`therapistProfileId`),
    PRIMARY KEY (`reportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_sessionIdHash_key` ON `User`(`sessionIdHash`);

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapistProfile` ADD CONSTRAINT `TherapistProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapeuticObjective` ADD CONSTRAINT `TherapeuticObjective_patientProfileId_fkey` FOREIGN KEY (`patientProfileId`) REFERENCES `PatientProfile`(`patientProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapeuticObjective` ADD CONSTRAINT `TherapeuticObjective_therapistProfileId_fkey` FOREIGN KEY (`therapistProfileId`) REFERENCES `TherapistProfile`(`therapistProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scenario` ADD CONSTRAINT `Scenario_patientProfileId_fkey` FOREIGN KEY (`patientProfileId`) REFERENCES `PatientProfile`(`patientProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scenario` ADD CONSTRAINT `Scenario_therapistProfileId_fkey` FOREIGN KEY (`therapistProfileId`) REFERENCES `TherapistProfile`(`therapistProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consultation` ADD CONSTRAINT `Consultation_patientProfileId_fkey` FOREIGN KEY (`patientProfileId`) REFERENCES `PatientProfile`(`patientProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consultation` ADD CONSTRAINT `Consultation_therapistProfileId_fkey` FOREIGN KEY (`therapistProfileId`) REFERENCES `TherapistProfile`(`therapistProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_patientProfileId_fkey` FOREIGN KEY (`patientProfileId`) REFERENCES `PatientProfile`(`patientProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_therapistProfileId_fkey` FOREIGN KEY (`therapistProfileId`) REFERENCES `TherapistProfile`(`therapistProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_consultationId_fkey` FOREIGN KEY (`consultationId`) REFERENCES `Consultation`(`consultationId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `SessionData` RENAME INDEX `SessionData_userId_fkey` TO `SessionData_userId_idx`;
