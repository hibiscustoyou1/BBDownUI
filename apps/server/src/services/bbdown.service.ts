import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '@/config/app.config';
import { DownloadTask, DownloadTaskCollection, DownloadOptions } from '@repo/shared';

export class BBDownService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: AppConfig.BBDOWN_HOST,
      timeout: 10000,
    });
    
    // 响应拦截，简化数据提取
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error(`[BBDownService] Request Failed: ${error.config?.url}`, error.message);
        return Promise.reject(error);
      }
    );
  }
  
  async getAllTasks(): Promise<DownloadTaskCollection> {
    return this.client.get<any, DownloadTaskCollection>('/get-tasks/');
  }
  
  async getRunningTasks(): Promise<DownloadTask[]> {
    return this.client.get<any, DownloadTask[]>('/get-tasks/running');
  }
  
  async getFinishedTasks(): Promise<DownloadTask[]> {
    return this.client.get<any, DownloadTask[]>('/get-tasks/finished');
  }
  
  async addTask(payload: DownloadOptions): Promise<void> {
    await this.client.post('/add-task', payload);
  }
  
  async removeFinishedTask(aid: string): Promise<void> {
    await this.client.get(`/remove-finished/${aid}`);
  }
}

export const bbDownService = new BBDownService();
