import { transport } from '../config/nodemailer';

type EmailType = {
	name: string;
	email: string;
	token: string;
};

export class AuthEmail {
	static async sendConfirmationEmail(user: EmailType) {
		const email = await transport.sendMail({
			from: 'BudgetApp <admin@budgetapp.com>',
			to: user.email,
			subject: 'BudgetApp - Confirm your email',
			html: `<h1>Hello ${user.name},</h1><p>Click <a href="${process.env.FRONTEND_URL}/auth/confirm-account">here</a> to confirm your email</p>
      <p>Enter the token: <b>${user.token}</b></p>`,
		});

		console.log('Email sent: %s', email.messageId);
	}

	static async sendResetPasswordToken(user: EmailType) {
		const email = await transport.sendMail({
			from: 'BudgetApp <admin@budgetapp.com>',
			to: user.email,
			subject: 'BudgetApp - Reset Password',
			html: `<h1>Hello ${user.name},</h1><p>Click <a href="${process.env.FRONTEND_URL}/auth/reset-password">here</a> to reset your password</p>
      <p>Enter the token: <b>${user.token}</b></p>`,
		});

		console.log('Email sent: %s', email.messageId);
	}
}
