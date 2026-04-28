import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsInt()
  releaseYear: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  originalLanguage: string;

  @IsString()
  productionCountry: string;

  @IsInt()
  ageRating: number;

  @IsInt()
  duration: number;

  @IsString()
  subscriptionLevel: string;

  @IsOptional()
  @IsString()
  videoUrl480?: string;

  @IsOptional()
  @IsString()
  videoUrl720?: string;

  @IsOptional()
  @IsString()
  videoUrl1080?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;
}
