import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
    @IsNotEmpty({
        message: 'Payment reference is required.',
    })
    reference!: string;
}