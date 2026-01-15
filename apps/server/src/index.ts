import express from 'express';
import cors from 'cors';
import path from 'path';
import { initRoutes } from '@/routes';
import { getServerPaths, loadSecureEnv } from '@repo/shared/node';
import { authMiddleware } from '@/middlewares/auth.middleware';

const { PROJECT_ROOT, CLIENT_DIST_PATH } = getServerPaths(__dirname);
loadSecureEnv(PROJECT_ROOT);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(authMiddleware);


initRoutes(app)

app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`);
});
