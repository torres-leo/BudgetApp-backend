import type { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import Budget from '../models/Budget';

declare global {
	namespace Express {
		interface Request {
			budget?: Budget;
		}
	}
}

export const budgetInfoValidator = async (req: Request, res: Response, next: NextFunction) => {
	await body('name').notEmpty().withMessage("Name can't be empty.").run(req);
	await body('amount')
		.notEmpty()
		.withMessage("Amount can't be empty.")
		.isNumeric()
		.withMessage('Invalid amount')
		.custom((value) => value > 0)
		.withMessage('Amount must be greater than 0')
		.run(req);

	next();
};

export const budgetIdValidator = async (req: Request, res: Response, next: NextFunction) => {
	await param('budgetId')
		.isInt()
		.withMessage('Invalid budget id')
		.bail()
		.custom((value) => value > 0)
		.withMessage('Invalid budget id')
		.bail()
		.run(req);

	let errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}
	next();
};

export const budgetExistValidator = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { budgetId } = req.params;

		const budget = await Budget.findByPk(budgetId);

		if (!budget) {
			res.status(404).json({ message: 'Budget not found' });
			return;
		}

		req.budget = budget;

		next();
	} catch (error) {
		// console.log(error);
		res.status(500).json({ message: 'Server Error' });
	}
};

export const hasAccess = (req: Request, res: Response, next: NextFunction) => {
	if (req.budget.id !== req.user.id) {
		res.status(401).json({ message: 'Invalid action' });
		return;
	}

	next();
};
