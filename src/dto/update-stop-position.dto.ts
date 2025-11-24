import { IsInt } from 'class-validator';

export class UpdateStopPositionDto {
  @IsInt()
  userId: number;

  @IsInt()
  movieId: number;

  @IsInt()
  position: number; 
}