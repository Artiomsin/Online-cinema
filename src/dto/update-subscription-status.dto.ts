import { IsInt, IsString } from 'class-validator';

export class UpdateSubscriptionStatusDto {
  @IsInt()
  userSubscriptionId: number;

  @IsString()
  status: string; // "active" | "expired"
}