import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { redis } from '../lib/redis.js';

const generateTokens = userId => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '15m',
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: '7d',
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`refreshToken:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
};

const setAccessToken = (res, accessToken) => {
	res.cookie('accessToken', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'prod',
		sameSite: 'strict',
		maxAge: 15 * 60 * 1000,
	});
};

const setRefreshToken = (res, refreshToken) => {
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'prod',
		sameSite: 'Strict',
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	const userExists = await User.findOne({ email });

	if (userExists) {
		return res.status(400).send('User already exists');
	}
	const user = await User.create({ name, email, password });

	res.status(201).json({
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
		message: 'User created successfully',
	});
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (!user || !(await user.comparePassword(password))) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}

	const { accessToken, refreshToken } = generateTokens(user._id);
	await storeRefreshToken(user._id, refreshToken);
	setAccessToken(res, accessToken);
	setRefreshToken(res, refreshToken);

	res.status(201).json({
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
		message: 'Logged in successfully',
	});
};

export const logout = async (req, res) => {
	const { refreshToken } = req.cookies;
	if (refreshToken) {
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		await redis.del(`refreshToken:${decoded.userId}`);
	}
	res.clearCookie('accessToken');
	res.clearCookie('refreshToken');
	res.json({
		message: 'Logged out successfully',
	});
};

export const refreshToken = async (req, res) => {
	const { refreshToken } = req.cookies;

	if (!refreshToken) {
		return res.status(401).json({ message: 'No refresh token provided' });
	}

	const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
	const storedToken = await redis.get(`refreshToken:${decoded.userId}`);

	if (storedToken !== refreshToken) {
		return res.status(401).json({ message: 'Invalid refresh token' });
	}

	const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '15m',
	});

	setAccessToken(res, accessToken);

	res.json({ message: 'Token refreshed successfully' });
};

export const getProfile = async (req, res) => {
	res.json(req.user);
};
