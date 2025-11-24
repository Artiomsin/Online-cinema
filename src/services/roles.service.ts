import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { roles, NewRole } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(@Inject('DB') private readonly db: any) {}

  async createRole(dto: CreateRoleDto) {
    const newRole: NewRole = {
      name: dto.name,
      description: dto.description,
    };

    const [role] = await this.db.insert(roles).values(newRole).returning();
    return role;
  }

  async findAllRoles() {
    return await this.db.select().from(roles);
  }

  async findRoleById(id: number) {
    const [role] = await this.db.select().from(roles).where(eq(roles.id, id));
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return role;
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const updateData: Partial<NewRole> = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.description) updateData.description = dto.description;

    const [role] = await this.db.update(roles).set(updateData).where(eq(roles.id, id)).returning();
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return role;
  }

  async deleteRole(id: number) {
    const [role] = await this.db.delete(roles).where(eq(roles.id, id)).returning();
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return role;
  }
}
