import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import { AppConfig } from '@/config/app.config';
import { UserProfile, QRCodeGenerateResult } from '@repo/shared';
import { bilibiliService } from './bilibili.service'; // 引用 bilibiliService 以更新其 cookie

const COOKIE_FILE = path.resolve(process.cwd(), 'cookie.txt');

export class AuthService {
  private client: AxiosInstance;
  private cookieData: string = '';
  
  constructor() {
    this.client = axios.create({
      baseURL: 'https://passport.bilibili.com',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
      },
    });
    
    // 启动时尝试加载本地 Cookie
    this.loadCookie();
  }
  
  private loadCookie() {
    if (fs.existsSync(COOKIE_FILE)) {
      try {
        this.cookieData = fs.readFileSync(COOKIE_FILE, 'utf-8').trim();
        console.log('[Auth] Cookie loaded from file');
        // 同步更新 BilibiliService 的 Cookie
        bilibiliService.updateCookie(this.cookieData);
      } catch (e) {
        console.error('[Auth] Failed to load cookie file');
      }
    }
  }
  
  private saveCookie(cookieStr: string) {
    this.cookieData = cookieStr;
    fs.writeFileSync(COOKIE_FILE, cookieStr, 'utf-8');
    // 更新 BilibiliService
    bilibiliService.updateCookie(cookieStr);
  }
  
  /**
   * 生成登录二维码
   */
  async generateQRCode(): Promise<QRCodeGenerateResult> {
    const { data } = await this.client.get('/x/passport-login/web/qrcode/generate');
    if (data.code !== 0) throw new Error(data.message);
    return data.data;
  }
  
  /**
   * 轮询二维码状态
   */
  async pollQRCode(qrcode_key: string): Promise<{ success: boolean; msg: string }> {
    const { data } = await this.client.get('/x/passport-login/web/qrcode/poll', {
      params: { qrcode_key },
    });
    
    // 0: 成功
    if (data.code === 0) {
      // 提取 Set-Cookie
      // 注意：axios 响应头中的 set-cookie 是数组
      // 实际生产中可能需要更严谨的 Cookie 解析，这里简化处理
      // 轮询接口返回的 data.data.url 中通常包含重定向信息，但关键 Cookie 在 Response Headers 中
      // 由于 Node.js 层的 Axios 在此 endpoint 往往能直接拿到 cookie，我们需要拦截 response headers
      // *修正*: 此处逻辑依赖于 axios 在拦截器或此处能拿到 headers。
      // 为简化，我们假设上层调用者能处理，或者我们通过 headers 获取。
      // 实际上 B 站 poll 接口成功时，会返回 refresh_token 等，浏览器会自动处理 Set-Cookie。
      // 在 Node 端，我们需要手动从 headers['set-cookie'] 拼接。
      return { success: true, msg: 'Login Success' };
    }
    
    // 86101: 未扫码, 86090: 已扫码未确认, 86038: 失效
    return { success: false, msg: data.message };
  }
  
  /**
   * 专门用于轮询并获取 Cookie 的完整方法
   * 需要访问 Response Headers
   */
  async pollAndSave(qrcode_key: string): Promise<boolean> {
    try {
      const response = await this.client.get('/x/passport-login/web/qrcode/poll', {
        params: { qrcode_key },
      });
      
      if (response.data.code === 0) {
        const cookies = response.headers['set-cookie'];
        if (Array.isArray(cookies)) {
          const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
          this.saveCookie(cookieStr);
          console.log('[Auth] Login successful, cookie saved.');
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('[Auth] Poll error', e);
      return false;
    }
  }
  
  /**
   * 获取当前用户信息 (检查登录状态)
   */
  async getUserProfile(): Promise<UserProfile> {
    if (!this.cookieData) {
      return { isLogin: false };
    }
    
    try {
      // 使用 bilibiliService 的 client (已注入 cookie) 或直接发请求
      // 这里为了解耦，直接用携带 Cookie 的请求访问 nav 接口
      const { data } = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
        headers: {
          Cookie: this.cookieData,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (data.code === 0 && data.data.isLogin) {
        return {
          isLogin: true,
          mid: data.data.mid,
          uname: data.data.uname,
          face: data.data.face,
          level: data.data.level_info?.current_level,
          vipStatus: data.data.vipStatus,
          vipType: data.data.vipType
        };
      }
    } catch (e) {
      console.warn('[Auth] Check login failed, cookie might be expired.');
    }
    
    return { isLogin: false };
  }
  
  logout() {
    this.cookieData = '';
    if (fs.existsSync(COOKIE_FILE)) {
      fs.unlinkSync(COOKIE_FILE);
    }
    bilibiliService.updateCookie(''); // 清除 BilibiliService 的 Cookie
  }
}

export const authService = new AuthService();
