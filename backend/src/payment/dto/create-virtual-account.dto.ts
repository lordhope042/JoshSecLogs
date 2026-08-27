import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export type PocketFiBank = 'kuda' | 'safeheaven';

export class CreateVirtualAccountDto {
  @IsIn(['kuda', 'saveheaven'])
  bank: PocketFiBank;

  @IsString()
  @IsNotEmpty()
  phone: string;
}