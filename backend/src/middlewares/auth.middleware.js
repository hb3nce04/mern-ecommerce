import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protectedRoute = async (req, res, next) => {
	const { accessToken } = req.cookies;

	if (!accessToken) {
		return res.status(401).json({ message: 'Unauthorized - No acces token provided' });
	}

	const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
	const user = await User.findById(decoded.userId).select('-password');

	if (!user) {
		return res.status(401).json({ message: 'Unauthorized - User not found' });
	}

	req.user = user;

	next();
};

export const adminRoute = (req, res, next) => {
	if (req.user && req.user.role === 'admin') {
		return next();
	}
	return res.status(403).json({ message: 'Forbidden - Admin only' });
};
