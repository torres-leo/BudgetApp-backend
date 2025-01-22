import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator';

export const handleInputErrors: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
	let errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	next();
};
