import express from 'express';
import authRoutes from '../routes/auth.route.js';
import productRoutes from '../routes/product.route.js';
import cartRoutes from '../routes/cart.route.js';
import couponRoutes from '../routes/coupon.route.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);

export default router;
