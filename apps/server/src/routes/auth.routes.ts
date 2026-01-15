import { Router } from 'express';
import * as AuthController from '@/controllers/auth.controller';

const router = Router();

// System Auth
router.get('/check', AuthController.checkInitStatus);
router.post('/setup', AuthController.setupSystem);
router.post('/login', AuthController.loginSystem);

// Bilibili Auth
router.get('/qrcode', AuthController.getQrcode);
router.post('/qrcode/check', AuthController.pollQrcode);
router.get('/profile', AuthController.getProfile);
router.post('/logout/bilibili', AuthController.logoutBilibili); // [新增]

export const authRouter = router;
