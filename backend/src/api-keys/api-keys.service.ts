import { createHash, randomBytes } from 'crypto';

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

import { CreateApiKeyDto } from './dto/create-api-key.dto';

/**
 * The fixed price (in Naira) that a user is charged for generating
 * a new API key.  The amount is debited from the user's wallet balance
 * before the key is created.  If the wallet has insufficient funds the
 * request fails with a 400 "Insufficient wallet balance" error and no
 * key is generated.
 */
export const API_KEY_PRICE = 10_000;

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Generates a human-readable, hard-to-guess API key.
   * Format: jsk_<32 hex chars>  (JoshSecLogs key prefix)
   */
  private generateKey(): string {
    return `jsk_${randomBytes(16).toString('hex')}`;
  }

  private hashKey(key: string): string {
    return `sha256:${createHash('sha256').update(key, 'utf8').digest('hex')}`;
  }

  /**
   * List the authenticated user's keys using a fixed masked label.
   * The stored value is a one-way hash and cannot be recovered.
   */
  async list(userId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId },
      select: { id: true, keyPrefix: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((k) => ({ ...k, key: `${k.keyPrefix}••••••••` }));
  }

  /**
   * Create a new API key for the user.
   *
   * A fixed fee of ₦10,000 (`API_KEY_PRICE`) is debited from the
   * user's wallet balance **before** the key is generated.  If the
   * wallet balance is insufficient the operation aborts with a
   * `BadRequestException` and no key is created.
   *
   * Returns the FULL key once — the client should store it,
   * because subsequent list calls only return a masked version.
   */
  async create(userId: string, dto: CreateApiKeyDto) {
    const key = this.generateKey();
    const record = await this.prisma.$transaction(async (tx) => {
      await this.walletService.debitWallet(
        userId,
        API_KEY_PRICE,
        'API key purchase',
        undefined,
        tx,
      );

      return tx.apiKey.create({
        data: {
          userId,
          key: null,
          keyHash: this.hashKey(key),
          keyPrefix: key.slice(0, 12),
          active: dto.active ?? true,
        },
      });
    });

    return {
      message: 'API key created. ₦10,000 charged to your wallet.',
      id: record.id,
      key, // full key — shown once
      active: record.active,
      createdAt: record.createdAt,
      price: API_KEY_PRICE,
    };
  }

  /**
   * Toggle the active status of an API key.
   */
  async toggle(userId: string, id: string) {
    const existing = await this.prisma.apiKey.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('API key not found.');
    }

    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: { active: !existing.active },
    });

    return {
      message: `API key ${updated.active ? 'activated' : 'deactivated'}.`,
      id: updated.id,
      active: updated.active,
    };
  }

  /**
   * Permanently delete an API key.
   */
  async remove(userId: string, id: string) {
    const existing = await this.prisma.apiKey.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('API key not found.');
    }

    await this.prisma.apiKey.delete({ where: { id } });

    return { message: 'API key deleted.' };
  }

}
