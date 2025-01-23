import { Router } from 'express';
import { body } from 'express-validator';

import { AuthController } from '../contollers/AuthController';
import { handleInputErrors } from '../middleware/validation';

const router = Router();

router.post(
	'/create-account',
	body('name')
		.notEmpty()
		.withMessage("Name can't be empty.")
		.isLength({ min: 3 })
		.withMessage('Name must be at least 3 characters long.'),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
	body('email').isEmail().withMessage('Invalid email format.'),
	handleInputErrors,
	AuthController.createAccount
);

export default router;
