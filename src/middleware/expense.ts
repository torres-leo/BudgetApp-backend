import type { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import Expense from '../models/Expense';

declare global {
  namespace Express {
    interface Request {
      expense?: Expense;
    }
  }
}

export const expenseInfoValidator = async (req: Request, res: Response, next: NextFunction) => {
  await body('name').notEmpty().withMessage("Name can't be empty.").run(req);
  await body('amount')
    .notEmpty()
    .withMessage("Amount can't be empty.")
    .isNumeric()
    .withMessage('Invalid amount')
    .custom((value) => value > 0)
    .withMessage('Amount must be greater than 0')
    .run(req);

  next();
};

export const expenseIdValidator = async (req: Request, res: Response, next: NextFunction) => {
  await param('expenseId')
    .isInt()
    .withMessage('Invalid expense id')
    .custom((value) => value > 0)
    .withMessage('Invalid expense id')
    .run(req);

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const expenseExistValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    req.expense = expense;

    next();
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const belongsToBudget = async (req: Request, res: Response, next: NextFunction) => {
  if (req.budget.id !== req.expense.budgetId) {
    const error = new Error("Invalid action")

    return res.status(403).json({ message: error.message })
  }

  next()
}