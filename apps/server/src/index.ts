import express from 'express';
import cors from 'cors';
import { initRoutes } from '@/routes';
import { getServerPaths, loadSecureEnv } from '@repo/shared/node';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { bilibiliService } from '@/services/bilibili.service';
import { AppConfig } from "@/config/app.config";

const { PROJECT_ROOT } = getServerPaths(__dirname);
loadSecureEnv(PROJECT_ROOT);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(authMiddleware);
bilibiliService.init().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 服务已启动: http://localhost:${PORT}`);
    console.log(`🚀 BBDown Host: ${AppConfig.BBDOWN_HOST}`);
  });
});

initRoutes(app)


