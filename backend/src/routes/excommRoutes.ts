import { Role } from "@prisma/client";
import { Router } from "express";
import {
  deleteRemoveUser,
  getMembers,
  getPendingLogs,
  getViewLogs,
  postAddUser,
  postLogApprove,
  postLogReject,
} from "../controllers/excommControllers";
import { checkRole } from "../middleware/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: ExComm
 *   description: ExComm and above operations
 */
const excommRouter = Router();

/**
 * @swagger
 * /api/moderator/add-user:
 *   post:
 *     summary: Add a new user
 *     tags: [ExComm]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               departmentId:
 *                 type: number
 *                 minimum: number
 *                 maximum: number
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                  user:
 *                    $ref: "#/components/schemas/User"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
excommRouter.post(
  "/add-user",
  checkRole([Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]),
  ...postAddUser
);

/**
 * @swagger
 * /api/moderator/remove-user:
 *   delete:
 *     summary: Remove a user
 *     tags: [ExComm]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: User removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
excommRouter.delete(
  "/remove-user",
  checkRole([Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]),
  ...deleteRemoveUser
);

/**
 * @swagger
 * /api/moderator/members?page={page}&amount={amount}:
 *   get:
 *     summary: Get all members
 *     tags: [ExComm]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of all members
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
excommRouter.get(
  "/members",
  checkRole([Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]),
  getMembers
);

/**
 * @swagger
 * /api/moderator/pending:
 *   get:
 *     summary: Get pending logs for verification
 *     tags: [ExComm]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of pending logs
 *       403:
 *         description: Forbidden
 */
excommRouter.get(
  "/pending",
  checkRole([Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]),
  getPendingLogs
);

/**
 * @swagger
 * /api/moderator/view-logs/{userId}?page={page}&amount={amount}:
 *   get:
 *     summary: View logs for a specific user
 *     tags: [ExComm]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of logs for the user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
excommRouter.get("/view-logs/:userId", checkRole([Role.SecondYearPORHolder]), getViewLogs);

/**
 * @swagger
 * /api/moderator/log/approve:
 *   post:
 *     summary: Approve a log entry
 *     tags: [ExComm]
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
 *     responses:
 *       200:
 *         description: Log approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
excommRouter.post(
  "/log/approve",
  checkRole([Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]),
  ...postLogApprove
);

/**
 * @swagger
 * /api/moderator/log/reject:
 *   post:
 *     summary: Reject a log entry
 *     tags: [ExComm]
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
 *     responses:
 *       200:
 *         description: Log rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
excommRouter.post(
  "/log/reject",
  checkRole([Role.SecondYearPORHolder, Role.Coordinator, Role.Trio]),
  ...postLogReject
);

export default excommRouter;
