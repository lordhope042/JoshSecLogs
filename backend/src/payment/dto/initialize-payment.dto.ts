import {
  IsNumber,
  Min,
} from 'class-validator';

export class InitializePaymentDto {
  @IsNumber()
    @Min(100)
    amount!: number;
}