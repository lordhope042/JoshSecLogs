import { randomBytes } from 'crypto';

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a human-readable, hard-to-guess API key.
   * Format: jsk_<32 hex chars>  (JoshSecLogs key prefix)
   */
  private generateKey(): string {
    return `jsk_${randomBytes(16).toString('hex')}`;
  }

  /**
   * List all API keys belonging to the authenticated user.
   * The raw `key` value is returned so the user can copy it
   * from the dashboard (keys are only shown in full on creation;
   * existing keys return a masked preview).
   */
  async list(userId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((k) => ({
      ...k,
      // Mask the key for listing — full key is only returned once
      // at creation time.
      key: this.maskKey(k.key),
    }));
  }

  /**
   * Create a new API key for the user.
   * Returns the FULL key once — the client should store it,
   * because subsequent list calls only return a masked version.
   */
  async create(userId: string, dto: CreateApiKeyDto) {
    const key = this.generateKey();

    const record = await this.prisma.apiKey.create({
      data: {
        userId,
        key,
        active: dto.active ?? true,
      },
    });

    return {
      message: 'API key created.',
      id: record.id,
      key, // full key — shown once
      active: record.active,
      createdAt: record.createdAt,
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

  /**
   * Masks a key for safe display, e.g.
   *   jsk_ab12cd34...5678
   */
  private maskKey(key: string): string {
    if (key.length <= 12) return key;
    return `${key.slice(0, 8)}...${key.slice(-4)}`;
  }
}
