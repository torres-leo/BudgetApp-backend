import type { Request, Response } from 'express';

import { AuthEmail } from '../emails/AuthEmail';
import { checkPassword, hashPassword } from '../helpers/auth';
import { generateJWT } from '../helpers/jwt';
import { generateToken } from '../helpers/userToken';
import User from '../models/User';

export class AuthController {
	static async createAccount(req: Request, res: Response) {
		const { email } = req.body;

		const userExist = await User.findOne({ where: { email } });

		if (userExist) {
			res.status(409).json({ message: 'Email is already use' });
			return;
		}

		try {
			const user = await User.create(req.body);
			user.password = await hashPassword(req.body.password);
			const token = generateToken();

			if (process.env.NODE_ENV !== 'production') {
				globalThis.BudgeAppConfirmationToken = token;
			}

			user.token = token;
			await user.save();
			await AuthEmail.sendConfirmationEmail({ email: user.email, name: user.name, token: user.token });

			res.status(201).json('User created successfully');
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: 'Server Error' });
		}
	}

	static async confirmAccount(req: Request, res: Response) {
		const { token } = req.body;

		const user = await User.findOne({ where: { token } });

		if (!user) {
			res.status(401).json({ message: 'Invalid token' });
			return;
		}

		user.confirmed = true;
		user.token = null;

		user.save();
		res.json('Account confirmed');
	}

	static async login(req: Request, res: Response) {
		const { email, password } = req.body;

		const user = await User.findOne({ where: { email } });

		if (!user) {
			res.status(404).json({ message: 'Email not found' });
			return;
		}

		if (!user.confirmed) {
			res.status(403).json({ message: 'This account has not yet been confirmed' });
			return;
		}

		const isPasswordCorrect = await checkPassword(password, user.password);

		if (!isPasswordCorrect) {
			res.status(401).json({ message: 'Invalid password' });
			return;
		}

		const token = generateJWT(user.id);
		res.status(200).json(token);
	}

	static async forgotPassword(req: Request, res: Response) {
		const { email } = req.body;

		const user = await User.findOne({ where: { email } });

		if (!user) {
			res.status(404).json({ message: 'Email not found' });
			return;
		}

		user.token = generateToken();
		await user.save();
		await AuthEmail.sendResetPasswordToken({ email: user.email, name: user.name, token: user.token });

		res.json("We've sent you an email with instructions to reset your password");
	}

	static async validateToken(req: Request, res: Response) {
		const { token } = req.body;

		const tokenExist = await User.findOne({ where: { token } });
		if (!tokenExist) {
			res.status(404).json({ message: 'Email not found' });
			return;
		}

		res.json('Token is valid');
	}

	static async resetPasswordWithToken(req: Request, res: Response) {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({ where: { token } });
		if (!user) {
			res.status(404).json({ message: 'Invalid Token' });
			return;
		}

		user.password = await hashPassword(password);
		user.token = null;

		await user.save();
		res.json('Password reset successfully');
	}

	static async getUser(req: Request, res: Response) {
		res.json(req.user);
	}

	static async updateCurrentUserPassword(req: Request, res: Response) {
		const { current_password, password } = req.body;
		const { id } = req.user;

		const user = await User.findByPk(id);

		const isPasswordCorrect = await checkPassword(current_password, user.password);

		if (!isPasswordCorrect) {
			res.status(401).json({ message: 'Invalid password' });
			return;
		}

		user.password = await hashPassword(password);
		await user.save();

		res.json('Password updated seccessfully');
	}

	static async checkUserPassword(req: Request, res: Response) {
		const { password } = req.body;
		const { id } = req.user;

		const user = await User.findByPk(id);

		const isPasswordCorrect = await checkPassword(password, user.password);

		if (!isPasswordCorrect) {
			res.status(401).json({ message: 'Invalid password' });
			return;
		}

		res.json('Password is correct');
	}

	static async getById(req: Request, res: Response) {}

	static async delete(req: Request, res: Response) {}
}
