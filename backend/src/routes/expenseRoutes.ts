import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { ExpenseController } from '../controllers/expenseController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ExpenseController.getAll);
router.get('/stats', ExpenseController.getStats);
router.post('/', ExpenseController.create);
router.patch('/:id', ExpenseController.update);
router.delete('/:id', ExpenseController.delete);
router.post('/bulk-import', ExpenseController.bulkImport);

export default router;
