import { Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { bilibiliService } from '@/services/bilibili.service';
import { ApiCode, ApiResponse } from '@repo/shared';
// import fs from 'fs'; // Removed fs dependency
import { AppConfig } from '@/config/app.config';

// --- System Auth ---

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

// --- Bilibili Auth ---

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
    // 使用新的 service 方法，它会自动处理持久化
    const result = await authService.pollQrcode(qrcode_key);
    res.json({ code: ApiCode.SUCCESS, data: result });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Polling failed' });
  }
};

export const getProfile = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const cookie = await authService.getBiliCookie();
    if (cookie) {
      // 这里可以解析一下 cookie 或者调用 Nav 接口验证有效性
      // 简单起见，有 Cookie 就认为已登录
      res.json({ code: ApiCode.SUCCESS, data: { isLogin: true } });
    } else {
      res.json({ code: ApiCode.SUCCESS, data: { isLogin: false } });
    }
  } catch (e) {
    res.json({ code: ApiCode.SUCCESS, data: { isLogin: false } });
  }
};

// [新增] 退出 Bilibili
export const logoutBilibili = async (req: Request, res: Response<ApiResponse>) => {
  try {
    await authService.logoutBilibili();
    res.json({ code: ApiCode.SUCCESS, msg: 'Logged out from Bilibili' });
  } catch (e) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Logout failed' });
  }
};
