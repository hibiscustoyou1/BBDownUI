import { Request, Response } from 'express';
import { ApiCode, ApiResponse, DownloadOptions } from '@repo/shared';
import { bbDownService } from '@/services/bbdown.service';

export const getTasks = async (_req: Request, res: Response<ApiResponse>) => {
  try {
    const data = await bbDownService.getAllTasks();
    res.json({ code: ApiCode.SUCCESS, data });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Failed to fetch tasks from BBDown' });
  }
};

export const addTask = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const payload = req.body as DownloadOptions;
    if (!payload.Url) {
      res.status(400).json({ code: ApiCode.BAD_REQUEST, msg: 'Url is required' });
      return;
    }
    await bbDownService.addTask(payload);
    res.json({ code: ApiCode.SUCCESS, msg: 'Task added' });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Failed to add task' });
  }
};

export const removeTask = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    await bbDownService.removeFinishedTask(id);
    res.json({ code: ApiCode.SUCCESS, msg: 'Task removed' });
  } catch (error) {
    res.status(500).json({ code: ApiCode.FAIL, msg: 'Failed to remove task' });
  }
};
