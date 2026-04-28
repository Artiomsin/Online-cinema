import { IsString, IsInt, IsNumber } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsInt()
  period: number; // например, количество дней
}
