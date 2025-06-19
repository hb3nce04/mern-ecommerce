import express from 'express';
import { wrapper } from '../lib/wrapper.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
import { createCheckoutSession, checkoutSuccess } from '../controllers/payment.controller.js';
const router = express.Router();

router.post('/create-checkout-session', protectedRoute, wrapper(createCheckoutSession));
router.post('/checkout-success', protectedRoute, wrapper(checkoutSuccess));

export default router;
