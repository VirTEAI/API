-- AlterTable
ALTER TABLE `PatientProfile` ADD COLUMN `therapistId` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`therapistProfileId`) ON DELETE RESTRICT ON UPDATE CASCADE;
