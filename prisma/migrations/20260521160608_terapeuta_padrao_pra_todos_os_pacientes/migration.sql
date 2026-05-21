/*
  Warnings:

  - Made the column `therapistId` on table `PatientProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `PatientProfile` DROP FOREIGN KEY `PatientProfile_therapistId_fkey`;

-- AlterTable
ALTER TABLE `PatientProfile` MODIFY `therapistId` INTEGER NOT NULL DEFAULT 21;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
