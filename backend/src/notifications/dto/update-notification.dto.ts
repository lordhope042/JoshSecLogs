import { IsBoolean, IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  message?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsUrl()
  telegramUrl?: string;

  @IsOptional()
  @IsUrl()
  whatsappUrl?: string;
}
