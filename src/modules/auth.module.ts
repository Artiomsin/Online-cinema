import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../services/jwt.strategy';
import { RolesGuard } from '../services/roles.guard';
import { UsersService } from '../services/users.service';
import { RolesService } from '../services/roles.service';
import { RedisBlocklistService } from '../services/redis-blocklist.service';
import { ActionLogModule } from './action-log.module';
import { SessionModule } from './session.module';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_jwt_secret',
      signOptions: { expiresIn: '15m' },
    }),
    ActionLogModule,
    SessionModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    UsersService,
    RolesService,
    RedisBlocklistService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
