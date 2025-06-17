import express from 'express';
import { wrapper } from '../lib/wrapper.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
import { getCoupon, validateCoupon } from '../controllers/coupon.controller.js';
const router = express.Router();

router.get('/', protectedRoute, wrapper(getCoupon));
router.get('/validate', protectedRoute, wrapper(validateCoupon));

export default router;
