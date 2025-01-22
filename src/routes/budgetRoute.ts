import { Router } from 'express';
import { BudgetController } from '../contollers/BudgetController';
import { budgetValidation } from '../validators/budgets';
import { handleInputErrors } from '../middleware/validation';

const router = Router();

router.get('/', BudgetController.getAll);
router.post('/', budgetValidation, handleInputErrors, BudgetController.create);
router.get('/:id', BudgetController.getById);
router.put('/:id', BudgetController.update);
router.delete('/:id', BudgetController.delete);

export default router;
