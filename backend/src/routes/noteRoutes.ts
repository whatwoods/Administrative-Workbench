import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { NoteController } from '../controllers/noteController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', NoteController.getAll);
router.get('/search', NoteController.search);
router.get('/:id', NoteController.getById);
router.get('/:id/versions', NoteController.getVersions);
router.post('/', NoteController.create);
router.patch('/:id', NoteController.update);
router.delete('/:id', NoteController.delete);

export default router;
