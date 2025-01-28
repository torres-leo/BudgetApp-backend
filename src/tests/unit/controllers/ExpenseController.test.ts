import { createRequest, createResponse } from 'node-mocks-http';

import { expenses } from '../../mocks/expenses';
import { ExpensesController } from '../../../contollers/ExpenseController';
import Expense from '../../../models/Expense';

jest.mock('../../../models/Expense', () => ({
	create: jest.fn(),
}));

describe('ExpenseController.create', () => {
	it('Should create a new expense', async () => {
		const expenseMock = {
			save: jest.fn(),
		};

		(Expense.create as jest.Mock).mockResolvedValue(expenseMock);
		const req = createRequest({
			method: 'POST',
			url: '/api/budgets/:budgetId/expenses',
			body: { name: 'Test Expense', amount: 500 },
			budget: { id: 1 },
		});

		const res = createResponse();
		await ExpensesController.create(req, res);

		const data = res._getJSONData();

		expect(res.statusCode).toBe(201);
		expect(data).toEqual('Expense created successfully');
		expect(expenseMock.save).toHaveBeenCalled();
		expect(expenseMock.save).toHaveBeenCalledTimes(1);
		expect(Expense.create).toHaveBeenCalledWith(req.body);
	});

	it('Should handle expense creation error', async () => {
		const expenseMock = {
			save: jest.fn(),
		};

		(Expense.create as jest.Mock).mockRejectedValue(new Error());
		const req = createRequest({
			method: 'POST',
			url: '/api/budgets/:budgetId/expenses',
			body: { name: 'Test Expense', amount: 500 },
			budget: { id: 1 },
		});

		const res = createResponse();
		await ExpensesController.create(req, res);

		const data = res._getJSONData();

		expect(res.statusCode).toBe(500);
		expect(data).toEqual({ message: 'Server Error' });
		expect(expenseMock.save).not.toHaveBeenCalled();
		expect(Expense.create).toHaveBeenCalledWith(req.body);
	});
});

describe('ExpenseController.getById', () => {
	it('Should update an expense', async () => {
		const expenseMock = {
			...expenses[0],
			update: jest.fn(),
		};

		const req = createRequest({
			method: 'PUT',
			url: '/api/budgets/:budgetId/expenses/:expenseId',
			expense: expenseMock,
			body: { name: 'Updated expense', amount: 90 },
		});

		const res = createResponse();
		await ExpensesController.update(req, res);
		const data = res._getJSONData();

		expect(res.statusCode).toBe(200);
		expect(data).toEqual('Expense updated sucessfully');
		expect(expenseMock.update).toHaveBeenCalled();
		expect(expenseMock.update).toHaveBeenCalledTimes(1);
		expect(expenseMock.update).toHaveBeenCalledWith(req.body);
	});
});

describe('ExpenseController.delete', () => {
	it('Should delete the expense with ID 1', async () => {
		const expenseMock = {
			...expenses[0],
			destroy: jest.fn(),
		};

		const req = createRequest({
			method: 'PUT',
			url: '/api/budgets/:budgetId/expenses/:expenseId',
			expense: expenseMock,
			body: { name: 'Updated expense', amount: 90 },
		});

		const res = createResponse();
		await ExpensesController.delete(req, res);
		const data = res._getJSONData();

		expect(res.statusCode).toBe(200);
		expect(data).toEqual('Expense deleted sucessfully');
		expect(expenseMock.destroy).toHaveBeenCalled();
		expect(expenseMock.destroy).toHaveBeenCalledTimes(1);
	});
});
