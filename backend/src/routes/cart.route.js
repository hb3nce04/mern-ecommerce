import express from 'express';
import {
	addToCart,
	getCartProducts,
	removeAllFromCart,
	updateQuantity,
} from '../controllers/cart.controller.js';
import { wrapper } from '../lib/wrapper.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', protectedRoute, wrapper(getCartProducts));
router.post('/', protectedRoute, wrapper(addToCart));
router.delete('/', protectedRoute, wrapper(removeAllFromCart));
router.put('/:id', protectedRoute, wrapper(updateQuantity));

export default router;
