import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 5,
	message: 'Too many requests from this IP, please try again after 30 minutes',
});
