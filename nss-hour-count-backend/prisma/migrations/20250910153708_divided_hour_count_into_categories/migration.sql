/*
  Warnings:

  - You are about to drop the column `hourCount` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hourCount",
ADD COLUMN     "hourCountDept" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "hourCountEvent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "hourCountMeet" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "hourCountMisc" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
