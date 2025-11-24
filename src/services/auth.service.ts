import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { RolesService } from '../services/roles.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService
  ) {}


  async register(dto: RegisterDto, res: Response) {
    const user = await this.usersService.createUser(dto);    
    const role = await this.rolesService.findRoleById(2);
    await this.usersService.assignRole({ userId: user.id, roleId: role.id });
    return this.setTokens(user.id, user.email, res);
  }

  
  async login(dto: LoginDto, res: Response) {
    const users = await this.usersService.findAllUsers();
    const user = users.find(u => u.login === dto.login);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    
    return this.setTokens(user.id, user.email, res);
  }



  async logout(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Вы вышли из системы' };
  }


  async refresh(req: Request, res: Response) {
  const token = req.cookies['refresh_token'];
  const payload = await this.jwtService.verifyAsync(token, {
    secret: process.env.JWT_REFRESH_SECRET,
  }).catch(() => null);

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
    httpOnly: true, secure: false, sameSite: 'lax', maxAge: 15 * 60 * 1000,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { message: 'Аутентификация успешна', access_token: accessToken, refresh_token: refreshToken };
}

}
