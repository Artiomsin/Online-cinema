import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateActorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsString()
  biography?: string;
}