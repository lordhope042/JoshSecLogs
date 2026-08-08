import {
  IsNumber,
  Min,
} from 'class-validator';

export class WithdrawDto {
  @IsNumber()
    @Min(100)
    amount!: number;
}