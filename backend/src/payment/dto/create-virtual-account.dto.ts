import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateVirtualAccountDto {
  @IsIn(['kuda', 'saveheaven'])
  bank: 'kuda' | 'saveheaven';

  @IsString()
  @IsNotEmpty()
  phone: string;
}