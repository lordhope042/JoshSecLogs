import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export type PocketFiBank = 'kuda' | 'safehaven';

export class CreateVirtualAccountDto {
  @IsIn(['kuda', 'safehaven'])
  bank: PocketFiBank;

  @IsString()
  @IsNotEmpty()
  phone: string;
}