import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Registration successful',
      accessToken,
      user,
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

    return {
      message: 'Login successful',
      accessToken,
      user,
    };
  }

  async me(id: string) {
    return this.users.findById(id);
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
}