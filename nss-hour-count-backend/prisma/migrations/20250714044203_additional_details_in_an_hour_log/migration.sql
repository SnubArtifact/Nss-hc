/*
  Warnings:

  - Added the required column `task` to the `HourLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HourLogs" ADD COLUMN     "seniorPresent" TEXT,
ADD COLUMN     "task" TEXT NOT NULL;
