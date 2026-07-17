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
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: secret,
    });
  }
async validate(payload: JwtPayload) {
  if (!payload.sub) {
    throw new UnauthorizedException(
      'Invalid token.',
    );
  }

  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
}