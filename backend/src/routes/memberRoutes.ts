import { Role } from "@prisma/client";
import { Router } from "express";
import {
  getMyHourLogs,
  getProfile,
  postLogHours,
} from "../controllers/memberControllers";
import { checkRole } from "../middleware/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: Member
 *   description: Operations for members
 *
 * components:
 *    schemas:
 *      User:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          departmentId:
 *            type: number
 *            minimum: 1
 *            maximum: 8
 *          id:
 *            type: number
 *            minimum: 1
 *          role:
 *            type: string
 *            enum: [Role.Member, Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]
 *          hourCount:
 *            type: number
 *      HourLog:
 *        type: object
 *        properties:
 *          startDate:
 *            type: string
 *            formate: date-time
 *            example: "2023-10-27T11:30:00Z"
 *          endDate:
 *            type: string
 *            formate: date-time
 *            example: "2023-10-27T11:30:00Z"
 *          startTime:
 *            type: string
 *            pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$'
 *          endTime:
 *            type: string
 *            pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$'
 *          task:
 *            type: string
 *          seniorPresent:
 *            type: string
 */
const memberRouter = Router();

/**
 * @swagger
 * /api/member/hour-log:
 *   post:
 *     summary: Log hours for a member
 *     tags: [Member]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/HourLog"
 *     responses:
 *       201:
 *         description: Hours logged successfully
 *         content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/HourLog"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   get:
 *     summary: Get hour logs for the current member
 *     tags: [Member]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of hour logs for the current member
 *         content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/components/schemas/HourLog"
 *
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
memberRouter.post(
  "/hour-log",
  checkRole([Role.Member, Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]),
  ...postLogHours
);
memberRouter.get(
  "/hour-log",
  checkRole([Role.Member, Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]),
  getMyHourLogs
);

memberRouter.get("/profile", getProfile);

export default memberRouter;
