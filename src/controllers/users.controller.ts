import { Controller, Get, Post, Put, Delete, Param, Body, Patch, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { AssignRoleDto } from 'src/dto/assign-role.dto';
import { AssignSubscriptionDto } from 'src/dto/assign-subscription.dto';
import { UpdateSubscriptionStatusDto } from 'src/dto/update-subscription-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/services/roles.guard';
import { Roles } from 'src/services/roles.decorator';

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user') 
  @Get('profile')
  async getOwnProfile(@Req() req: any) {
    const userId = Number(req.user.userId);
    const profile = await this.usersService.getUserProfile(userId);

    return {
      currentUser: {
        userId: req.user.userId,
        email: req.user.email,
      },
      profile,
    };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Get('subscriptions')
  async getUserSubscriptions(@Req() req: any) {
    const userId = Number(req.user.userId);
    if (!userId) throw new UnauthorizedException('Некорректный userId');
    return this.usersService.getUserSubscriptions(userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Post('subscriptions')
  async assignSubscription(@Req() req: any, @Body() dto: AssignSubscriptionDto) {
    const userId = Number(req.user.userId);
    if (!userId) throw new UnauthorizedException('Некорректный userId');
    return this.usersService.assignSubscription({ ...dto, userId });
  }


  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findUserById(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateUserDto>) {
    return this.usersService.updateUser(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }

  @Post('roles')
    assignRole(@Body() dto: AssignRoleDto) {
      return this.usersService.assignRole(dto);
    }

  @Delete('roles')
  removeRole(@Body() dto: AssignRoleDto) {
    return this.usersService.removeRole(dto);
  }

  @Get(':id/roles')
  getUserRoles(@Param('id') userId: number) {
    return this.usersService.getUserRoles(userId);
  }

    


  @Patch(':userId/subscriptions/:userSubscriptionId/status')
  async updateSubscriptionStatus(
    @Param('userSubscriptionId') userSubscriptionId: number,
    @Body() dto: UpdateSubscriptionStatusDto,
  ) {
    return this.usersService.updateSubscriptionStatus({
      ...dto,
      userSubscriptionId,
    });
  }

}
