-- CreateEnum
CREATE TYPE "public"."LogStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- AlterEnum
ALTER TYPE "public"."HourCategories" ADD VALUE 'HR';

-- AlterTable
ALTER TABLE "public"."HourLogs" ADD COLUMN     "status" "public"."LogStatus" NOT NULL DEFAULT 'Pending';
