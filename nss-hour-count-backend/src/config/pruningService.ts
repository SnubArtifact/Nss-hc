import { prisma } from "../lib/prisma";

const MAX_LOGS_AGE = 2; // in months
const MAX_USER_AGE = 4; // in years

export const runPruning = async () => {
  console.log("Running automatic database pruning cron job");

  try {
    const logsPruningBoundary = new Date();
    logsPruningBoundary.setMonth(logsPruningBoundary.getMonth() - MAX_LOGS_AGE);

    const userPruningBoundary = new Date();
    userPruningBoundary.setFullYear(
      userPruningBoundary.getFullYear() - MAX_USER_AGE
    );

    const deletedLogs = await prisma.hourLogs.deleteMany({
      where: {
        submittedAt: {
          lt: logsPruningBoundary,
        },
      },
    });

    const deletedUsers = await prisma.user.deleteMany({
      where: {
        createdAt: {
          lt: userPruningBoundary,
        },
      },
    });

    console.log(
      `Pruning complete. Deleted ${deletedLogs.count} logs and ${deletedUsers.count} users`
    );
  } catch (err) {
    console.log("An unexpected error occured " + err);
  }
};
