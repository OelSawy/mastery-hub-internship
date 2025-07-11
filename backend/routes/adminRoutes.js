import express from "express";
import authController from "../controllers/services/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminController from "../controllers/adminController.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: Admin authentication and account management
 */

/**
 * @swagger
 * /api/admin/addAdmin:
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
 * /api/admin/login:
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
 * /api/admin/refresh-token:
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
 * /api/admin/logout:
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
 * /api/admin/requestOtp:
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
 * /api/admin/verifyOTP:
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
 * /api/admin/changePassword:
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
 * /api/admin/changeForgotPassword:
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

/**
 * @swagger
 * tags:
 *   name: Admin products
 *   description: Admin products management
 */

/**
 * @swagger
 * /api/admin/addProduct:
 *   post:
 *     summary: Add a new product
 *     tags: [Admin products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, quantity]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Validation error
 */

router.post(
  "/addProduct",
  (req, res, next) => authMiddleware.verifyToken(req, res, next, ["admin"]),
  adminController.addProduct
);

/**
 * @swagger
 * /api/admin/uploadPicture:
 *   post:
 *     summary: Upload a picture for a product
 *     tags: [Admin products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Uploaded successfully
 *       400:
 *         description: Missing image file
 */

router.post(
  "/uploadPicture",
  (req, res, next) => authMiddleware.verifyToken(req, res, next, ["admin"]),
  upload.single("file"),
  adminController.uploadPicture
);

/**
 * @swagger
 * /api/admin/editProduct:
 *   put:
 *     summary: Edit an existing product
 *     tags: [Admin products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error or ID format issue
 *       404:
 *         description: Product not found
 */

router.put(
  "/editProduct",
  (req, res, next) => authMiddleware.verifyToken(req, res, next, ["admin"]),
  adminController.editProduct
);

/**
 * @swagger
 * /api/admin/deleteProduct/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID format
 *       404:
 *         description: Product not found
 */

router.delete(
  "/deleteProduct/:id",
  (req, res, next) => authMiddleware.verifyToken(req, res, next, ["admin"]),
  adminController.deleteProduct
);

/**
 * @swagger
 * /api/admin/viewOrders:
 *   get:
 *     summary: View all orders with user information
 *     tags: [Admin products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all orders with user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productId:
 *                               type: string
 *                             quantity:
 *                               type: number
 *                       totalAmount:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Error fetching orders
 */

router.get("/viewOrders", adminController.viewOrders);

export default router;
