/*
  Warnings:

  - A unique constraint covering the columns `[professionalRegister]` on the table `TherapistProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `PatientProfile` MODIFY `therapistId` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX `TherapistProfile_professionalRegister_key` ON `TherapistProfile`(`professionalRegister`);
