import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return undefined;
    }
  }

  return undefined;
}

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly allowedOrigins: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;

    const origin = request.headers.origin;
    const cookieSession = Boolean(readCookie(request, 'access_token'));
    const fetchSite = request.headers['sec-fetch-site'];

    // A cookie-authenticated mutation must carry an exact allowlisted Origin.
    // CORS alone is not a CSRF defense because it does not prevent form submits.
    if (cookieSession && (!origin || !this.allowedOrigins.includes(origin))) {
      throw new ForbiddenException('Cross-site request rejected.');
    }

    if (origin && !this.allowedOrigins.includes(origin)) {
      throw new ForbiddenException('Origin is not allowed.');
    }

    if (cookieSession && fetchSite === 'cross-site') {
      throw new ForbiddenException('Cross-site request rejected.');
    }

    return true;
  }
}
