import {
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InitializePaymentDto {
  @Type(() => Number)
    @IsNumber(
        {
            maxDecimalPlaces: 2,
        },
        {
            message: 'Amount must be a valid number.',
        }
    )
    @Min(100, {
        message: 'Minimum deposit is ₦100.',
    })
    amount!: number;
}