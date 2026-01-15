import { Router, Express } from 'express';
import { helloRouter } from './hello.routes';
import { taskRouter } from './task.routes';
import { bilibiliRouter } from './bilibili.routes';
import { fileRouter } from './file.routes';
import { authRouter } from './auth.routes';
import { preferenceRouter } from './preference.routes'; // Import

const routes = Router();

routes.use('/api', helloRouter);
routes.use('/api/tasks', taskRouter);
routes.use('/api/bilibili', bilibiliRouter);
routes.use('/api/files', fileRouter);
routes.use('/api/auth', authRouter);
routes.use('/api/preferences', preferenceRouter);
routes.use('/api/auth', authRouter);

export const initRoutes = (app: Express) => {
  app.use(routes);
  
  // 404 Handler
  app.all(/^\/api\/.*$/, (req, res) => {
    console.warn(`⚠️ API 404: ${req.path}`);
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });
};
