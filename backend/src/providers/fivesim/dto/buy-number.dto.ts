import { IsString } from "class-validator";

export class BuyNumberDto {
  @IsString()
    country!: string;

  @IsString()
    operator!: string;

  @IsString()
    product!: string;
}