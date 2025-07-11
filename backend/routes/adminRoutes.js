import express from 'express';
import authController from '../controllers/services/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/addAdmin', authController.addAdmin);
router.post('/login', authController.login);
// router.post('/refresh-token', authMiddleware.checkBlacklistedToken, authController.refreshToken);
router.post('/logout', authController.logout);
// router.post('/requestOtp', authController.requestOtp);
// router.post('/verifyOTP', authController.verifyOTP);
// router.put('/changePassword', (req, res, next) => authMiddleware.verifyToken(req, res, next, ['admin', 'user']), authController.changePassword);
// router.put('/changeForgotPassword', authController.changeForgotPassword);

export default router;