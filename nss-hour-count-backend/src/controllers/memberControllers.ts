import { Prisma, Role, User } from "@prisma/client";
import {
  addHoursHelper,
  validationHelper,
  getTimeDiff,
  returnIncrementObjectFromCategory,
} from "../lib/adminHelpers";
import { combineDateTime } from "../lib/memberHelpers";
import { validateHourLog } from "../lib/memberSchemas";
import { prisma } from "../lib/prisma";
import { Req, Res } from "../lib/types";

export const postLogHours = [
  validateHourLog,
  async (req: Req, res: Res) => {
    try {
      validationHelper(req, res);

      const user = req.user as User;

      const {
        startDate,
        endDate,
        startTime,
        endTime,
        task,
        seniorPresent,
        category,
      } = req.body;

      if (startDate && startTime && endDate && endTime && task) {
        const startDateTime = combineDateTime(startDate, startTime);
        const endDateTime = combineDateTime(endDate, endTime);

        if (endDateTime <= startDateTime) {
          res
            .status(400)
            .json({ message: "End Time must be after Start Time" });
          return;
        }

        if (user.role === Role.Coordinator || user.role === Role.Trio) {
          const diffHr = getTimeDiff(startDateTime, endDateTime);
          const incObj = returnIncrementObjectFromCategory(diffHr, category);

          const [newLog, updatedUser] = await prisma.$transaction([
            prisma.hourLogs.create({
              data: {
                startTime: startDateTime,
                endTime: endDateTime,
                task: task,
                userId: user.id,
                seniorPresent: seniorPresent ? seniorPresent : null,
                category: category,
                status: "Approved",
              },
            }),
            prisma.user.update({
              where: { id: user.id },
              data: incObj,
            }),
          ]);

          res.status(201).json({ message: "Log created and approved", newLog });
          return;
        }

        const newLog = await prisma.hourLogs.create({
          data: {
            startTime: startDateTime,
            endTime: endDateTime,
            task: task,
            userId: user.id,
            seniorPresent: seniorPresent ? seniorPresent : null,
            category: category,
            status: "Pending",
          },
        });

        if (newLog) {
          res.status(201).json({ message: "Log created", newLog });
          return;
        } else {
          res.status(500).json({ message: "Log creation failed" });
          return;
        }
      } else {
        res.status(404).json({ message: "Missing fields" });
        return;
      }
    } catch (err: any) {
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  },
];

export const getMyHourLogs = async (req: Req, res: Res) => {
  try {
    const user = req.user as User;

    const myHourLogs = await prisma.hourLogs.findMany({
      where: {
        userId: user.id,
      },
    });

    if (myHourLogs.length > 0) {
      res.status(200).json({ message: "Success", myHourLogs });
    } else {
      res.status(404).json({ message: "Logs not found" });
    }
  } catch (err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      res.status(404).json({ message: "Logs not found" });
      return;
    }
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProfile = async (req: Req, res: Res) => {
  try {
    const user = req.user as User;

    const self = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        name: true,
        role: true,
        department: true,
        email: true,
        hourCountMisc: true,
        hourCountDept: true,
        hourCountEvent: true,
        hourCountMeet: true,
        hourLogs: true,
      },
    });

    if (self) {
      res.status(200).json({ message: "Success", user: self });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
