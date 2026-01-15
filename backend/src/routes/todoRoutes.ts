import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { TodoController } from '../controllers/todoController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', TodoController.getAll);
router.get('/:id', TodoController.getById);
router.post('/', TodoController.create);
router.patch('/:id', TodoController.update);
router.delete('/:id', TodoController.delete);
router.post('/reorder', TodoController.reorder);

export default router;
