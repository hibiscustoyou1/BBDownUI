import fs from 'fs';
import { AppConfig } from '@/config/app.config';
import { GlobalPreference } from '@repo/shared';

const DEFAULT_PREFERENCE: GlobalPreference = {
  filePattern: '<videoTitle>',
  multiThread: true,
  useHevc: true,
  deleteAfterSuccess: false,
};

export class PreferenceService {
  private cache: GlobalPreference | null = null;
  
  constructor() {
    this.load();
  }
  
  private load() {
    if (fs.existsSync(AppConfig.PREFERENCE_FILE)) {
      try {
        const raw = fs.readFileSync(AppConfig.PREFERENCE_FILE, 'utf-8');
        this.cache = JSON.parse(raw);
      } catch (e) {
        console.error('[Preference] Load failed, using default.');
        this.cache = { ...DEFAULT_PREFERENCE };
      }
    } else {
      this.cache = { ...DEFAULT_PREFERENCE };
    }
  }
  
  get(): GlobalPreference {
    if (!this.cache) this.load();
    return this.cache!;
  }
  
  update(patch: Partial<GlobalPreference>): GlobalPreference {
    const current = this.get();
    const updated = { ...current, ...patch };
    
    // 简单的原子写入
    try {
      fs.writeFileSync(AppConfig.PREFERENCE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      this.cache = updated;
    } catch (e) {
      console.error('[Preference] Save failed', e);
      throw new Error('Failed to save preferences');
    }
    
    return updated;
  }
}

export const preferenceService = new PreferenceService();
