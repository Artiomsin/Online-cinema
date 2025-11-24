import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { users, NewUser, userSubscriptions, subscriptions } from '../database/schema';
import { and, eq, sql } from 'drizzle-orm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AssignRoleDto } from 'src/dto/assign-role.dto';
import { userRoles, roles } from '../database/schema';
import { AssignSubscriptionDto } from 'src/dto/assign-subscription.dto';
import { UpdateSubscriptionStatusDto } from 'src/dto/update-subscription-status.dto';
@Injectable()
export class UsersService {
  constructor(@Inject('DB') private readonly db: any) {}

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser: NewUser = {
      login: dto.login,
      passwordHash: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      registrationDate: new Date().toISOString(),
      status: true,
    };

    const [user] = await this.db.insert(users).values(newUser).returning();
    return user;
  }

  async findAllUsers() {
    return await this.db.select().from(users);
  }

  async findUserById(id: number) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const updateData: Partial<NewUser> = {};

    if (dto.login) updateData.login = dto.login;
    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.email) updateData.email = dto.email;
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const [user] = await this.db.update(users).set(updateData).where(eq(users.id, id)).returning();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async deleteUser(id: number) {
    const [user] = await this.db.delete(users).where(eq(users.id, id)).returning();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  
  async assignRole(dto: AssignRoleDto) {
    const [userRole] = await this.db
      .insert(userRoles)
      .values({ userId: dto.userId, roleId: dto.roleId })
      .returning();

    return userRole;
  }

  async removeRole(dto: AssignRoleDto) {
    const [deleted] = await this.db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, dto.userId), eq(userRoles.roleId, dto.roleId)))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Role ${dto.roleId} not found for user ${dto.userId}`);
    }
    return deleted;
  }


  async getUserRoles(userId: number) {
    return await this.db
      .select({
        roleId: roles.id,
        roleName: roles.name,
        description: roles.description,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
  }



  
  async assignSubscription(dto: AssignSubscriptionDto) {
    const [userSubscription] = await this.db
      .insert(userSubscriptions)
      .values({
        userId: dto.userId,
        subscriptionId: dto.subscriptionId,
        startDate: new Date(dto.start),
        endDate: new Date(dto.end),
        status: 'active', 
      })
      .returning();

    return userSubscription;
  }

  
  async getUserSubscriptions(userId: number) {
  // 1. Обновляем все подписки, у которых дата окончания прошла
  const today = new Date().toISOString().split("T")[0]; 

  await this.db.execute(sql`
    UPDATE "User_Subscription"."user_subscriptions"
    SET status = 'expired'
    WHERE end_date < ${today}
      AND status = 'active'
      AND user_id = ${userId};
  `);

  // 2. Загружаем все подписки пользователя
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


  async updateSubscriptionStatus(dto: UpdateSubscriptionStatusDto) {
    const [updated] = await this.db
      .update(userSubscriptions)
      .set({ status: dto.status })
      .where(eq(userSubscriptions.id, dto.userSubscriptionId))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Subscription with id ${dto.userSubscriptionId} not found`);
    }
    return updated;
  }


 async getUserProfile(userId: number) {
  console.log('👉 getUserProfile userId:', userId);

  const result = await this.db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  console.log('👉 raw result:', result);

  const [user] = result;
  if (!user) {
    throw new NotFoundException(`Пользователь с id=${userId} не найден`);
  }

  return {
    login: user.login ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    email: user.email ?? null,
  };
}


   
  async updateStatus(userId: number, status: boolean) {
    const [user] = await this.db.update(users).set({ status }).where(eq(users.id, userId)).returning();
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return user;
  }

}
