import { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { belongsToBudget, expenseExistValidator, expenseIdValidator, expenseInfoValidator } from '../middleware/expense';
import { BudgetController } from '../contollers/BudgetController';
import { budgetExistValidator, budgetIdValidator, budgetInfoValidator, hasAccess } from '../middleware/budget';
import { ExpensesController } from '../contollers/ExpenseController';
import { handleInputErrors } from '../middleware/validation';

const router = Router();

router.use(authenticate);

// Every time we use the id parameter in a route, we need to validate it.
router.param('budgetId', budgetIdValidator);
router.param('budgetId', budgetExistValidator);
router.param('budgetId', hasAccess);


router.param('expenseId', expenseIdValidator);
router.param('expenseId', expenseExistValidator);
router.param('expenseId', belongsToBudget);

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
