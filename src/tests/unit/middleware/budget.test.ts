import { createRequest, createResponse } from 'node-mocks-http';
import { budgetExistValidator, hasAccess } from '../../../middleware/budget';
import Budget from '../../../models/Budget';
import { budgets } from '../../mocks/budgets';

jest.mock('../../../models/Budget', () => ({
	findByPk: jest.fn(),
}));

describe('Budget middleware- budgetExistValidator', () => {
	it('Should handle non-existing budget', async () => {
		(Budget.findByPk as jest.Mock).mockResolvedValue(null);

		const req = createRequest({
			params: { budgetId: 1 },
		});

		const res = createResponse();

		const next = jest.fn();
		await budgetExistValidator(req, res, next);
		const data = res._getJSONData();

		expect(res.statusCode).toBe(404);
		expect(data).toEqual({ message: 'Budget not found' });
		expect(next).not.toHaveBeenCalled();
	});

	it('Should procede to next middleware if budget exist', async () => {
		(Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);

		const req = createRequest({
			params: { budgetId: 1 },
		});

		const res = createResponse();

		const next = jest.fn();
		await budgetExistValidator(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(next).toHaveBeenCalledTimes(1);
		expect(req.budget).toEqual(budgets[0]);
	});

	it('Should handle non-existing budget', async () => {
		(Budget.findByPk as jest.Mock).mockRejectedValue(new Error());

		const req = createRequest({
			params: { budgetId: 1 },
		});

		const res = createResponse();

		const next = jest.fn();
		await budgetExistValidator(req, res, next);
		const data = res._getJSONData();

		expect(res.statusCode).toBe(500);
		expect(data).toEqual({ message: 'Server Error' });
		expect(next).not.toHaveBeenCalled();
	});
});

describe('budget middleware - hasAccess', () => {
	it('Should call next(), if user has access to budget', () => {
		const req = createRequest({
			budget: budgets[0],
			user: { id: 1 },
		});

		const res = createResponse();
		const next = jest.fn();

		hasAccess(req, res, next);
		expect(next).toHaveBeenCalled();
		expect(next).toHaveBeenCalledTimes(1);
	});

	it("Should return 401 error if user doesn't have access", () => {
		const req = createRequest({
			budget: budgets[0],
			user: { id: 2 },
		});

		const res = createResponse();
		const next = jest.fn();

		hasAccess(req, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(401);
		expect(res._getJSONData()).toEqual({ message: 'Invalid action' });
	});
});
