import { Prisma, Role, User } from "@prisma/client";
import { promoteUser } from "../lib/adminHelpers";
import { prisma } from "../lib/prisma";
import { Req, Res } from "../lib/types";
import { validateUserIdAndDept } from "./../lib/adminSchemas";

export const postPromoteUserToExcomm = [
  validateUserIdAndDept,
  async (req: Req, res: Res) => {
    try {
      promoteUser(req, res, Role.Excomm);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  },
];

export const postPromoteUserToCoord = [
  validateUserIdAndDept,
  async (req: Req, res: Res) => {
    try {
      promoteUser(req, res, Role.Coordinator);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  },
];

export const getViewLogs = async (req: Req, res: Res) => {
  try {
    const { userId } = req.params;
    const user = req.user as User;

    const numericUserId = Number(userId);
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

      if (member.role === Role.Member || member.role === Role.Excomm) {
        const memberLogs = await prisma.hourLogs.findMany({
          where: {
            userId: member.id,
          },
        });

        if (memberLogs.length > 0) {
          res.status(200).json({ message: "success", logs: memberLogs });
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
