/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: Admin authentication and account management
 */

import express from "express";
import authController from "../controllers/services/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /addAdmin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, username]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin added successfully
 *       400:
 *         description: Validation error
 */

router.post("/addAdmin", authController.addAdmin);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, type]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

router.post("/login", authController.login);

/**
 * @swagger
 * /admin/refresh-token:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       403:
 *         description: Missing or invalid token
 */

router.post(
  "/refresh-token",
  authMiddleware.checkBlacklistedToken,
  authController.refreshToken
);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Logout admin user
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

router.post("/logout", authController.logout);

/**
 * @swagger
 * /admin/requestOtp:
 *   post:
 *     summary: Request OTP for admin password reset
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, type]
 *             properties:
 *               username:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [admin]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */

router.post("/requestOtp", authController.requestOtp);

/**
 * @swagger
 * /admin/verifyOTP:
 *   post:
 *     summary: Verify OTP for admin password reset
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp, username, type]
 *             properties:
 *               otp:
 *                 type: string
 *               username:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       401:
 *         description: Invalid or expired OTP
 */

router.post("/verifyOTP", authController.verifyOTP);

/**
 * @swagger
 * /admin/changePassword:
 *   put:
 *     summary: Change admin password (requires authentication)
 *     tags: [Admin Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword, confirmPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 */

router.put(
  "/changePassword",
  (req, res, next) =>
    authMiddleware.verifyToken(req, res, next, ["admin", "user"]),
  authController.changePassword
);

/**
 * @swagger
 * /admin/changeForgotPassword:
 *   put:
 *     summary: Change admin password after OTP verification
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword, type, username]
 *             properties:
 *               newPassword:
 *                 type: string
 *               username:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */

router.put("/changeForgotPassword", authController.changeForgotPassword);

export default router;
