import { Router } from "express";
import passport from "passport";
import { getAuthStatus, logout } from "../controllers/authControllers";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and session management
 */
const authRouter = Router();

/**
 * @swagger
 * /api/auth/status:
 *   get:
 *     summary: Get user authentication status
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Returns user authentication status and details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     departmentId:
 *                       type: number
 *                     hourCount:
 *                       type: number
 *       401:
 *         description: Not authenticated
 */
authRouter.get("/status", getAuthStatus);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout the user
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to the home page after successful logout.
 */
authRouter.get("/logout", logout);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google for authentication.
 */
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to the dashboard on successful authentication or to an error page on failure.
 */
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.BASE_URL}/dashboard`,
    failureRedirect: `${process.env.BASE_URL}/auth-failed`,
  })
);

export default authRouter;
