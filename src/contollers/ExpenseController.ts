import type { Request, Response } from 'express';
import Expense from '../models/Expense';

export class ExpensesController {
	static getAll = async (req: Request, res: Response) => {
		console.log('Get expenses');
	};

	static create = async (req: Request, res: Response) => {
		console.log(req.budget);

		try {
			const expense = new Expense(req.body);
			expense.budgetId = req.budget.id;

			await expense.save();
			res.status(201).json('Expense created successfully');
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: 'Server Error' });
		}
	};

	static getById = async (req: Request, res: Response) => {
		res.json(req.expense);
	};

	static update = async (req: Request, res: Response) => {
		await req.expense.update(req.body);
		res.json('Expense updated sucessfully');
	};

	static delete = async (req: Request, res: Response) => {
		await req.expense.destroy();
		res.json('Expense deleted sucessfully');
	};
}
