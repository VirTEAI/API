-- DropForeignKey
ALTER TABLE `PatientProfile` DROP FOREIGN KEY `PatientProfile_therapistId_fkey`;

-- AlterTable
ALTER TABLE `PatientProfile` MODIFY `therapistId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`therapistProfileId`) ON DELETE SET NULL ON UPDATE CASCADE;
