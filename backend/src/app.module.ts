import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";

import { WalletModule } from "./wallet/wallet.module";
import { PaymentsModule } from "./payment/payments.module";
import { OrdersModule } from "./orders/orders.module";
import { FiveSimModule } from "./providers/fivesim/fivesim.module";
import { AdminModule } from "./admin/admin.module";

import { MarketplaceModule } from "./marketplace/marketplace.module";
import { SocialLogModule } from "./social-logs/social-log.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /* Core */
    PrismaModule,

    /* Authentication */
    UsersModule,
    AuthModule,

    /* Wallet */
    WalletModule,

    /* Payments */
    PaymentsModule,

    /* Providers */
    FiveSimModule,

     AdminModule,

    /* Orders */
    OrdersModule,

    /* Marketplace */
    MarketplaceModule,

    /* Social Logs */
    SocialLogModule,
  ],
})
export class AppModule {}