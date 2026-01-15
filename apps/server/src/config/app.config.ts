import path from 'path';

export const AppConfig = {
  // BBDown Server 地址，默认假设与 Node 服务同机或通过 Docker 网络连接
  // 在 Docker Compose 中，BBDown 可能运行在宿主机或另一容器，这里暂定 localhost
  BBDOWN_HOST: process.env.BBDOWN_HOST || 'http://127.0.0.1:23333',
  
  // 本地下载存储路径 (用于媒体库管理)
  DOWNLOAD_DIR: process.env.DOWNLOAD_DIR || path.resolve(process.cwd(), 'downloads'),
  
  // Bilibili API Base URL
  BILI_API_BASE: 'https://api.bilibili.com',
  BILI_PASSPORT_BASE: 'https://passport.bilibili.com',
  
  // 新增: 偏好设置存储路径
  PREFERENCE_FILE: path.resolve(process.cwd(), 'preferences.json'),
};
