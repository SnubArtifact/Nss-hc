-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('Member', 'SecondYearPORHolder', 'Coordinator', 'Trio');

-- CreateEnum
CREATE TYPE "public"."HourCategories" AS ENUM ('Dept', 'Meet', 'Event', 'Misc', 'HR');

-- CreateEnum
CREATE TYPE "public"."LogStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'Member',
    "specificPosition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departmentId" INTEGER NOT NULL,
    "hourCountDept" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hourCountMeet" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hourCountEvent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hourCountMisc" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HourLogs" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "task" TEXT NOT NULL,
    "seniorPresent" TEXT,
    "category" "public"."HourCategories" NOT NULL DEFAULT 'Misc',
    "status" "public"."LogStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "HourLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "public"."Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "public"."Session"("sid");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HourLogs" ADD CONSTRAINT "HourLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
