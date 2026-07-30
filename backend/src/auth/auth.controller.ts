import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.authService.me(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/referrals')
  referrals(@Request() req: any) {
    return this.authService.getReferralStats(req.user.sub);
  }

  /* ============================================================
     PROFILE UPDATE
     Allows an authenticated user to update their display name
     and (optionally) their email. Email changes are accepted but
     flagged with emailVerified = false so the user must re-verify.
  ============================================================ */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @Request() req: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.sub, dto);
  }

  /* ============================================================
     PASSWORD CHANGE
     Requires the current password to be supplied and verified
     before the new password is accepted.
  ============================================================ */
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  updatePassword(
    @Request() req: any,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(req.user.sub, dto);
  }

  /* ============================================================
     FORGOT PASSWORD
     Accepts an email and always returns a generic success
     response. This is the standard security practice: never
     reveal whether an email is registered. In a production
     setup a reset token would be emailed here; for now the
     endpoint exists so the frontend flow is wired end-to-end
     and can be upgraded with a real email provider later.
  ============================================================ */
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }
}
