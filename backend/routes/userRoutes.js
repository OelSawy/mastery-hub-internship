/**
 * @swagger
 * tags:
 *   name: User Auth
 *   description: User authentication and account management
 */

import express from "express";
import authController from "../controllers/services/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import userController from "../controllers/userController.js";

const router = express.Router();

/**
 * @swagger
 * /api/user/register:
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

router.post("/register", authController.register);

/**
 * @swagger
 * /api/user/login:
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

router.post("/login", authController.login);

/**
 * @swagger
 * /api/user/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [User Auth]
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
 * /api/user/logout:
 *   post:
 *     summary: Log out the user
 *     tags: [User Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Refresh token not found
 */

router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/user/requestOtp:
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

router.post("/requestOtp", authController.requestOtp);

/**
 * @swagger
 * /api/user/verifyOTP:
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

router.post("/verifyOTP", authController.verifyOTP);

/**
 * @swagger
 * /api/user/changePassword:
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

router.put(
  "/changePassword",
  (req, res, next) =>
    authMiddleware.verifyToken(req, res, next, ["admin", "user"]),
  authController.changePassword
);

/**
 * @swagger
 * /api/user/changeForgotPassword:
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

router.put("/changeForgotPassword", authController.changeForgotPassword);

/**
 * @swagger
 * tags:
 *   name: User Products
 *   description: User endpoints for viewing and searching products
 */

/**
 * @swagger
 * /api/user/viewProducts:
 *   get:
 *     summary: View all products
 *     tags: [User Products]
 *     responses:
 *       200:
 *         description: A list of products
 *       500:
 *         description: Error retrieving products
 */

router.get(
  "/viewProducts",
  (req, res, next) => authMiddleware.verifyToken(req, res, next, ["user"]),
  userController.viewProducts
);

/**
 * @swagger
 * /api/user/searchProducts:
 *   get:
 *     summary: Search products by name
 *     tags: [User Products]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name or part of the name of the product
 *     responses:
 *       200:
 *         description: Matching products
 *       400:
 *         description: Invalid product name
 *       404:
 *         description: No matching products found
 */

router.get(
  "/searchProducts",
  (req, res, next) => authMiddleware.verifyToken(req, res, next, ["user"]),
  userController.searchProduct
);

/**
 * @swagger
 * /api/user/filterProducts:
 *   get:
 *     summary: Filter products by price and rating
 *     tags: [User Products]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         required: false
 *         description: Minimum product price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         required: false
 *         description: Maximum product price
 *       - in: query
 *         name: averageRating
 *         schema:
 *           type: number
 *         required: false
 *         description: Minimum average rating
 *     responses:
 *       200:
 *         description: Filtered product list
 *       400:
 *         description: Invalid rating or parameters
 *       404:
 *         description: No matching products
 */

router.get(
  "/filterProducts",
  (req, res, next) => authMiddleware.verifyToken(req, res, next, ["user"]),
  userController.filterProducts
);

/**
 * @swagger
 * /api/user/sortProducts:
 *   get:
 *     summary: Sort products by price (ascending or descending)
 *     tags: [User Products]
 *     parameters:
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [low, high]
 *         required: true
 *         description: Sorting order (low for ascending, high for descending)
 *     responses:
 *       200:
 *         description: Sorted product list
 *       400:
 *         description: Invalid order value
 *       404:
 *         description: No products found
 */

router.get(
  "/sortProducts",
  (req, res, next) => authMiddleware.verifyToken(req, res, next, ["user"]),
  userController.sortProducts
);

export default router;
