import { IsNumber, IsString } from 'class-validator';

export class CreateActionLogDto {
  @IsNumber()
  userId: number;

  @IsString()
  action: string;
}
