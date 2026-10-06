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
   * Find user by username
   */
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: {
        username,
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
   * Records that a user has just logged in.
   *
   * Returns true when this is the user's first-ever login.
   */
  async markLogin(id: string) {
    const before = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        lastLoginAt: true,
      },
    });

    const isFirstLogin = before?.lastLoginAt == null;

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return isFirstLogin;
  }

  /**
   * Create new user
   */
  async createUser(data: {
    name: string;
    username: string;
    email: string;
    passwordHash: string;
    referralCode: string;
    referredBy?: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,

        // Generated referral code belonging to this user
        referralCode: data.referralCode,

        // Referral code entered during registration
        referredBy: data.referredBy,

        // Automatically create wallet
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