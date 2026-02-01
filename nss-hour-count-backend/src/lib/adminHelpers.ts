import { HourCategories, Prisma, Role, User } from "@prisma/client";
import { validationResult } from "express-validator";
import { prisma } from "./prisma";
import { Req, Res } from "./types";

export const validationHelper = (req: Req, res: Res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(404).json({ message: "Validation failed", errors: errors });
    return;
  }
};

export const promoteUser = async (req: Req, res: Res, role: Role) => {
  validationHelper(req, res);

  const { id, departmentId } = req.body;

  const updatedUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      role: role,
      departmentId: departmentId,
    },
  });

  res.status(200).json({ message: "Success", updatedUser });
  return;
};

export const deleteUserHelper = async (req: Req, res: Res) => {
  const { id } = req.body;
  const deletedUser = await prisma.user.delete({
    where: {
      id: parseInt(id),
    },
  });

  if (deletedUser) {
    const deletedLogs = await prisma.hourLogs.deleteMany({
      where: {
        userId: deletedUser.id,
      },
    });

    res.status(200).json({ message: "User deleted", deletedUser, deletedLogs });
    return;
  } else {
    res
      .status(200)
      .json({ message: "User deleted", deletedUser, deletedLogs: [] });
    return;
  }
};

export const addHoursHelper = async (
  req: Req,
  res: Res,
  startDateTime: Date,
  endDateTime: Date,
  category: HourCategories
) => {
  const user = req.user as User;
  const differenceMS = endDateTime.getTime() - startDateTime.getTime();
  const differenceHr = differenceMS / (1000 * 60 * 60);

  const incObj = returnIncrementObjectFromCategory(differenceHr, category);

  // add this to the existing hour count of the user
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: incObj,
  });

  if (updatedUser) {
    res.status(200).json({ message: "Hours added" });
    return;
  }

  res.status(404).json({ message: "Invalid user" });
  return;
};

export const getTimeDiff = (startDateTime: Date, endDateTime: Date) => {
  const differenceMS = endDateTime.getTime() - startDateTime.getTime();
  return differenceMS / (1000 * 60 * 60);
};

export const getUsersHelper = async (
  triggerUser: User,
  numericPage: number,
  numericAmount: number,
  whereObject: Prisma.UserWhereInput
) => {
  const data = await prisma.$transaction([
    prisma.user.findMany({
      where: whereObject,
      select: {
        name: true,
        _count: {
          select: {
            hourLogs: true,
          },
        },
        id: true,
        hourCountDept: true,
        hourCountMeet: true,
        hourCountEvent: true,
        hourCountMisc: true,
        role: true,
        email: true,
        departmentId: true,
      },
      skip: numericPage * numericAmount,
      take: numericAmount,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({
      where: whereObject,
    }),
  ]);

  return data;
};

export function returnIncrementObjectFromCategory(
  hrCount: number,
  category: HourCategories
) {
  let incrementObject: {
    hourCountDept?: {
      increment: typeof hrCount;
    };
    hourCountEvent?: {
      increment: typeof hrCount;
    };
    hourCountMisc?: {
      increment: typeof hrCount;
    };
    hourCountMeet?: {
      increment: typeof hrCount;
    };
  };
  switch (category) {
    case "Dept":
      incrementObject = {
        hourCountDept: {
          increment: hrCount,
        },
      };
    case "Event":
      incrementObject = {
        hourCountEvent: {
          increment: hrCount,
        },
      };
    case "Meet":
      incrementObject = {
        hourCountMeet: {
          increment: hrCount,
        },
      };
    case "Misc":
      incrementObject = {
        hourCountMisc: {
          increment: hrCount,
        },
      };
  }

  return incrementObject;
}
