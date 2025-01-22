import { body } from 'express-validator';

export const budgetValidation = [
	body('name').notEmpty().withMessage("Name can't be empty."),
	body('amount')
		.notEmpty()
		.withMessage("Amount can't be empty.")
		.isNumeric()
		.withMessage('Invalid amount.')
		.custom((value) => value > 0)
		.withMessage('Amount must be greater than 0.'),
];
