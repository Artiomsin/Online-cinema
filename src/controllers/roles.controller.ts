import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rolesService.findRoleById(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.rolesService.deleteRole(id);
  }
}
