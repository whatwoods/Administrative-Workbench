import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { NavigationController } from '../controllers/navigationController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', NavigationController.getAll);
router.post('/', NavigationController.create);
router.patch('/:id', NavigationController.update);
router.delete('/:id', NavigationController.delete);
router.post('/reorder', NavigationController.reorder);

export default router;
