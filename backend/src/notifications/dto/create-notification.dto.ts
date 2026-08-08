import { IsBoolean, IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export class CreateNotificationDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  message!: string;

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
