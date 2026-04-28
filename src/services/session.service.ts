import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

export const SESSION_TTL = 900;

export interface UserSession {
  userId: number;
  email: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress?: string;
}

@Injectable()
export class SessionService implements OnModuleInit {
  private redis: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  private readonly SESSION_PREFIX = 'session:';
  private readonly PUBSUB_CHANNEL = 'data-changes';

  private messageHandlers: Map<string, (message: string) => void> = new Map();

  constructor(@Inject('REDIS_CLIENT') private client: Redis) {
    this.redis = client;
    this.publisher = client.duplicate();
    this.subscriber = client.duplicate();
  }

  async onModuleInit() {
    await this.subscriber.subscribe(this.PUBSUB_CHANNEL);
    this.subscriber.on('message', (channel, message) => {
      if (channel === this.PUBSUB_CHANNEL) {
        console.log(`📥 Pub/Sub: Получено сообщение: ${message}`);
        this.messageHandlers.forEach((handler) => handler(message));
      }
    });
  }

  async createSession(
    userId: number,
    email: string,
    ipAddress?: string,
  ): Promise<void> {
    const session: UserSession = {
      userId,
      email,
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress,
    };

    await this.redis.setex(
      `${this.SESSION_PREFIX}${userId}`,
      SESSION_TTL,
      JSON.stringify(session),
    );

    console.log(`📝 Сессия создана для пользователя ${userId} в Redis`);
  }

  async getSession(userId: number): Promise<UserSession | null> {
    const data = await this.redis.get(`${this.SESSION_PREFIX}${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async updateLastActivity(userId: number): Promise<void> {
    const session = await this.getSession(userId);
    if (session) {
      session.lastActivity = new Date();
      await this.redis.setex(
        `${this.SESSION_PREFIX}${userId}`,
        SESSION_TTL,
        JSON.stringify(session),
      );
    }
  }

  async deleteSession(userId: number): Promise<void> {
    await this.redis.del(`${this.SESSION_PREFIX}${userId}`);
    console.log(`🗑️ Сессия удалена для пользователя ${userId}`);
  }

  async getActiveSessions(): Promise<UserSession[]> {
    const keys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
    const sessions: UserSession[] = [];

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        sessions.push(JSON.parse(data));
      }
    }

    return sessions;
  }

  async publishChange(eventType: string, data: any): Promise<void> {
    const message = JSON.stringify({ eventType, data, timestamp: new Date() });
    await this.publisher.publish(this.PUBSUB_CHANNEL, message);
    console.log(`📢 Pub/Sub: Отправлено событие ${eventType}`);
  }

  subscribe(eventType: string, handler: (message: string) => void): void {
    this.messageHandlers.set(eventType, handler);
  }

  unsubscribe(eventType: string): void {
    this.messageHandlers.delete(eventType);
  }
}
