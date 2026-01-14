import { Request, Response } from 'express';
import { ApiCode, ApiResponse } from '@repo/shared';
import { bilibiliService } from '@/services/bilibili.service';

export const searchVideos = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const keyword = req.query.keyword as string;
    const page = Number(req.query.page) || 1;
    
    if (!keyword) {
      res.status(400).json({ code: ApiCode.BAD_REQUEST, msg: 'Keyword is required' });
      return;
    }
    
    const data = await bilibiliService.searchVideos({ keyword, page });
    res.json({ code: ApiCode.SUCCESS, data });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Search failed' });
  }
};
