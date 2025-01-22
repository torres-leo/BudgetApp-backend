import type { Request, Response } from 'express';
import Budget from '../models/Budget';

export class BudgetController {
	static async getAll(req: Request, res: Response) {
		try {
			const budgets = await Budget.findAll({
				order: [['createdAt', 'DESC']],
			});

			res.json(budgets);
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: 'Server Error' });
		}
	}

	static async getById(req: Request, res: Response) {
		res.json(req.budget);
	}

	static async create(req: Request, res: Response) {
		try {
			const budget = new Budget(req.body);
			await budget.save();
			res.status(201).json('Budget created successfully');
		} catch (error) {
			console.log(error);
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
