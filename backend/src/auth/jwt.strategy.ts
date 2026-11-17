import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    private readonly config: ConfigService,
  ) {
    const secret =
      config.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_SECRET is missing.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: { headers?: { cookie?: string } }) => {
          const header = request.headers?.cookie;
          if (!header) return null;
          for (const part of header.split(';')) {
            const separator = part.indexOf('=');
            if (separator < 0) continue;
            if (part.slice(0, separator).trim() !== 'access_token') continue;
            try {
              return decodeURIComponent(part.slice(separator + 1).trim());
            } catch {
              return null;
            }
          }
          return null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),

      ignoreExpiration: false,

      secretOrKey: secret,
    });
  }

async validate(payload: JwtPayload) {
  if (!payload.sub) {
    throw new UnauthorizedException(
      "Invalid token.",
    );
  }

  return {
    id: payload.sub,
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
}
