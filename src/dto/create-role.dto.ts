import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
