import { IsInt } from 'class-validator';

export class CheckFavoriteDto {
  @IsInt()
  userId: number;

  @IsInt()
  movieId: number;
}
