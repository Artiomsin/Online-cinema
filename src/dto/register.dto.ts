import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  login: string;

  @MinLength(6)
  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;
}
