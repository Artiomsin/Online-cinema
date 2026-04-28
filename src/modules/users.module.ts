import { Module } from '@nestjs/common';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { AuthModule } from './auth.module';
import { ActionLogModule } from './action-log.module';
import { SessionModule } from './session.module';

@Module({
  imports: [AuthModule, ActionLogModule, SessionModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
