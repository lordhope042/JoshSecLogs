import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateVirtualAccountDto {
  @IsIn(['9psb', 'kuda'])
  bank: '9psb' | 'kuda';

  @IsString()
  @IsNotEmpty()
  phone: string;
}
