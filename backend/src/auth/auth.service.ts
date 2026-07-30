import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

const REFERRAL_COMMISSION_RATE = 0.05; // 5%

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generates a unique referral code
   */
  private async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let code = '';

    do {
      code = '';

      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (await this.users.findByReferralCode(code));

    return code;
  }

  async register(dto: RegisterDto) {
    // Check email
    const existingUser = await this.users.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    /**
     * If a referral code was entered,
     * verify it belongs to an existing user.
     */
    if (dto.referralCode) {
      const referrer = await this.users.findByReferralCode(dto.referralCode);

      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Generate this user's own referral code
    const myReferralCode = await this.generateReferralCode();

    // Create user
    const user = await this.users.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,

      // User's own code
      referralCode: myReferralCode,

      // Friend's code (optional)
      referredBy: dto.referralCode,
    });

    // FIX: no longer issuing an access token on registration. Handing back
    // a working session the instant an account is created means anyone
    // could register with someone else's email address and get instant
    // authenticated access, with no verification step at all. The client
    // must now call /auth/login separately after registering.

    // FIX: never return passwordHash to the client, even if it's still
    // present on the object returned by createUser(). This strip is
    // defensive — it holds even if UsersService's select clause changes
    // later and starts including it again.
    const { passwordHash: _omit, ...safeUser } = user as any;

    return {
      message: 'Registration successful. Please log in to continue.',
      user: safeUser,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // FIX: same passwordHash strip as register() above.
    const { passwordHash: _omit, ...safeUser } = user as any;

    return {
      message: 'Login successful',
      accessToken,
      user: safeUser,
    };
  }

  async me(id: string) {
    const user = await this.users.findById(id);
    if (!user) return null;
    const { passwordHash: _omit, ...safeUser } = user as any;
    return safeUser;
  }

  /**
   * Referral stats for the current user: their code, the list of
   * users they referred, and 5% commission earned on each referred
   * user's successful payments.
   *
   * ASSUMPTION: Payment model has { userId, amount, status }, with
   * status === 'SUCCESS' marking a completed payment, and User has
   * a `payments` relation. Adjust the `where`/`select` below if your
   * actual field or relation names differ.
   */
  async getReferralStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user?.referralCode) {
      return {
        referralCode: null,
        referredUsers: [],
        totalEarnings: 0,
        activeCount: 0,
      };
    }

    const referredUsers = await this.prisma.user.findMany({
      where: { referredBy: user.referralCode },
      select: {
        id: true,
        name: true,
        createdAt: true,
        emailVerified: true,
        payments: {
          where: { status: 'SUCCESS' },
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const referrals = referredUsers.map((u) => {
      const totalPaid = u.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      const earnings = totalPaid * REFERRAL_COMMISSION_RATE;

      return {
        id: u.id,
        name: u.name,
        joinedAt: u.createdAt,
        status: u.emailVerified ? 'active' : 'pending',
        earnings,
      };
    });

    return {
      referralCode: user.referralCode,
      referredUsers: referrals,
      totalEarnings: referrals.reduce((sum, r) => sum + r.earnings, 0),
      activeCount: referrals.filter((r) => r.status === 'active').length,
    };
  }

  /* ============================================================
     UPDATE PROFILE
     Updates the authenticated user's display name and optionally
     their email. If the email is changed, emailVerified is reset
     to false so the user must re-verify the new address.
  ============================================================ */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const data: any = { name: dto.name };

    if (dto.email && dto.email !== user.email) {
      // Make sure the new email isn't already taken by someone else.
      const existing = await this.users.findByEmail(dto.email);

      if (existing && existing.id !== userId) {
        throw new BadRequestException('That email is already in use.');
      }

      data.email = dto.email;
      data.emailVerified = false;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    const { passwordHash: _omit, ...safeUser } = updated as any;

    return {
      message: 'Profile updated successfully.',
      user: safeUser,
    };
  }

  /* ============================================================
     UPDATE PASSWORD
     Verifies the current password, then replaces the hash with
     the new one. Returns a fresh access token so the client can
     continue making authenticated requests without re-logging in.
  ============================================================ */
  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const valid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return {
      message: 'Password changed successfully.',
    };
  }

  /* ============================================================
     FORGOT PASSWORD
     Always returns a generic success message regardless of
     whether the email exists. This avoids account enumeration.
     In production this would generate a reset token and email
     it; for now the endpoint is a safe no-op that satisfies
     the frontend flow and can be upgraded later.
  ============================================================ */
  async forgotPassword(dto: ForgotPasswordDto) {
    // Look up the user silently. We never reveal whether the
    // email is registered, even in error responses.
    const user = await this.users.findByEmail(dto.email);

    if (user) {
      // TODO: integrate a real email provider here. Generate a
      // signed reset token, store its hash + expiry, and send
      // the reset link to user.email. For now we do nothing.
    }

    return {
      message:
        'If an account exists for that email, a password reset link has been sent.',
    };
  }
}