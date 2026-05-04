-- DropForeignKey
ALTER TABLE `PatientProfile` DROP FOREIGN KEY `PatientProfile_therapistId_fkey`;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
