import { Request, Response } from 'express';
import { ApiCode, ApiResponse, GlobalPreference } from '@repo/shared';
import { preferenceService } from '@/services/preference.service';

export const getPreference = async (_req: Request, res: Response<ApiResponse<GlobalPreference>>) => {
  try {
    const data = preferenceService.get();
    res.json({ code: ApiCode.SUCCESS, data });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Error getting preferences' });
  }
};

export const updatePreference = async (req: Request, res: Response<ApiResponse<GlobalPreference>>) => {
  try {
    const patch = req.body as Partial<GlobalPreference>;
    const updated = preferenceService.update(patch);
    res.json({ code: ApiCode.SUCCESS, data: updated });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Error updating preferences' });
  }
};
