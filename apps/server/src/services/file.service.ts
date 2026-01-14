import fs from 'fs/promises';
import path from 'path';
import { AppConfig } from '@/config/app.config';
import { FileInfo } from '@repo/shared';

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.webm', '.mov', '.avi']);

export class FileService {
  async listFiles(): Promise<FileInfo[]> {
    try {
      // 确保目录存在，防止读取报错
      try {
        await fs.access(AppConfig.DOWNLOAD_DIR);
      } catch {
        return [];
      }
      
      const files = await fs.readdir(AppConfig.DOWNLOAD_DIR, { withFileTypes: true });
      const fileInfos: FileInfo[] = [];
      
      for (const file of files) {
        if (!file.isFile()) continue;
        
        const ext = path.extname(file.name).toLowerCase();
        if (!VIDEO_EXTENSIONS.has(ext)) continue;
        
        const fullPath = path.join(AppConfig.DOWNLOAD_DIR, file.name);
        const stat = await fs.stat(fullPath);
        
        fileInfos.push({
          name: file.name,
          // path: ... [移除]
          size: stat.size,
          mtime: stat.mtimeMs,
          extension: ext
        });
      }
      
      return fileInfos.sort((a, b) => b.mtime - a.mtime);
    } catch (error) {
      console.error('[FileService] Scan failed:', error);
      throw error;
    }
  }
  
  async deleteFile(fileName: string): Promise<void> {
    const safeName = path.basename(fileName);
    const fullPath = path.join(AppConfig.DOWNLOAD_DIR, safeName);
    
    // 简单检查文件是否存在
    try {
      await fs.access(fullPath);
      await fs.unlink(fullPath);
    } catch (e) {
      // 文件不存在也视为成功
    }
  }
}

export const fileService = new FileService();
