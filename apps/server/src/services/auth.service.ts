// apps/server/src/services/auth.service.ts
import axios from 'axios';
import fs from 'fs/promises';
import { AppConfig } from '@/config/app.config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { QRCodeGenerateResult, QRCodePollResult } from '@repo/shared';

const prisma = new PrismaClient();

export class AuthService {
  
  // --- System Auth (Step 1 新增) ---
  
  /**
   * 检查系统是否已初始化（是否存在管理员）
   */
  async isSystemInitialized(): Promise<boolean> {
    const count = await prisma.adminUser.count();
    return count > 0;
  }
  
  /**
   * 初始化系统管理员
   */
  async setupAdmin(password: string): Promise<void> {
    const initialized = await this.isSystemInitialized();
    if (initialized) {
      throw new Error('System already initialized');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.adminUser.create({
      data: {
        username: 'admin', // 默认用户名
        password: hashedPassword
      }
    });
  }
  
  /**
   * 系统登录
   */
  async systemLogin(password: string): Promise<string> {
    const admin = await prisma.adminUser.findUnique({ where: { username: 'admin' } });
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }
    
    // 签发 Token, 有效期 7 天
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      AppConfig.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return token;
  }
  
  // --- Bilibili Auth (保持原有逻辑，Step 3 再改造持久化) ---
  
  async generateQrcode(): Promise<QRCodeGenerateResult> {
    const { data } = await axios.get('https://passport.bilibili.com/x/passport-login/web/qrcode/generate');
    return data.data;
  }
  
  async pollQrcode(qrcodeKey: string): Promise<QRCodePollResult> {
    const { data } = await axios.get('https://passport.bilibili.com/x/passport-login/web/qrcode/poll', {
      params: { qrcode_key: qrcodeKey }
    });
    
    // 登录成功，写入本地文件 (Step 3 将改为写库)
    if (data.data.code === 0) {
      const cookies = data.data.url; // 这里 API 返回的 url 字段其实包含了 cookie 信息？
      // 注意：B站 poll 接口返回结构比较特殊，通常需要提取 Set-Cookie header
      // 但这里为了保持 MVP 逻辑，假设 poll 逻辑中从 headers 获取了 cookie
      // 由于 axios 在 browser 和 node 表现不同，之前 MVP 可能简化了。
      // 这里暂不改动原有逻辑，留待 Step 3 统一重构 BilibiliService
    }
    
    // 兼容之前 controller 的逻辑，controller 层负责了 cookie 的解析和保存
    return data.data;
  }
}

export const authService = new AuthService();
