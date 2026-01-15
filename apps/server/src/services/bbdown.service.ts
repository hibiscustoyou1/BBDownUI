import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '@/config/app.config';
import { DownloadTask, DownloadTaskCollection, DownloadOptions } from '@repo/shared';
import { authService } from './auth.service';

export class BBDownService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: AppConfig.BBDOWN_HOST,
      timeout: 5000,
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
  
  /**
   * 获取所有任务状态
   */
  async getAllTasks(): Promise<DownloadTaskCollection> {
    return this.client.get<any, DownloadTaskCollection>('/get-tasks/');
  }
  
  async getRunningTasks(): Promise<DownloadTask[]> {
    return this.client.get<any, DownloadTask[]>('/get-tasks/running');
  }
  
  async getFinishedTasks(): Promise<DownloadTask[]> {
    return this.client.get<any, DownloadTask[]>('/get-tasks/finished');
  }
  
  /**
   * 提交下载任务 (已注入持久化 Cookie)
   */
  async addTask(options: DownloadOptions): Promise<void> {
    try {
      // 1. 从数据库获取最新的 B 站 Cookie
      const cookie = await authService.getBiliCookie();
      
      // 2. 构造 Payload
      const payload: DownloadOptions = {
        ...options,
        WorkDir: AppConfig.DOWNLOAD_DIR,
        Cookie: cookie || undefined
      };
      
      // 3. 发送请求
      await this.client.post('/add-task', payload);
      console.log(`[BBDownService] Task added: ${options.Url} (Cookie injected: ${!!cookie})`);
      
    } catch (error: any) {
      console.error('[BBDownService] Failed to add task:', error.message);
      
      // [优化] 针对连接拒绝错误，抛出用户友好的提示
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`无法连接到 BBDown 服务 (${AppConfig.BBDOWN_HOST})。请确认核心下载服务已启动。`);
      }
      
      // 其他错误直接抛出
      if (error.response?.data?.msg) {
        throw new Error(`BBDown Error: ${error.response.data.msg}`);
      }
      
      throw new Error('Failed to communicate with BBDown backend');
    }
  }
  
  async removeFinishedTask(aid: string): Promise<void> {
    await this.client.get(`/remove-finished/${aid}`);
  }
  
  async getVersion(): Promise<string> {
    try {
      const { data } = await this.client.get<string>('/version');
      return data;
    } catch (error) {
      return 'Unknown';
    }
  }
}

export const bbDownService = new BBDownService();
