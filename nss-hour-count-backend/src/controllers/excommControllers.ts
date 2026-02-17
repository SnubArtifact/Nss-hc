import { Prisma, Role, User } from "@prisma/client";
import {
  deleteUserHelper,
  getTimeDiff,
  getUsersHelper,
  returnIncrementObjectFromCategory,
  validationHelper,
} from "../lib/adminHelpers";
import { prisma } from "../lib/prisma";
import { Req, Res } from "../lib/types";
import {
  validateLogId,
  validateUser,
  validateUserId,
} from "./../lib/adminSchemas";

export const postAddUser = [
  validateUser,
  async (req: Req, res: Res) => {
    try {
      const user = req.user as User;
      validationHelper(req, res);

      const { name, email, departmentId } = req.body;
      const newUser = await prisma?.user.create({
        data: {
          name: name,
          email: email,
          departmentId:
            user.role === Role.Excomm
              ? user.departmentId
              : departmentId || user.departmentId,
        },
      });

      res
        .status(201)
        .json({ message: "User created successfully", newUser: newUser });
      return;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        res.status(409).json("Email already in use");
        return;
      }
      console.log(err);
      res.status(500).json({ message: "An unexpected error occured" });
    }
  },
];

export const deleteRemoveUser = [
  validateUserId,
  async (req: Req, res: Res) => {
    try {
      validationHelper(req, res);

      const user = req.user as User;
      const { id } = req.body;

      const member = await prisma.user.findUnique({
        where: {
          id: parseInt(id),
        },
      });

      if (member && member.id === user.id) {
        res.status(403).json({ message: "You cannot delete yourself" });
        return;
      }

      if (!member) {
        res.status(403).json({ message: "Action forbidden" });
        return;
      }

      if (member.role === Role.Member) {
        deleteUserHelper(req, res);
      } else if (
        member.role === Role.Excomm &&
        (user.role === Role.Coordinator || user.role === Role.Trio)
      ) {
        deleteUserHelper(req, res);
      } else if (member.role === Role.Coordinator && user.role === Role.Trio) {
        deleteUserHelper(req, res);
      } else {
        res.status(403).json({ message: "Action forbidden" });
        return;
      }
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        res.status(404).json({ message: "User not found" });
      } else {
        console.log(err);
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  },
];

export const getMembers = async (req: Req, res: Res) => {
  try {
    const { page = 1, amount = 10 } = req.query;
    const triggerUser = req.user as User;

    const numericPage = Number(page) - 1;
    const numericAmount = Number(amount);
    if (triggerUser.role === Role.Excomm) {
      const [members, memberCount] = await getUsersHelper(
        triggerUser,
        numericPage,
        numericAmount,
        {
          departmentId: triggerUser.departmentId,
          role: Role.Member,
        }
      );

      if (members.length > 0) {
        res.status(200).json({
          message: "success",
          members: members,
          pagination: {
            currentPage: numericPage,
            pageSize: numericAmount,
            totalLogs: memberCount,
            totalPages: Math.ceil(memberCount / numericAmount),
          },
        });
        return;
      } else {
        res.status(404).json({ message: "Members not found" });
        return;
      }
    }

    const [members, memberCount] = await getUsersHelper(
      triggerUser,
      numericPage,
      numericAmount,
      {
        OR: [
          {
            role: Role.Member,
          },
          {
            role: Role.Excomm,
          },
        ],
      }
    );

    if (members.length > 0) {
      res.status(200).json({
        message: "success",
        members: members,
        pagination: {
          currentPage: numericPage,
          pageSize: numericAmount,
          totalLogs: memberCount,
          totalPages: Math.ceil(memberCount / numericAmount),
        },
      });
      return;
    } else {
      res.status(404).json({ message: "Members not found" });
      return;
    }
  } catch (err) { }
};

export const getViewLogs = async (req: Req, res: Res) => {
  try {
    const { userId } = req.params;
    const { page = 1, amount = 10 } = req.query;
    const user = req.user as User;

    const numericUserId = Number(userId);
    const numericPage = Number(page) - 1;
    const numericAmount = Number(amount);
    if (isNaN(numericUserId) || !Number.isInteger(numericUserId)) {
      res.status(400).json({ message: "User ID must be an integer." });
      return;
    }

    if (numericUserId) {
      const member = await prisma.user.findUnique({
        where: {
          id: numericUserId,
        },
      });

      if (!member) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (
        member.departmentId === user.departmentId &&
        member.role === Role.Member
      ) {
        const [memberLogs, totalCount] = await prisma.$transaction([
          prisma.hourLogs.findMany({
            where: {
              userId: member.id,
            },
            skip: numericPage * numericAmount,
            take: numericAmount,
            orderBy: {
              submittedAt: "asc",
            },
          }),
          prisma.hourLogs.count({
            where: {
              userId: member.id,
            },
          }),
        ]);

        if (memberLogs.length > 0) {
          res.status(200).json({
            message: "success",
            logs: memberLogs,
            pagination: {
              currentPage: numericPage,
              pageSize: numericAmount,
              totalLogs: totalCount,
              totalPages: Math.ceil(totalCount / numericAmount),
            },
          });
          return;
        } else {
          res.status(404).json({ message: "Logs not found" });
          return;
        }
      } else {
        res.status(403).json({ message: "Forbidden Action" });
        return;
      }
    } else {
      res.status(400).json({ message: "User ID must be a natural number" });
      return;
    }
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      res.status(404).json({ message: "Logs not found" });
    } else {
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const postLogApprove = [
  validateLogId,
  async (req: Req, res: Res) => {
    try {
      validationHelper(req, res);

      const { id } = req.body;
      const logId = parseInt(id as string);
      const triggerUser = req.user as User;

      const hourLog = await prisma.hourLogs.findUnique({
        where: {
          id: logId,
        },
        select: {
          user: {
            select: {
              id: true,
              departmentId: true,
              role: true,
            },
          },
          startTime: true,
          endTime: true,
          id: true,
          category: true,
        },
      });

      if (hourLog && hourLog.user) {
        console.log("Approve Request:", {
          triggerUser: { role: triggerUser.role, dept: triggerUser.departmentId },
          targetUser: { role: hourLog.user.role, dept: hourLog.user.departmentId },
          logId: logId
        });

        if (
          triggerUser.role === Role.Excomm &&
          (hourLog.user.departmentId !== triggerUser.departmentId ||
            hourLog.user.role !== Role.Member)
        ) {
          console.log("Approval Forbidden: Checks failed");
          res.status(403).json({ message: "Action forbidden" });
          return;
        }

        const hrCount = getTimeDiff(hourLog.startTime, hourLog.endTime);

        const incObj = returnIncrementObjectFromCategory(
          hrCount,
          hourLog.category
        );

        const [updatedUser] = await prisma.$transaction([
          prisma.user.update({
            where: {
              id: hourLog.user.id,
            },
            data: incObj,
          }),
          prisma.hourLogs.update({
            where: {
              id: logId,
            },
            data: {
              status: "Approved",
            },
          }),
        ]);

        if (updatedUser) {
          res.status(200).json({
            message: "Hour count updated",
            newHourCounts: {
              hourCountDept: updatedUser.hourCountDept,
              hourCountEvent: updatedUser.hourCountEvent,
              hourCountMeet: updatedUser.hourCountMeet,
              hourCountMisc: updatedUser.hourCountMisc,
            },
          });
        }
      } else {
        res.status(404).json({ message: "Log not found" });
        return;
      }
    } catch (err) {
      console.log(err);

      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }

      res.status(500).json({ message: "Something went wrong" });
    }
  },
];

export const postLogReject = [
  validateLogId,
  async (req: Req, res: Res) => {
    try {
      validationHelper(req, res);

      const { id } = req.body;
      const logId = parseInt(id as string);
      const user = req.user as User;

      const log = await prisma.hourLogs.findUnique({
        where: {
          id: logId,
        },
        select: {
          user: {
            select: {
              departmentId: true,
            },
          },
        },
      });

      if (!log) {
        res.status(404).json({ message: "Not found" });
        return;
      }

      if (
        user.role === Role.Excomm &&
        user.departmentId !== log.user.departmentId
      ) {
        res.status(403).json({ message: "Forbidden Action" });
        return;
      }

      const deletedLog = await prisma.hourLogs.update({
        where: {
          id: logId,
        },
        data: {
          status: "Rejected",
        },
      });

      res.status(200).json({ message: "Log rejected", deletedLog });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        res.status(404).json({ message: "User not found" });
      } else {
        console.log(err);
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  },
];

export const getPendingLogs = async (req: Req, res: Res) => {
  try {
    const user = req.user as User;

    let whereClause: Prisma.HourLogsWhereInput = {
      status: "Pending",
    };

    if (user.role === Role.Excomm) {
      whereClause = {
        ...whereClause,
        user: {
          departmentId: user.departmentId,
          role: Role.Member,
        },
      };
    }

    const pendingLogs = await prisma.hourLogs.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            role: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "asc",
      },
    });

    res.status(200).json({ message: "Success", logs: pendingLogs });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
