import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roles, userRoles } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('DB') private readonly db: any
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const userId = req.user?.userId;
    if (!userId) return false;

    const rolesList = await this.db
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const userRolesNames = rolesList.map(r => r.name);
    return requiredRoles.some(role => userRolesNames.includes(role));
  }
}
