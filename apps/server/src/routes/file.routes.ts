import { Router } from 'express';
import { getFiles, deleteFile } from '@/controllers/file.controller';

const router = Router();

router.get('/', getFiles);
router.delete('/:filename', deleteFile);

export const fileRouter = router;
