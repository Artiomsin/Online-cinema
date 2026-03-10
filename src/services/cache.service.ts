import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export const CACHE_TTL = {
  USERS_LIST: 300,
  USER_DETAILS: 300,
  ROLES_LIST: 600,
  GENRES_LIST: 3600,
  ACTORS_LIST: 3600,
  MOVIES_LIST: 300,
  MOVIE_DETAILS: 600,
  MOVIES_BY_GENRE: 600,
  MOVIES_BY_ACTOR: 600,
  ANALYTICS: 1800,
  SESSION: 900,
};

export const CACHE_KEYS = {
  USERS_LIST: 'users:list',
  USER: (id: number) => `user:${id}`,
  USER_ROLES: (userId: number) => `user:${userId}:roles`,
  ROLES_LIST: 'roles:list',
  GENRES_LIST: 'genres:list',
  ACTORS_LIST: 'actors:list',
  MOVIES_LIST: 'movies:list',
  MOVIE: (id: number) => `movie:${id}`,
  MOVIES_BY_GENRE: (genreId: number) => `movies:genre:${genreId}`,
  MOVIES_BY_ACTOR: (actorId: number) => `movies:actor:${actorId}`,
  ANALYTICS: 'analytics:',
};

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (data) {
      console.log(`CACHE HIT: ${key}`);
      return JSON.parse(data);
    }
    console.log(`CACHE MISS: ${key}`);
    return null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
    console.log(`CACHE SET: ${key} (TTL: ${ttl}s)`);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
    console.log(`CACHE DELETE: ${key}`);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
      console.log(`CACHE INVALIDATE: ${pattern} (${keys.length} keys)`);
    }
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const data = await fn();
    await this.set(key, data, ttl);
    return data;
  }

  async invalidateUsersCache(): Promise<void> {
    await this.delByPattern('users:*');
    await this.delByPattern('user:*');
  }

  async invalidateRolesCache(): Promise<void> {
    await this.del(CACHE_KEYS.ROLES_LIST);
  }

  async invalidateGenresCache(): Promise<void> {
    await this.del(CACHE_KEYS.GENRES_LIST);
  }

  async invalidateActorsCache(): Promise<void> {
    await this.del(CACHE_KEYS.ACTORS_LIST);
  }

  async invalidateMoviesCache(): Promise<void> {
    await this.del(CACHE_KEYS.MOVIES_LIST);
    await this.delByPattern('movie:*');
    await this.delByPattern('movies:*');
  }

  async invalidateMovieCache(movieId: number): Promise<void> {
    await this.del(CACHE_KEYS.MOVIE(movieId));
  }
}
