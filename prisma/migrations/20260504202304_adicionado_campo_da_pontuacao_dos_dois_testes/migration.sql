/*
  Warnings:

  - You are about to drop the column `testScore` on the `PatientProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PatientProfile` DROP COLUMN `testScore`,
    ADD COLUMN `test10Score` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `test50Score` INTEGER NOT NULL DEFAULT 0;
