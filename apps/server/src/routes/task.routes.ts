import { Router } from 'express';
import { getTasks, addTask, removeTask } from '@/controllers/task.controller';

const router = Router();

router.get('/', getTasks);
router.post('/', addTask);
router.delete('/:id', removeTask);

export const taskRouter = router;
