import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from '../database/schema';

export const dbProvider = {
  provide: 'DB',
  useFactory: (configService: ConfigService) => {
    const poolConfig: PoolConfig = {
      host: configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: configService.get<number>('POSTGRES_PORT', 5432),
      user: configService.get<string>('POSTGRES_USER'),
      password: configService.get<string>('POSTGRES_PASSWORD'),
      database: configService.get<string>('POSTGRES_DB'),
    };

    const pool = new Pool(poolConfig);
    const db = drizzle(pool, { schema });
    return db;
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [dbProvider],
  exports: ['DB'],
})
export class DatabaseModule {}
