import path from 'path';

export const AppConfig = {
  BBDOWN_HOST: process.env.BBDOWN_HOST || 'http://127.0.0.1:23333',
  
  DOWNLOAD_DIR: process.env.DOWNLOAD_DIR || path.resolve(process.cwd(), 'downloads'),
  
  BILI_API_BASE: 'https://api.bilibili.com',
  BILI_PASSPORT_BASE: 'https://passport.bilibili.com',
  
  PREFERENCE_FILE: path.resolve(process.cwd(), 'preferences.json'),
  JWT_SECRET: process.env.JWT_SECRET || 'bbdown-ui-default-secret-key-change-it',
  
  COOKIE_FILE: path.join(process.cwd(), 'cookie.txt'), // [后续Step3将废弃此文件]
};
