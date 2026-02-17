import { Role } from "@prisma/client";
import { Router } from "express";
import {
  postPromoteUserToCoord,
  postPromoteUserToExcomm,
} from "../controllers/adminControllers";
import { checkRole } from "../middleware/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only operations
 */
const adminRouter = Router();

/**
 * @swagger
 * /api/admin/promote/excomm:
 *   post:
 *     summary: Promote a user to ExComm
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *                 minimum: 1
 *               departmentId:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 8
 *     responses:
 *       200:
 *         description: User promoted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
adminRouter.post(
  "/promote/excomm",
  checkRole([Role.Coordinator, Role.Trio]),
  ...postPromoteUserToExcomm
);

/**
 * @swagger
 * /api/admin/promote/coord:
 *   post:
 *     summary: Promote a user to Coordinator
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *                 minimum: 1
 *               departmentId:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 8
 *     responses:
 *       200:
 *         description: User promoted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
adminRouter.post(
  "/promote/coord",
  checkRole([Role.Trio]),
  ...postPromoteUserToCoord
);

export default adminRouter;
