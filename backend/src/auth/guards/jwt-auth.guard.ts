import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { createHash } from 'crypto';
import type { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    sub: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();

    if (token?.startsWith('jsk_')) {
      const keyHash = `sha256:${createHash('sha256').update(token, 'utf8').digest('hex')}`;
      const apiKey = await this.prisma.apiKey.findFirst({
        where: { keyHash, active: true },
        select: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!apiKey?.user.isActive) {
        throw new UnauthorizedException('Invalid or inactive API key.');
      }

      request.user = {
        id: apiKey.user.id,
        sub: apiKey.user.id,
        email: apiKey.user.email,
        role: apiKey.user.role,
      };
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }
}
