import { Router } from 'express';
import { getProfile, getQRCode, checkQRCode, logout } from '@/controllers/auth.controller';

const router = Router();

router.get('/me', getProfile);
router.get('/qrcode', getQRCode);
router.post('/qrcode/check', checkQRCode);
router.post('/logout', logout);

export const authRouter = router;
