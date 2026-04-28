import { IsInt } from 'class-validator';

export class StartViewDto {
  @IsInt()
  userId: number;

  @IsInt()
  movieId: number;
}
