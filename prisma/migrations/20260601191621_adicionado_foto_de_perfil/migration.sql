-- AlterTable
ALTER TABLE `PatientProfile` ADD COLUMN `profilePictureCid` VARCHAR(191) NULL,
    ADD COLUMN `profilePictureKey` VARCHAR(191) NULL,
    ADD COLUMN `profilePictureUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `TherapistProfile` ADD COLUMN `profilePictureCid` VARCHAR(191) NULL,
    ADD COLUMN `profilePictureKey` VARCHAR(191) NULL,
    ADD COLUMN `profilePictureUrl` VARCHAR(191) NULL;
