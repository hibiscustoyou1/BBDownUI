import { Request, Response } from 'express';
import { ApiCode, ApiResponse } from '@repo/shared';
import { fileService } from '@/services/file.service';

export const getFiles = async (_req: Request, res: Response<ApiResponse>) => {
  try {
    const data = await fileService.listFiles();
    res.json({ code: ApiCode.SUCCESS, data });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Error reading file list' });
  }
};

export const deleteFile = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { filename } = req.params;
    if (!filename) return res.status(400).json({ code: ApiCode.BAD_REQUEST, msg: 'Filename required' });
    
    await fileService.deleteFile(decodeURIComponent(filename));
    res.json({ code: ApiCode.SUCCESS, msg: 'File deleted' });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Delete failed' });
  }
};
