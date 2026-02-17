-- DropForeignKey
ALTER TABLE "HourLogs" DROP CONSTRAINT "HourLogs_userId_fkey";

-- AddForeignKey
ALTER TABLE "HourLogs" ADD CONSTRAINT "HourLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
