import { IsInt, IsDateString } from 'class-validator';

export class AssignSubscriptionDto {
  @IsInt()
  userId: number;

  @IsInt()
  subscriptionId: number;

  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}