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

const REFERRAL_COMMISSION_RATE = 0.05;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generates a unique referral code.
   */
  private async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let code = '';

    do {
      code = '';

      for (let i = 0; i < 8; i++) {
        code += chars.charAt(
          Math.floor(Math.random() * chars.length),
        );
      }
    } while (await this.users.findByReferralCode(code));

    return code;
  }

  /**
   * REGISTER
   */
  async register(dto: RegisterDto) {
    // Check email
    const existingUser = await this.users.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Check username
    const existingUsername =
      await this.users.findByUsername(dto.username);

    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    /**
     * Verify referral code if supplied.
     */
    if (dto.referralCode) {
      const referrer = await this.users.findByReferralCode(
        dto.referralCode,
      );

      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      dto.password,
      12,
    );

    // Generate this user's referral code
    const myReferralCode =
      await this.generateReferralCode();

    // Create user
    const user = await this.users.createUser({
      name: dto.name,
      username: dto.username,
      email: dto.email,
      passwordHash,

      // User's own referral code
      referralCode: myReferralCode,

      // Referral code of the person who referred them
      referredBy: dto.referralCode,
    });

    // Never expose passwordHash
    const {
      passwordHash: _omit,
      ...safeUser
    } = user as any;

    return {
      message:
        'Registration successful. Please log in to continue.',
      user: safeUser,
    };
  }

  /**
   * LOGIN
   */
async login(dto: LoginDto) {
  const identifier = dto.identifier.trim();

  // First try email.
  let user = await this.users.findByEmail(identifier);

  // If no email matches, try username.
  if (!user) {
    user = await this.users.findByUsername(identifier);
  }

  // Don't reveal whether the email/username exists.
  if (!user) {
    throw new UnauthorizedException(
      'Invalid username/email or password',
    );
  }

  // Check password.
  const valid = await bcrypt.compare(
    dto.password,
    user.passwordHash,
  );

  if (!valid) {
    throw new UnauthorizedException(
      'Invalid username/email or password',
    );
  }

  // Create JWT.
  const accessToken = await this.jwt.signAsync({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  // Track login.
  const isFirstLogin =
    await this.users.markLogin(user.id);

  // Never return passwordHash.
  const {
    passwordHash: _omit,
    ...safeUser
  } = user as any;

  return {
    message: 'Login successful',
    accessToken,
    user: safeUser,
    isFirstLogin,
  };
}
  /**
   * CURRENT USER
   */
  async me(id: string) {
    const user = await this.users.findById(id);

    if (!user) {
      return null;
    }

    const {
      passwordHash: _omit,
      ...safeUser
    } = user as any;

    return safeUser;
  }

  /**
   * REFERRAL STATISTICS
   */
  async getReferralStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        referralCode: true,
      },
    });

    if (!user?.referralCode) {
      return {
        referralCode: null,
        referredUsers: [],
        totalEarnings: 0,
        activeCount: 0,
      };
    }

    const referredUsers =
      await this.prisma.user.findMany({
        where: {
          referredBy: user.referralCode,
        },
        select: {
          id: true,
          name: true,
          username: true,
          createdAt: true,
          emailVerified: true,
          payments: {
            where: {
              status: 'SUCCESS',
            },
            select: {
              amount: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    const referrals = referredUsers.map((u) => {
      const totalPaid = u.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      const earnings =
        totalPaid * REFERRAL_COMMISSION_RATE;

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        joinedAt: u.createdAt,
        status: u.emailVerified
          ? 'active'
          : 'pending',
        earnings,
      };
    });

    return {
      referralCode: user.referralCode,
      referredUsers: referrals,
      totalEarnings: referrals.reduce(
        (sum, r) => sum + r.earnings,
        0,
      ),
      activeCount: referrals.filter(
        (r) => r.status === 'active',
      ).length,
    };
  }

  /**
   * UPDATE PROFILE
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ) {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    const data: any = {
      name: dto.name,
    };

    if (
      dto.email &&
      dto.email !== user.email
    ) {
      const existing =
        await this.users.findByEmail(dto.email);

      if (
        existing &&
        existing.id !== userId
      ) {
        throw new BadRequestException(
          'That email is already in use.',
        );
      }

      data.email = dto.email;
      data.emailVerified = false;
    }

    const updated =
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data,
      });

    const {
      passwordHash: _omit,
      ...safeUser
    } = updated as any;

    return {
      message:
        'Profile updated successfully.',
      user: safeUser,
    };
  }

  /**
   * UPDATE PASSWORD
   */
  async updatePassword(
    userId: string,
    dto: UpdatePasswordDto,
  ) {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    const valid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Current password is incorrect.',
      );
    }

    if (
      dto.currentPassword ===
      dto.newPassword
    ) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    const newHash = await bcrypt.hash(
      dto.newPassword,
      12,
    );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash: newHash,
      },
    });

    return {
      message:
        'Password changed successfully.',
    };
  }

  /**
   * FORGOT PASSWORD
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
  ) {
    const user =
      await this.users.findByEmail(dto.email);

    if (user) {
      // TODO:
      // Generate reset token, store its hash,
      // set expiry and send reset email.
    }

    return {
      message:
        'If an account exists for that email, a password reset link has been sent.',
    };
  }
}