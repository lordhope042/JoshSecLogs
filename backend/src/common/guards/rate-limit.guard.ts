import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

const RATE_LIMIT_METADATA = 'security:rate-limit';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export const RateLimit = (limit: number, windowMs: number) =>
  SetMetadata(RATE_LIMIT_METADATA, { limit, windowMs } satisfies RateLimitOptions);

interface WindowCounter {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static readonly MAX_COUNTERS = 20_000;
  private readonly counters = new Map<string, WindowCounter>();
  private lastCleanup = 0;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: { id?: string; sub?: string } }>();
    const identity = request.user?.id ?? request.user?.sub ?? request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const route = `${request.method}:${request.route?.path ?? request.path}`;
    const key = `${route}:${identity}`;
    const now = Date.now();

    if (now - this.lastCleanup > 60_000 || this.counters.size >= RateLimitGuard.MAX_COUNTERS) {
      for (const [storedKey, counter] of this.counters) {
        if (counter.expiresAt <= now) this.counters.delete(storedKey);
      }
      this.lastCleanup = now;
    }

    let counter = this.counters.get(key);
    if (!counter || counter.expiresAt <= now) {
      if (this.counters.size >= RateLimitGuard.MAX_COUNTERS) {
        throw new HttpException(
          'Rate-limit capacity reached. Please try again shortly.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      counter = { count: 0, expiresAt: now + options.windowMs };
      this.counters.set(key, counter);
    }

    if (counter.count >= options.limit) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    counter.count += 1;
    return true;
  }
}
