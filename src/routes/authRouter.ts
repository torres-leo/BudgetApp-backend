import { Router } from 'express';
import { body, param } from 'express-validator';

import { AuthController } from '../contollers/AuthController';
import { authenticate } from '../middleware/auth';
import { handleInputErrors } from '../middleware/validation';
import { limiter } from '../config/limiter';

const router = Router();

// Apply rate limiter to all routes
router.use(limiter);

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

router.post(
	'/confirm-account',
	limiter,
	body('token').notEmpty().withMessage('Token is required.').isLength({ min: 6, max: 6 }).withMessage('Invalid token.'),
	handleInputErrors,
	AuthController.confirmAccount
);

router.post(
	'/login',
	body('email').isEmail().withMessage('Invalid email.'),
	body('password').notEmpty().withMessage('Password is required.'),
	handleInputErrors,
	AuthController.login
);

router.post(
	'/forgot-password',
	body('email').isEmail().withMessage('Invalid email.'),
	handleInputErrors,
	AuthController.forgotPassword
);

router.post(
	'/validate-token',
	body('token').notEmpty().withMessage('Token is required.').isLength({ min: 6, max: 6 }).withMessage('Invalid token.'),
	handleInputErrors,
	AuthController.validateToken
);

router.post(
	'/reset-password/:token',
	param('token')
		.notEmpty()
		.withMessage('Token is required.')
		.isLength({ min: 6, max: 6 })
		.withMessage('Invalid token.'),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
	handleInputErrors,
	AuthController.resetPasswordWithToken
);

router.get('/user', authenticate, AuthController.getUser);

router.post(
	'/update-password',
	authenticate,
	body('current_password').notEmpty().withMessage('Current password is required.'),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
	handleInputErrors,
	AuthController.updateCurrentUserPassword
);

router.post(
	'/check-password',
	authenticate,
	body('password').notEmpty().withMessage('Password is required.'),
	handleInputErrors,
	AuthController.checkUserPassword
);
export default router;
