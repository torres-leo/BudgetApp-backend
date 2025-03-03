import { Router } from 'express';

import { BudgetController } from '../contollers/BudgetController';
import { ExpensesController } from '../contollers/ExpenseController';

import { budgetExistValidator, budgetIdValidator, budgetInfoValidator, hasAccess } from '../middleware/budget';
import { expenseExistValidator, expenseIdValidator, expenseInfoValidator } from '../middleware/expense';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Every time we use the id parameter in a route, we need to validate it.
router.param('budgetId', budgetIdValidator);
router.param('budgetId', budgetExistValidator);
router.param('budgetId', hasAccess);


router.param('expenseId', expenseIdValidator);
router.param('expenseId', expenseExistValidator);

// Routes
router.get('/', BudgetController.getAll);
router.post('/', budgetInfoValidator, handleInputErrors, BudgetController.create);
router.get('/:budgetId', BudgetController.getById);
router.put('/:budgetId', budgetInfoValidator, handleInputErrors, BudgetController.update);
router.delete('/:budgetId', BudgetController.delete);

// Routes for expenses
router.post('/:budgetId/expenses', expenseInfoValidator, handleInputErrors, ExpensesController.create);
router.get('/:budgetId/expenses/:expenseId', ExpensesController.getById);
router.put('/:budgetId/expenses/:expenseId', expenseInfoValidator, handleInputErrors, ExpensesController.update);
router.delete('/:budgetId/expenses/:expenseId', ExpensesController.delete);

export default router;
