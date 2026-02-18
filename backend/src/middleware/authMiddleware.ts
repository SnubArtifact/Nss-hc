import { Role, User } from "@prisma/client";
import { NextFunction } from "express";
import { Req, Res } from "../lib/types";

export const checkRole = (roles: Role[]) => {
  return (req: Req, res: Res, next: NextFunction) => {
    const user = req.user as User;
    console.log("checkRole middleware " + user);
    if (user && roles.includes(user.role)) {
      next();
    } else {
      res.status(user ? 403 : 401).json({
        message: user
          ? `Action forbidden for role: ${user.role}`
          : "Not authenticated",
      });
    }
  };
};

export const requireAuth = (req: Req, res: Res, next: NextFunction) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  if (req.user) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};
