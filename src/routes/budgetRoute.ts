import { Router } from 'express';

import { BudgetController } from '../contollers/BudgetController';
import { budgetExistValidator, budgetIdValidator, budgetInfoValidator } from '../middleware/budget';
import { handleInputErrors } from '../middleware/validation';

const router = Router();

// Every time we use the id parameter in a route, we need to validate it.
router.param('budgetId', budgetIdValidator);
router.param('budgetId', budgetExistValidator);

// Routes
router.get('/', BudgetController.getAll);
router.post('/', budgetInfoValidator, handleInputErrors, BudgetController.create);
router.get('/:budgetId', BudgetController.getById);
router.put('/:budgetId', budgetInfoValidator, handleInputErrors, BudgetController.update);
router.delete('/:budgetId', BudgetController.delete);

export default router;
