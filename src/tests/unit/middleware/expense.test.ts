import { createRequest, createResponse } from 'node-mocks-http';
import { expenseExistValidator } from '../../../middleware/expense';
import { expenses } from '../../mocks/expenses';
import Expense from '../../../models/Expense';
import { hasAccess } from '../../../middleware/budget';
import { budgets } from '../../mocks/budgets';

jest.mock('../../../models/Expense.ts', () => ({
	findByPk: jest.fn(),
}));

describe('Expenses middleware - expenseExistValidator', () => {
	beforeEach(() => {
		(Expense.findByPk as jest.Mock).mockImplementation((id) => {
			const expense = expenses.filter((item) => item.id === id)[0] ?? null;
			return Promise.resolve(expense);
		});
	});

	it('Should handle non-existing expense', async () => {
		(Expense.findByPk as jest.Mock).mockResolvedValue(null);

		const req = createRequest({
			params: { expenseId: 1 },
		});

		const res = createResponse();
		const next = jest.fn();

		await expenseExistValidator(req, res, next);
		const data = res._getJSONData();

		expect(res.statusCode).toBe(404);
		expect(data).toEqual({ message: 'Expense not found' });
		expect(next).not.toHaveBeenCalled();
	});

	it('Should call next() middleware if expense exist', async () => {
		const req = createRequest({
			params: { expenseId: 1 },
		});

		const res = createResponse();
		const next = jest.fn();
		await expenseExistValidator(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(next).toHaveBeenCalledTimes(1);
		expect(req.expense).toEqual(expenses[0]);
	});

	it('Shoul handle internal server error', async () => {
		(Expense.findByPk as jest.Mock).mockRejectedValue(new Error());

		const req = createRequest({
			params: { expenseId: 1 },
		});

		const res = createResponse();
		const next = jest.fn();
		await expenseExistValidator(req, res, next);
		const data = res._getJSONData();

		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(500);
		expect(data).toEqual({ message: 'Server Error' });
	});

	it('Should prevent unauthorized users from adding expenses', () => {
		const req = createRequest({
			method: 'POST',
			url: '/api/budgets/:budgetId/expenses',
			budget: budgets[0],
			user: { id: 20 },
			body: { name: 'Expense test', amount: 20 },
		});

		const res = createResponse();
		const next = jest.fn();

		hasAccess(req, res, next);

		const data = res._getJSONData();
		expect(res.statusCode).toBe(401);
		expect(data).toEqual({ message: 'Invalid action' });
		expect(next).not.toHaveBeenCalled();
	});
});
