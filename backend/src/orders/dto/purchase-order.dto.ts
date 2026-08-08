import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';

export class PurchaseOrderDto {
  @IsString()
    @IsNotEmpty()
    country!: string;

  @IsString()
    @IsNotEmpty()
    operator!: string;

  @IsNumber()
    @IsNotEmpty()
    @Min(1)
    productId!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  quantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}