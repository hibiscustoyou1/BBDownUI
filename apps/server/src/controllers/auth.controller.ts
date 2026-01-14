import { Request, Response } from 'express';
import { ApiCode, ApiResponse } from '@repo/shared';
import { authService } from '@/services/auth.service';

export const getProfile = async (_req: Request, res: Response<ApiResponse>) => {
  try {
    const data = await authService.getUserProfile();
    res.json({ code: ApiCode.SUCCESS, data });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Failed to fetch profile' });
  }
};

export const getQRCode = async (_req: Request, res: Response<ApiResponse>) => {
  try {
    const data = await authService.generateQRCode();
    res.json({ code: ApiCode.SUCCESS, data });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Failed to generate QR Code' });
  }
};

export const checkQRCode = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ code: ApiCode.BAD_REQUEST, msg: 'Key required' });
    
    const success = await authService.pollAndSave(key);
    if (success) {
      res.json({ code: ApiCode.SUCCESS, data: { status: 'success' } });
    } else {
      // 前端继续轮询，这里不返回错误码，而是返回状态
      res.json({ code: ApiCode.SUCCESS, data: { status: 'pending' } });
    }
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Poll failed' });
  }
};

export const logout = async (_req: Request, res: Response<ApiResponse>) => {
  authService.logout();
  res.json({ code: ApiCode.SUCCESS, msg: 'Logged out' });
};
