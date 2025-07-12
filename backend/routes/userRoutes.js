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
import paymentController from "../controllers/services/paymentController.js";

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

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Endpoints for managing the user cart
 */

/**
 * @swagger
 * /api/user/cart/addProduct:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to add
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product to add
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product or user not found
 *       500:
 *         description: Server error
 */

router.post("/cart/addProduct", (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), userController.addProductToCart);

/**
 * @swagger
 * /api/user/cart/removeProduct:
 *   post:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to remove
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 *       400:
 *         description: Missing product ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.post("/cart/removeProduct", (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), userController.removeProductFromCart);

/**
 * @swagger
 * /api/user/cart/changeQuantity:
 *   post:
 *     summary: Change the quantity of a product in the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product
 *               quantity:
 *                 type: number
 *                 description: New quantity for the product
 *     responses:
 *       200:
 *         description: Cart quantity updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product or user not found
 *       500:
 *         description: Server error
 */

router.post("/cart/changeQuantity", (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), userController.changeCartQuantity);

/**
 * @swagger
 * /user/cart/getCart:
 *   get:
 *     summary: Get the user's cart with product details
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's cart with populated product data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           description:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                       quantity:
 *                         type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.get('/cart/getCart', (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), userController.getCart);

/**
 * @swagger
 * tags:
 *   name: User Orders
 *   description: Endpoints for placing and cancelling user orders
 */

/**
 * @swagger
 * /cart/checkoutCart:
 *   post:
 *     summary: Checkout the user's cart and create an order
 *     tags: [User Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentMethod]
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, cash]
 *     responses:
 *       200:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *                 paymentIntent:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Missing fields or validation error
 *       404:
 *         description: User or product not found
 *       500:
 *         description: Internal server error
 */

router.post("/cart/checkoutCart", (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), paymentController.checkoutCart);

/**
 * @swagger
 * /orders/cancelOrder:
 *   post:
 *     summary: Cancel an existing order if it's not yet shipped or delivered
 *     tags: [User Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order to cancel
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order already shipped, delivered, or cancelled
 *       404:
 *         description: Order or user not found
 *       500:
 *         description: Internal server error
 */

router.post("/orders/cancelOrder", (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), paymentController.cancelOrder);

/**
 * @swagger
 * tags:
 *   name: Product Feedback
 *   description: Rating and reviewing products
 */

/**
 * @swagger
 * /product/rateProduct:
 *   put:
 *     summary: Rate a purchased product
 *     tags: [Product Feedback]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, rating]
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to rate
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *       400:
 *         description: Already rated or validation error
 *       403:
 *         description: User has not purchased the product
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

router.put('/product/rateProduct', (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), userController.rateProduct);

/**
 * @swagger
 * /product/reviews:
 *   post:
 *     summary: Submit a review for a purchased product
 *     tags: [Product Feedback]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, review]
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the product to review
 *               review:
 *                 type: string
 *                 description: The review text
 *     responses:
 *       200:
 *         description: Review submitted successfully
 *       400:
 *         description: Already reviewed or validation error
 *       403:
 *         description: User has not purchased the product
 *       404:
 *         description: Product not found
 */

router.post("/product/reviews", (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), userController.reviewProduct);

router.get("/orders", (req, res, next) => authMiddleware.verifyToken(req, res, next, ['user']), userController.getUserOrders);

export default router;
