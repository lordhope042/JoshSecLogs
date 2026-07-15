import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class BuyNumberDto {
  /*
  =====================================
      COUNTRY
  =====================================
  */

  @IsString()
  @IsNotEmpty({
    message: 'Country is required.',
  })
  @MaxLength(50)
  country!: string;

  /*
  =====================================
      PRODUCT / SERVICE
  =====================================
  */

  @IsString()
  @IsNotEmpty({
    message: 'Product is required.',
  })
  @MaxLength(100)
  product!: string;

  /*
  =====================================
      ACTIVATION TYPE / OPERATOR
  =====================================
  */

  @IsString()
  @IsNotEmpty({
    message: 'Activation type is required.',
  })
  @MaxLength(50)
  operator!: string;

  /*
  =====================================
      OPTIONAL FORWARDING NUMBER
  =====================================
  */

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{6,20}$/, {
    message: 'Invalid forwarding number.',
  })
  forwardingNumber?: string;
}