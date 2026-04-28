import { IsInt } from 'class-validator';

export class RemoveFavoriteDto {
  @IsInt()
  userId: number;

  @IsInt()
  movieId: number;
}
