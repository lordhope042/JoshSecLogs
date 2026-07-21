import { Type } from "class-transformer";

import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Min,
} from "class-validator";

import { SocialPlatform, SocialLogCategory, SocialLogPageType } from "@prisma/client";

export class CreateSocialLogDto {
  /*
  =====================================
  PUBLIC INFORMATION
  =====================================
  */

  @IsEnum(SocialPlatform)
  platform!: SocialPlatform;

  // Which of the 10 sellable listing types this row belongs to.
  // Drives which of country / pageType / followers are meaningful.
  @IsEnum(SocialLogCategory)
  category!: SocialLogCategory;

  // Only required for FACEBOOK_COUNTRY and TIKTOK_COUNTRY — optional
  // everywhere else now that the column is nullable.
  @IsOptional()
  @IsString()
  country?: string;

  // Only meaningful when category = FACEBOOK_PAGE.
  @IsOptional()
  @IsEnum(SocialLogPageType)
  pageType?: SocialLogPageType;

  @IsString()
  username!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  age!: number;

  // Tier threshold for TWITTER_FOLLOWERS / INSTAGRAM_FOLLOWERS /
  // TIKTOK_FOLLOWERS — e.g. 100, 200, 500, 1000, or 0 for Instagram's
  // "empty" tier. The "+" display formatting happens on the frontend.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  followers?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  emailAttached?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  phoneAttached?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  twoFactor?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  ogEmail?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  /*
  =====================================
  PRIVATE LOGIN DETAILS
  =====================================
  */

  @IsOptional()
  @IsEmail()
  loginEmail?: string;

  @IsOptional()
@IsString()
emailPassword?: string;

  @IsOptional()
  @IsPhoneNumber()
  loginPhone?: string;

  @IsOptional()
  @IsString()
  accountPassword?: string;

  @IsOptional()
  @IsString()
  twoFactorSecret?: string;

  @IsOptional()
  @IsEmail()
  recoveryEmail?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  backupCodes?: string[];

  @IsOptional()
  @IsObject()
  cookies?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export default CreateSocialLogDto;