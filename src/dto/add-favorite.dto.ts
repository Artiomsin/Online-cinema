import { IsInt } from 'class-validator';

export class AddFavoriteDto {
  @IsInt()
  userId: number;

  @IsInt()
  movieId: number;
}