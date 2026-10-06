import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({
    message: 'Full name is required',
  })
  name!: string;

  @IsString()
  @IsNotEmpty({
    message: 'Username is required',
  })
  @MinLength(3, {
    message: 'Username must be at least 3 characters',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username can only contain letters, numbers and underscores',
  })
  username!: string;

  @IsEmail(
    {},
    {
      message: 'Please enter a valid email address',
    },
  )
  email!: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters',
  })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  password!: string;

  @IsOptional()
  @IsString()
  confirmPassword?: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsBoolean({
    message: 'You must accept the Terms & Conditions',
  })
  terms!: boolean;
}