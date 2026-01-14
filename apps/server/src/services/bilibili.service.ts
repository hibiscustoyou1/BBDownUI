import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '@/config/app.config';
import { BiliVideoSnippet, SearchParams } from '@repo/shared';
import crypto from 'crypto';

// 定义 B 站 API 的通用响应结构
interface BiliApiResponse<T = any> {
  code: number;
  message?: string;
  msg?: string;
  data?: T;
}

export class BilibiliService {
  private client: AxiosInstance;
  
  constructor() {
    // 保持之前的构造函数逻辑 (Header, Cookie 等)
    const buvid3 = `${crypto.randomUUID()}infoc`;
    this.client = axios.create({
      baseURL: AppConfig.BILI_API_BASE,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Origin': 'https://www.bilibili.com',
        'Cookie': `buvid3=${buvid3}; _uuid=${crypto.randomUUID()};`,
        'Accept': 'application/json, text/plain, */*',
      },
    });
    
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error(`[BilibiliService] Request Failed: ${error.config?.url}`);
        return Promise.reject(error);
      }
    );
  }
  
  async searchVideos(params: SearchParams): Promise<BiliVideoSnippet[]> {
    const { keyword, page = 1 } = params;
    
    try {
      // 1. 修正：不要解构 { data }，直接获取整个响应对象
      const response = await this.client.get<any, BiliApiResponse>('/x/web-interface/search/type', {
        params: {
          keyword,
          search_type: 'video',
          page,
          order: 'totalrank',
          tids: 0,
        }
      });
      
      // 2. 修正：兼容 code 0 和 200，并正确访问 response.data
      if (response.code !== 0 && response.code !== 200) {
        console.warn('[BilibiliService] Search API Error:', response);
        return [];
      }
      
      // 3. 安全获取列表
      const list = response.data?.result || [];
      
      return list.map((item: any) => ({
        bvid: item.bvid,
        aid: item.aid,
        title: item.title.replace(/<[^>]+>/g, ''),
        pic: item.pic.startsWith('//') ? `https:${item.pic}` : item.pic,
        author: item.author,
        mid: item.mid,
        duration: item.duration,
        play: item.play,
        pubdate: item.pubdate,
        description: item.description,
      }));
      
    } catch (error) {
      console.error('[BilibiliService] Search Failed:', error);
      throw error; // 让 Controller 处理 500
    }
  }
}

export const bilibiliService = new BilibiliService();
