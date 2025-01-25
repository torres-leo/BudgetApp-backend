import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	const bearer = req.headers.authorization;

	if (!bearer) {
		res.status(401).json({ message: 'Unauthorized.' });
		return;
	}

	const [text, token] = bearer.split(' ');

	if (!token) {
		res.status(401).json({ message: 'Invalid token.' });
		return;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (typeof decoded === 'object' && decoded.id) {
			req.user = await User.findOne({ where: { id: decoded.id }, attributes: ['id', 'name', 'email'] });

			next();
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Server Error' });
	}
};
