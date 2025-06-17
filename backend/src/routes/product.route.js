import express from 'express';
import {
	getAllProducts,
	getFeaturedProducts,
	createProduct,
	deleteProduct,
	getRecommendedProducts,
	getProductsByCategory,
	toggleFeaturedProduct,
} from '../controllers/product.controller.js';
import { wrapper } from '../lib/wrapper.js';
import { adminRoute, protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protectedRoute, adminRoute, wrapper(getAllProducts));
router.get('/featured', wrapper(getFeaturedProducts));
router.get('/category/:category', wrapper(getProductsByCategory));
router.get('/recommendations', wrapper(getRecommendedProducts));
router.post('/', protectedRoute, adminRoute, wrapper(createProduct));
router.patch('/:id', protectedRoute, adminRoute, wrapper(toggleFeaturedProduct));
router.delete('/:id', protectedRoute, adminRoute, wrapper(deleteProduct));

export default router;
