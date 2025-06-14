import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

import indexRoute from './routes/index.route.js';
import { connectDB } from './lib/db.js';

const app = express();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

app.use(express.json());
app.use(cookieParser());

app.use('/api', indexRoute);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Internal Server Error' });
});

connectDB().then(() => {
	app.listen(3000, () => {
		console.log(`Server is running on http://localhost:${PORT}`);
		console.log(`Environment: ${ENV}`);
	});
});
