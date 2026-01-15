import axios from 'axios';
import { AppConfig } from '@/config/app.config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { QRCodeGenerateResult, QRCodePollResult } from '@repo/shared';
import { bilibiliService } from './bilibili.service';

const prisma = new PrismaClient();

export class AuthService {
  
  // --- System Auth ---
  
  async isSystemInitialized(): Promise<boolean> {
    const count = await prisma.adminUser.count();
    return count > 0;
  }
  
  async setupAdmin(password: string): Promise<void> {
    const initialized = await this.isSystemInitialized();
    if (initialized) throw new Error('System already initialized');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.adminUser.create({
      data: { username: 'admin', password: hashedPassword }
    });
  }
  
  async systemLogin(password: string): Promise<string> {
    const admin = await prisma.adminUser.findUnique({ where: { username: 'admin' } });
    if (!admin) throw new Error('Admin user not found');
    
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) throw new Error('Invalid password');
    
    return jwt.sign(
      { id: admin.id, username: admin.username },
      AppConfig.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
  
  // --- Bilibili Auth (Persistence Implemented) ---
  
  async generateQrcode(): Promise<QRCodeGenerateResult> {
    const { data } = await axios.get('https://passport.bilibili.com/x/passport-login/web/qrcode/generate');
    return data.data;
  }
  
  /**
   * 轮询二维码状态并处理持久化
   */
  async pollQrcode(qrcodeKey: string): Promise<QRCodePollResult> {
    // 这里的 headers 模拟浏览器行为，有助于获取完整 Set-Cookie
    const response = await axios.get('https://passport.bilibili.com/x/passport-login/web/qrcode/poll', {
      params: { qrcode_key: qrcodeKey },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/'
      }
    });
    
    const result = response.data.data;
    
    // 登录成功 (Code 0)
    if (result.code === 0) {
      // 提取 Set-Cookie
      const setCookie = response.headers['set-cookie'];
      let cookieStr = '';
      
      if (setCookie && Array.isArray(setCookie)) {
        // 拼接 Cookie
        cookieStr = setCookie.map(c => c.split(';')[0]).join('; ');
      }
      
      if (cookieStr) {
        // 1. 持久化到 DB
        await this.saveBiliCookie(cookieStr);
        // 2. 更新内存服务
        bilibiliService.updateCookie(cookieStr);
        console.log('[AuthService] Bilibili Cookie saved to DB and Memory.');
      }
    }
    
    return result;
  }
  
  /**
   * 保存 B 站 Cookie 到数据库
   */
  async saveBiliCookie(cookie: string): Promise<void> {
    await prisma.globalSetting.upsert({
      where: { key: 'bili_cookie' },
      update: { value: cookie },
      create: { key: 'bili_cookie', value: cookie }
    });
  }
  
  /**
   * 获取 DB 中的 Cookie
   */
  async getBiliCookie(): Promise<string | null> {
    const setting = await prisma.globalSetting.findUnique({ where: { key: 'bili_cookie' } });
    return setting?.value || null;
  }
  
  /**
   * 登出 B 站 (清除 Cookie)
   */
  async logoutBilibili(): Promise<void> {
    await prisma.globalSetting.delete({ where: { key: 'bili_cookie' } }).catch(() => {}); // 忽略不存在错误
    bilibiliService.clearCookie();
  }
}

export const authService = new AuthService();
