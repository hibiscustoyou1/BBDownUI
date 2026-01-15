import { Router } from 'express';
import { getPreference, updatePreference } from '@/controllers/preference.controller';

const router = Router();

router.get('/', getPreference);
router.patch('/', updatePreference);

export const preferenceRouter = router;
