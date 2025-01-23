import type { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword } from '../helpers/auth';
import { generateToken } from '../helpers/userToken';
import { AuthEmail } from '../emails/AuthEmail';

export class AuthController {
	static async createAccount(req: Request, res: Response) {
		const { email } = req.body;

		const userExist = await User.findOne({ where: { email } });

		if (userExist) {
			res.status(409).json({ message: 'Email is already use.' });
			return;
		}

		try {
			const user = new User(req.body);
			user.password = await hashPassword(req.body.password);
			user.token = generateToken();

			await user.save();
			await AuthEmail.sendConfirmationEmail({ email: user.email, name: user.name, token: user.token });

			res.json('User created successfully');
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: 'Server Error' });
		}
	}

	static async getById(req: Request, res: Response) {}

	static async update(req: Request, res: Response) {}

	static async delete(req: Request, res: Response) {}
}
