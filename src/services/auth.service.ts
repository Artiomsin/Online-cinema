import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { RolesService } from '../services/roles.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';
import { RedisBlocklistService } from './redis-blocklist.service';
import { ActionLogService } from './action-log.service';
import { SessionService } from './session.service';
import { UserActionType } from '../database/models/ActionLogMongo';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly redisBlocklistService: RedisBlocklistService,
    private readonly actionLogService: ActionLogService,
    private readonly sessionService: SessionService,
  ) {}

  async register(
    dto: RegisterDto,
    res: Response,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.usersService.createUser(dto);
    const role = await this.rolesService.findRoleById(2);
    await this.usersService.assignRole({ userId: user.id, roleId: role.id });

    await this.actionLogService.logUserAction(
      user.id,
      UserActionType.REGISTER,
      `User registered: ${user.email}`,
      { email: user.email },
      ipAddress,
      userAgent,
    );

    return this.setTokens(user.id, user.email, res);
  }

  async login(
    dto: LoginDto,
    res: Response,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const isBlocked = await this.redisBlocklistService.isBlocked(dto.login);
    if (isBlocked) {
      const ttl = await this.redisBlocklistService.getBlockTimeRemaining(
        dto.login,
      );
      const minutes = Math.ceil(ttl / 60);
      throw new UnauthorizedException(
        `Аккаунт заблокирован из-за множественных неудачных попыток входа. Попробуйте через ${minutes} мин.`,
      );
    }

    const user = await this.usersService.findUserByLogin(dto.login);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      const attempts = await this.redisBlocklistService.incrementFailedAttempts(
        dto.login,
      );

      if (attempts >= 3) {
        await this.redisBlocklistService.blockUser(dto.login);
        const blockedUsers =
          await this.redisBlocklistService.getAllBlockedUsers();
        console.log('🔒 ЗАБЛОКИРОВАННЫЕ ПОЛЬЗОВАТЕЛИ:', blockedUsers);
        throw new UnauthorizedException(
          'Аккаунт заблокирован из-за множественных неудачных попыток входа на 1 минуту',
        );
      }

      const remainingAttempts = 3 - attempts;
      throw new UnauthorizedException(
        `Неверный логин или пароль. Осталось попыток: ${remainingAttempts}`,
      );
    }

    await this.redisBlocklistService.resetFailedAttempts(dto.login);
    await this.usersService.updateStatus(user.id, true);

    await this.sessionService.createSession(user.id, user.email, ipAddress);

    await this.actionLogService.logUserAction(
      user.id,
      UserActionType.LOGIN,
      `User logged in: ${user.email}`,
      { email: user.email },
      ipAddress,
      userAgent,
    );

    return this.setTokens(user.id, user.email, res);
  }

  async logout(
    req: Request,
    res: Response,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const token = req.cookies['access_token'];
    let payload: any = null;

    if (token) {
      payload = await this.jwtService
        .verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        })
        .catch(() => null);
    }

    if (payload) {
      await this.usersService.updateStatus(payload.sub, false);
      await this.sessionService.deleteSession(payload.sub);
      await this.sessionService.publishChange('user_logout', { userId: payload.sub });

      await this.actionLogService.logUserAction(
        payload.sub,
        UserActionType.LOGOUT,
        `User logged out`,
        { email: payload.email },
        ipAddress,
        userAgent,
      );
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Вы вышли из системы' };
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies['refresh_token'];
    const payload = await this.jwtService
      .verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      })
      .catch(() => null);

    if (!payload) throw new UnauthorizedException('Неверный refresh токен');
    return this.setTokens(payload.sub, payload.email, res);
  }

  private async setTokens(userId: number, email: string, res: Response) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Аутентификация успешна',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
