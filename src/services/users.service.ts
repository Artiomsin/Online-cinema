import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AssignRoleDto } from 'src/dto/assign-role.dto';
import { AssignSubscriptionDto } from 'src/dto/assign-subscription.dto';
import { UpdateSubscriptionStatusDto } from 'src/dto/update-subscription-status.dto';
import { sql } from 'drizzle-orm';
import { CacheService, CACHE_KEYS, CACHE_TTL } from './cache.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
  ) {}

  // --- USERS ---
  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.db.execute(sql`
      INSERT INTO "User"."users"
        (login, password_hash, first_name, last_name, email, registration_date, status)
      VALUES (${dto.login}, ${hashedPassword}, ${dto.firstName}, ${dto.lastName}, ${dto.email}, ${new Date().toISOString()}, true)
      RETURNING id, login, password_hash AS "passwordHash", first_name AS "firstName", last_name AS "lastName", email, registration_date AS "registrationDate", status;
    `);

    await this.cacheService.invalidateUsersCache();
    return result.rows[0];
  }

  async findUserByLogin(login: string) {
    const result = await this.db.execute(sql`
      SELECT id, login, password_hash AS "passwordHash", first_name AS "firstName", 
             last_name AS "lastName", email, registration_date AS "registrationDate", status
      FROM "User"."users" 
      WHERE login = ${login};
    `);
    return result.rows[0];
  }

  async findAllUsers() {
    return this.cacheService.getOrSet(
      CACHE_KEYS.USERS_LIST,
      async () => {
        const result = await this.db.execute(sql`
          SELECT id, login, password_hash AS "passwordHash", first_name AS "firstName", last_name AS "lastName", email, registration_date AS "registrationDate", status
          FROM "User"."users";
        `);
        return result.rows;
      },
      CACHE_TTL.USERS_LIST,
    );
  }

  async findUserById(id: number) {
    return this.cacheService.getOrSet(
      CACHE_KEYS.USER(id),
      async () => {
        const result = await this.db.execute(sql`
          SELECT id, login, password_hash AS "passwordHash", first_name AS "firstName", last_name AS "lastName", email, registration_date AS "registrationDate", status
          FROM "User"."users"
          WHERE id = ${id};
        `);
        if (result.rows.length === 0)
          throw new NotFoundException(`User with id ${id} not found`);
        return result.rows[0];
      },
      CACHE_TTL.USER_DETAILS,
    );
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : null;

    const result = await this.db.execute(sql`
      UPDATE "User"."users"
      SET 
        login = COALESCE(${dto.login}, login),
        first_name = COALESCE(${dto.firstName}, first_name),
        last_name = COALESCE(${dto.lastName}, last_name),
        email = COALESCE(${dto.email}, email),
        password_hash = COALESCE(${hashedPassword}, password_hash)
      WHERE id = ${id}
      RETURNING id, login, password_hash AS "passwordHash", first_name AS "firstName", last_name AS "lastName", email, registration_date AS "registrationDate", status;
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`User with id ${id} not found`);

    await this.cacheService.invalidateUsersCache();
    await this.cacheService.del(CACHE_KEYS.USER(id));
    return result.rows[0];
  }

  async deleteUser(id: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "User"."users"
      WHERE id = ${id}
      RETURNING id, login, password_hash AS "passwordHash", first_name AS "firstName", last_name AS "lastName", email, registration_date AS "registrationDate", status;
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`User with id ${id} not found`);

    await this.cacheService.invalidateUsersCache();
    await this.cacheService.del(CACHE_KEYS.USER(id));
    return result.rows[0];
  }

  // --- ROLES ---
  async assignRole(dto: AssignRoleDto) {
    const result = await this.db.execute(sql`
      INSERT INTO "User_Role"."user_roles" (user_id, role_id)
      VALUES (${dto.userId}, ${dto.roleId})
      RETURNING *;
    `);

    await this.cacheService.del(CACHE_KEYS.USER_ROLES(dto.userId));
    return result.rows[0];
  }

  async removeRole(dto: AssignRoleDto) {
    const result = await this.db.execute(sql`
      DELETE FROM "User_Role"."user_roles"
      WHERE user_id = ${dto.userId} AND role_id = ${dto.roleId}
      RETURNING *;
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(
        `Role ${dto.roleId} not found for user ${dto.userId}`,
      );

    await this.cacheService.del(CACHE_KEYS.USER_ROLES(dto.userId));
    return result.rows[0];
  }

  async getUserRoles(userId: number) {
    return this.cacheService.getOrSet(
      CACHE_KEYS.USER_ROLES(userId),
      async () => {
        const result = await this.db.execute(sql`
          SELECT r.id AS "roleId", r.name AS "roleName", r.description
          FROM "User_Role"."user_roles" ur
          INNER JOIN "Role"."roles" r ON ur.role_id = r.id
          WHERE ur.user_id = ${userId};
        `);
        return result.rows;
      },
      CACHE_TTL.ROLES_LIST,
    );
  }

  // --- SUBSCRIPTIONS ---
  async assignSubscription(dto: AssignSubscriptionDto) {
    const result = await this.db.execute(sql`
      INSERT INTO "User_Subscription"."user_subscriptions"
        (user_id, subscription_id, start_date, end_date, status)
      VALUES (${dto.userId}, ${dto.subscriptionId}, ${dto.start}, ${dto.end}, 'active')
      RETURNING *;
    `);
    return result.rows[0];
  }

  async getUserSubscriptions(userId: number) {
    const today = new Date().toISOString().split('T')[0];

    await this.db.execute(sql`
      UPDATE "User_Subscription"."user_subscriptions"
      SET status = 'expired'
      WHERE end_date < ${today}
        AND status = 'active'
        AND user_id = ${userId};
    `);

    const subs = await this.db.execute(sql`
      SELECT 
        us.id AS "userSubscriptionId",
        s.id AS "subscriptionId",
        s.title,
        s.price,
        s.period,
        us.start_date AS "startDate",
        us.end_date AS "endDate",
        us.status
      FROM "User_Subscription"."user_subscriptions" us
      INNER JOIN "Subscription"."subscriptions" s
        ON us.subscription_id = s.id
      WHERE us.user_id = ${userId};
    `);

    return subs.rows;
  }

  async updateSubscriptionStatus(dto: {
    userId: number;
    userSubscriptionId: number;
    status: string;
  }) {
    const result = await this.db.execute(sql`
    UPDATE "User_Subscription"."user_subscriptions"
    SET status = ${dto.status}
    WHERE id = ${dto.userSubscriptionId} AND user_id = ${dto.userId}
    RETURNING *;
  `);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `Subscription ${dto.userSubscriptionId} not found for user ${dto.userId}`,
      );
    }

    return result.rows[0];
  }

  // --- PROFILE & STATUS ---
  async getUserProfile(userId: number) {
    const result = await this.db.execute(sql`
      SELECT login, first_name AS "firstName", last_name AS "lastName", email
      FROM "User"."users"
      WHERE id = ${userId};
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`Пользователь с id=${userId} не найден`);
    return result.rows[0];
  }

  async updateStatus(userId: number, status: boolean) {
    const result = await this.db.execute(sql`
    UPDATE "User"."users"
    SET status = ${status}
    WHERE id = ${userId}
    RETURNING id, login, password_hash AS "passwordHash",
              first_name AS "firstName", last_name AS "lastName",
              email, registration_date AS "registrationDate", status;
  `);

    if (result.rows.length === 0) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return result.rows[0];
  }
}
