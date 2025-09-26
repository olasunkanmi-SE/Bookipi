import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

export interface IRedisService {
  get(key: string): Promise<unknown>;
  set(key: string, value: object, ttl?: number);
  delete(key: string);
}

@Injectable()
export class CacheService implements IRedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async get(key: string): Promise<unknown> {
    return await this.cacheManager.get(key);
  }

  public async set(key: string, value: object, ttl?: number) {
    return await this.cacheManager.set(key, value, ttl);
  }

  public async delete(key: string) {
    return await this.cacheManager.del(key);
  }
}
