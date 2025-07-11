/**
 * @swagger
 * tags:
 *   name: User Auth
 *   description: User authentication and account management
 */

import express from 'express';
import authController from '../controllers/services/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, mobile]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */

router.post('/register', authController.register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login as a user
 *     tags: [User Auth]
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
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */

router.post('/login', authController.login);

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [User Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       403:
 *         description: Missing or invalid token
 */

router.post('/refresh-token', authMiddleware.checkBlacklistedToken, authController.refreshToken);


/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out the user
 *     tags: [User Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Refresh token not found
 */

router.post('/logout', authController.logout);

/**
 * @swagger
 * /requestOtp:
 *   post:
 *     summary: Request a reset OTP
 *     tags: [User Auth]
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
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */

router.post('/requestOtp', authController.requestOtp);

/**
 * @swagger
 * /verifyOTP:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [User Auth]
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

router.post('/verifyOTP', authController.verifyOTP);

/**
 * @swagger
 * /changePassword:
 *   put:
 *     summary: Change password for logged-in user
 *     tags: [User Auth]
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

router.put('/changePassword', (req, res, next) => authMiddleware.verifyToken(req, res, next, ['admin', 'user']), authController.changePassword);

/**
 * @swagger
 * /changeForgotPassword:
 *   put:
 *     summary: Change password after OTP verification
 *     tags: [User Auth]
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

router.put('/changeForgotPassword', authController.changeForgotPassword);

export default router;