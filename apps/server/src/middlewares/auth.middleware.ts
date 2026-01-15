// apps/server/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppConfig } from '@/config/app.config';
import { ApiCode } from '@repo/shared';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// 白名单路由，不需要登录即可访问
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/setup',
  '/api/auth/check', // 用于前端检查是否已初始化/已登录
  '/api/hello'
];

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (PUBLIC_PATHS.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ code: ApiCode.UNAUTHORIZED, msg: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ code: ApiCode.UNAUTHORIZED, msg: 'Invalid token format' });
  }
  
  try {
    const decoded = jwt.verify(token, AppConfig.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ code: ApiCode.UNAUTHORIZED, msg: 'Invalid or expired token' });
  }
};
