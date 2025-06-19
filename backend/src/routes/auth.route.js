import express from 'express';
import { login, logout, signup, refreshToken, getProfile } from '../controllers/auth.controller.js';
import { wrapper } from '../lib/wrapper.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/signup', wrapper(signup));
router.post('/login', wrapper(login));
router.post('/logout', wrapper(logout));
router.post('/refresh-token', wrapper(refreshToken));
router.get('/profile', protectedRoute, wrapper(getProfile));

export default router;
