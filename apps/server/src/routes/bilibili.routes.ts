import { Router } from 'express';
import { searchVideos } from '@/controllers/bilibili.controller';

const router = Router();

router.get('/search', searchVideos);
// router.get('/auth/qrcode', getQRCode); // 待实现

export const bilibiliRouter = router;
