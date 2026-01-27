import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateSubscriptionStatusDto {
  @ApiProperty({ example: 'inactive', description: 'Новый статус подписки' })
  @IsString()
  status: string;
}
