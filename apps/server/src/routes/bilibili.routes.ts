import { Router } from 'express';
import { searchVideos, resolveVideo } from '@/controllers/bilibili.controller';

const router = Router();

router.get('/search', searchVideos);
router.get('/resolve/:bvid', resolveVideo); // New Endpoint

export const bilibiliRouter = router;
