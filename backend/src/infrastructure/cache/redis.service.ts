import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AppRedisClient, REDIS_CLIENT } from './redis.provider';

export interface IRedisService {
  get(key: string): Promise<unknown>;
  set(key: string, value: any, ttl?: number);
  delete(key: string);
  getNativeClient(): AppRedisClient;
  increaseCount(key: string, quantity: number): Promise<boolean>;
  decreaseCount(key: string, quantity: number): Promise<boolean>;
}

@Injectable()
export class CacheService implements IRedisService {
  private incrementScriptSha: string;
  private decrementScriptSha: string;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(REDIS_CLIENT) private readonly redisClient: AppRedisClient,
  ) {}

  async onModuleInit() {
    const incrementScript = `
    local current = redis.call('GET', KEYS[1])
    if current and tonumber(current) < 0 then
      return 0
    end
    redis.call('INCRBY', KEYS[1], ARGV[1])
    return 1
    `;

    const decrementScript = `
     local current = redis.call('GET', KEYS[1])
    if current and tonumber(current) < 0 then
      return 0
    end
    redis.call('DECRBY', KEYS[1], ARGV[1])
    return 1`;

    this.incrementScriptSha =
      await this.getNativeClient().scriptLoad(incrementScript);

    this.decrementScriptSha =
      await this.getNativeClient().scriptLoad(decrementScript);
  }

  async get(key: string): Promise<unknown> {
    return await this.cacheManager.get(key);
  }

  async set(key: string, value: object, ttl?: number) {
    return await this.cacheManager.set(key, value, ttl);
  }

  async delete(key: string) {
    return await this.cacheManager.del(key);
  }

  public getNativeClient(): AppRedisClient {
    return this.redisClient;
  }

  /**
   * Atomically increments the value for a given key using a pre-loaded Lua script.
   * Using EVALSHA is a performance optimization that avoids sending the entire script
   * on each call. This script-based approach ensures that complex operations
   * (e.g., increment + setting TTL) are executed as a single, uninterruptible
   * transaction, preventing race conditions in a distributed environment.
   *
   * @param key - The Redis key for the counter.
   * @param quantity - The amount to increment by.
   * @returns A promise that resolves to `true` if the script executed successfully (returned 1).
   */
  private async InCreaseOrDecreaseCount(
    key: string,
    quantity: number,
    script: string,
  ): Promise<boolean> {
    try {
      const result = await this.getNativeClient().evalSha(script, {
        keys: [key],
        arguments: [quantity.toString()],
      });
      return result === 1;
    } catch (error) {
      Logger.error(`Failed to execute script for key: ${key}`, error);
      return false;
    }
  }

  async increaseCount(key: string, quantity: number): Promise<boolean> {
    return await this.InCreaseOrDecreaseCount(
      key,
      quantity,
      this.incrementScriptSha,
    );
  }

  async decreaseCount(key: string, quantity: number): Promise<boolean> {
    return await this.InCreaseOrDecreaseCount(
      key,
      quantity,
      this.decrementScriptSha,
    );
  }
}
