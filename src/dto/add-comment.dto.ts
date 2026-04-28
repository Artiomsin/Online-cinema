import { IsInt, IsString } from 'class-validator';

export class AddCommentDto {
  @IsInt()
  userId: number;

  @IsInt()
  movieId: number;

  @IsInt()
  rating: number; // например, 1–10

  @IsString()
  commentText: string;
}
