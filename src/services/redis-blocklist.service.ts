import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisBlocklistService {
  private readonly BLOCKLIST_PREFIX = 'blocked:';
  private readonly ATTEMPTS_PREFIX = 'attempts:';
  private readonly MAX_ATTEMPTS = 3;
  private readonly BLOCK_TTL = 60; // 1 минута в секундах

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async isBlocked(login: string): Promise<boolean> {
    const result = await this.redis.get(`${this.BLOCKLIST_PREFIX}${login}`);
    return result !== null;
  }

  async getBlockTimeRemaining(login: string): Promise<number> {
    const ttl = await this.redis.ttl(`${this.BLOCKLIST_PREFIX}${login}`);
    return ttl > 0 ? ttl : 0;
  }

  async blockUser(login: string): Promise<void> {
    await this.redis.setex(
      `${this.BLOCKLIST_PREFIX}${login}`,
      this.BLOCK_TTL,
      'blocked'
    );
    await this.redis.del(`${this.ATTEMPTS_PREFIX}${login}`);
  }

  async incrementFailedAttempts(login: string): Promise<number> {
    const key = `${this.ATTEMPTS_PREFIX}${login}`;
    const attempts = await this.redis.incr(key);
    
    if (attempts === 1) {
      await this.redis.expire(key, this.BLOCK_TTL);
    }
    
    return attempts;
  }

  async resetFailedAttempts(login: string): Promise<void> {
    await this.redis.del(`${this.ATTEMPTS_PREFIX}${login}`);
  }

  async getFailedAttempts(login: string): Promise<number> {
    const attempts = await this.redis.get(`${this.ATTEMPTS_PREFIX}${login}`);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  async getAllBlockedUsers(): Promise<{ login: string; ttl: number }[]> {
    const keys = await this.redis.keys(`${this.BLOCKLIST_PREFIX}*`);
    const blockedUsers: { login: string; ttl: number }[] = [];
    
    for (const key of keys) {
      const login = key.replace(this.BLOCKLIST_PREFIX, '');
      const ttl = await this.redis.ttl(key);
      blockedUsers.push({ login, ttl });
    }
    
    return blockedUsers;
  }
}
