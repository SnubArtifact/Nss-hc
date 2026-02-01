-- CreateEnum
CREATE TYPE "HourCategories" AS ENUM ('Dept', 'Meet', 'Event', 'Misc');

-- AlterTable
ALTER TABLE "HourLogs" ADD COLUMN     "category" "HourCategories" NOT NULL DEFAULT 'Misc';
