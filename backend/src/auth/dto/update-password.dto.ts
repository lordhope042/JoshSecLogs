import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword!: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters',
  })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  newPassword!: string;
}
