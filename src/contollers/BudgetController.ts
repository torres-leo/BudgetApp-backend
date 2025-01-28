import type { Request, Response } from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';

export class BudgetController {
	static async getAll(req: Request, res: Response) {
		try {
			const budgets = await Budget.findAll({
				order: [['createdAt', 'DESC']],
				where: { userId: req.user.id },
			});

			res.json(budgets);
		} catch (error) {
			// console.log(error);
			res.status(500).json({ message: 'Server Error' });
		}
	}

	static async getById(req: Request, res: Response) {
		const budget = await Budget.findByPk(req.budget.id, { include: [Expense] });

		res.json(budget);
	}

	static async create(req: Request, res: Response) {
		try {
			const budget = await Budget.create(req.body);
			budget.userId = req.user.id;

			await budget.save();
			res.status(201).json('Budget created successfully');
		} catch (error) {
			// console.log(error);
			res.status(500).json({ message: 'Server Error' });
		}
	}

	static async update(req: Request, res: Response) {
		await req.budget.update(req.body);
		res.json('Budget updated sucessfully');
	}

	static async delete(req: Request, res: Response) {
		await req.budget.destroy();
		res.json('Budget deleted sucessfully');
	}
}
