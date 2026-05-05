/*
  Warnings:

  - You are about to drop the column `country` on the `PatientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `TherapistProfile` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `TherapistProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PatientProfile` DROP COLUMN `country`;

-- AlterTable
ALTER TABLE `TherapistProfile` DROP COLUMN `country`,
    DROP COLUMN `position`;
