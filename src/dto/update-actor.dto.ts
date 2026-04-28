import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateActorDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  biography?: string;
}
