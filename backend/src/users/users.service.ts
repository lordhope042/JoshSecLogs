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