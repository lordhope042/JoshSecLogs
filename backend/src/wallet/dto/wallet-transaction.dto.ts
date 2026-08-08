export class WalletTransactionDto {
  id!: string;

  type!: 'CREDIT' | 'DEBIT';

  amount!: number;

  description!: string;

  reference!: string;

  createdAt!: Date;
}