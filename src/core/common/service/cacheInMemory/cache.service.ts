import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache = new Map<string, { data: any; expires: number }>();

  public getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  }

  public saveToCache(key: string, data: any, ttl = 60000) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }
}
