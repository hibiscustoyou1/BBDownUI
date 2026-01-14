import { Router, Express } from 'express';
import { helloRouter } from './hello.routes';
import { taskRouter } from './task.routes';
import { bilibiliRouter } from './bilibili.routes';

const routes = Router();

// 注册子路由
routes.use('/api', helloRouter);
routes.use('/api/tasks', taskRouter);
routes.use('/api/bilibili', bilibiliRouter);

export const initRoutes = (app: Express) => {
  app.use(routes);
  
  // 404 Handler
  app.all(/^\/api\/.*$/, (req, res) => {
    console.warn(`⚠️ API 404: ${req.path}`);
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });
};
