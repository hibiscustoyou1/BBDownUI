// apps/server/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { bilibiliService } from '@/services/bilibili.service';
import { ApiCode, ApiResponse } from '@repo/shared';
import fs from 'fs';
import { AppConfig } from '@/config/app.config';

// --- System Auth Endpoints ---

export const checkInitStatus = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const initialized = await authService.isSystemInitialized();
    res.json({ code: ApiCode.SUCCESS, data: { initialized } });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Failed to check status' });
  }
};

export const setupSystem = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ code: ApiCode.BAD_REQUEST, msg: 'Password required' });
    
    await authService.setupAdmin(password);
    res.json({ code: ApiCode.SUCCESS, msg: 'System initialized' });
  } catch (error: any) {
    res.status(400).json({ code: ApiCode.FAIL, msg: error.message });
  }
};

export const loginSystem = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ code: ApiCode.BAD_REQUEST, msg: 'Password required' });
    
    const token = await authService.systemLogin(password);
    res.json({ code: ApiCode.SUCCESS, data: { token } });
  } catch (error: any) {
    res.status(401).json({ code: ApiCode.UNAUTHORIZED, msg: 'Login failed' });
  }
};

// --- Bilibili Auth Endpoints (原有逻辑) ---

export const getQrcode = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const data = await authService.generateQrcode();
    res.json({ code: ApiCode.SUCCESS, data });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Failed to get qrcode' });
  }
};

export const pollQrcode = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { qrcode_key } = req.body;
    const result = await authService.pollQrcode(qrcode_key);
    
    // MVP 逻辑：在这里处理 Cookie 写入 (Step 3 将移至 AuthService)
    if (result.code === 0 && result.url) {
      // 简单模拟从 url 提取或假设已经拿到了 cookie
      // 实际上需要从 poll 接口的 set-cookie 头获取
      // 暂时保持现状，等待 Step 3 彻底重构
    }
    
    res.json({ code: ApiCode.SUCCESS, data: result });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Polling failed' });
  }
};

export const getProfile = async (req: Request, res: Response<ApiResponse>) => {
  // 这里需要 bilibiliService 更新 cookie，但目前我们还没有把 cookie 存入 DB
  // Step 3 将重构此处
  // 暂时简单读取本地文件 (兼容旧逻辑)
  try {
    if (fs.existsSync(AppConfig.COOKIE_FILE)) {
      const cookie = fs.readFileSync(AppConfig.COOKIE_FILE, 'utf-8');
      bilibiliService.updateCookie(cookie);
      res.json({ code: ApiCode.SUCCESS, data: { isLogin: true } });
    } else {
      res.json({ code: ApiCode.SUCCESS, data: { isLogin: false } });
    }
  } catch (e) {
    res.json({ code: ApiCode.SUCCESS, data: { isLogin: false } });
  }
};
