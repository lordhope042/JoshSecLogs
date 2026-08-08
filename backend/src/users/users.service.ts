import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        wallet: true,
      },
    });
  }

  /**
   * Find user by referral code
   */
  async findByReferralCode(referralCode: string) {
    return this.prisma.user.findUnique({
      where: {
        referralCode,
      },
    });
  }

  /**
   * Records that a user has just logged in. Returns whether this was
   * their first-ever login — i.e. `lastLoginAt` was still null before
   * this call — which the auth flow uses to decide whether to show a
   * "welcome" vs "welcome back" notification.
   */
  async markLogin(id: string) {
    const before = await this.prisma.user.findUnique({
      where: { id },
      select: { lastLoginAt: true },
    });

    const isFirstLogin = before?.lastLoginAt == null;

    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });

    return isFirstLogin;
  }

  /**
   * Create new user
   */
  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    referralCode: string;
    referredBy?: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,

        // Generated for the new user
        referralCode: data.referralCode,

        // Optional referral code entered during registration
        referredBy: data.referredBy,

        wallet: {
          create: {
            balance: 0,
          },
        },
      },

      include: {
        wallet: true,
      },
    });
  }
}