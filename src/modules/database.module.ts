// src/modules/database.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../database/schema';

export const dbProvider = {
  provide: 'DB',
  useFactory: (configService: ConfigService) => {
    const pool = new Pool({
      host: configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: configService.get<number>('POSTGRES_PORT', 5432),
      user: configService.get<string>('POSTGRES_USER'),
      password: configService.get<string>('POSTGRES_PASSWORD'),
      database: configService.get<string>('POSTGRES_DB'),
    });
    return drizzle(pool, { schema,logger: true,  });
  },
  inject: [ConfigService],
};

@Global() // делает модуль доступным во всех остальных
@Module({
  providers: [dbProvider],
  exports: ['DB'],
})
export class DatabaseModule {}
