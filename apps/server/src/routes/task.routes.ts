import { Router } from 'express';
import { getTasks, addTask, removeTask, getVersion } from '@/controllers/task.controller';

const router = Router();

router.get('/', getTasks);
router.post('/', addTask);
router.delete('/:id', removeTask);
router.get('/version', getVersion);

export const taskRouter = router;
