import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3, {
    message: 'Username or email is required',
  })
  identifier!: string;

  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters',
  })
  password!: string;
}