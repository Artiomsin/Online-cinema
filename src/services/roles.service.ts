import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { sql } from 'drizzle-orm';
import { CacheService, CACHE_KEYS, CACHE_TTL } from './cache.service';

@Injectable()
export class RolesService {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
  ) {}

  async createRole(dto: CreateRoleDto) {
    const result = await this.db.execute(sql`
      INSERT INTO "Role"."roles" (name, description)
      VALUES (${dto.name}, ${dto.description})
      RETURNING id, name, description;
    `);

    await this.cacheService.invalidateRolesCache();
    return result.rows[0];
  }

  async findAllRoles() {
    return this.cacheService.getOrSet(
      CACHE_KEYS.ROLES_LIST,
      async () => {
        const result = await this.db.execute(sql`
          SELECT id, name, description
          FROM "Role"."roles";
        `);
        return result.rows;
      },
      CACHE_TTL.ROLES_LIST,
    );
  }

  async findRoleById(id: number) {
    const result = await this.db.execute(sql`
      SELECT id, name, description
      FROM "Role"."roles"
      WHERE id = ${id};
    `);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return result.rows[0];
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const result = await this.db.execute(sql`
      UPDATE "Role"."roles"
      SET 
        name = COALESCE(${dto.name}, name),
        description = COALESCE(${dto.description}, description)
      WHERE id = ${id}
      RETURNING id, name, description;
    `);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    await this.cacheService.invalidateRolesCache();
    return result.rows[0];
  }

  async deleteRole(id: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Role"."roles"
      WHERE id = ${id}
      RETURNING id, name, description;
    `);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    await this.cacheService.invalidateRolesCache();
    return result.rows[0];
  }
}
