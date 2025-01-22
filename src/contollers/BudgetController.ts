import { request, type Request, type Response } from 'express';
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
		console.log('Get by ID');
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
		console.log('Update budget');
	}

	static async delete(req: Request, res: Response) {
		console.log('Delete budget');
	}
}
