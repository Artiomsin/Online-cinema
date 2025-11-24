import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../services/jwt.strategy';
import { RolesGuard } from '../services/roles.guard';
import { UsersService } from '../services/users.service';
import { RolesService } from '../services/roles.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_jwt_secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, UsersService, RolesService],
  controllers: [AuthController],
})
export class AuthModule {}
