import { Controller, Post, Body, UseGuards, Get, Patch, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { VerifyLoginOtpDto } from './dto/verify-login-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authService.login(loginDto);
  }

  @Post('verify-login-otp')
  async verifyLoginOtp(@Body() verifyDto: VerifyLoginOtpDto): Promise<AuthResponseDto> {
    return this.authService.verifyLoginOtp(verifyDto.email, verifyDto.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    // Get fresh user data from database to ensure accuracy
    const currentUser = await this.authService.getCurrentUser(user.id);
    return currentUser;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-otp')
  async sendOtp(@CurrentUser() user: any) {
    await this.authService.sendOtp(user.id);
    return { message: 'OTP sent to your email' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  async verifyEmail(
    @CurrentUser() user: any,
    @Body() verifyDto: VerifyEmailDto,
  ) {
    const isValid = await this.authService.verifyOtp(user.id, verifyDto.otp);

    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Get updated user data after verification
    const updatedUser = await this.authService.getCurrentUser(user.id);

    // For HOST users
    if (updatedUser.role === 'HOST') {
      if (!updatedUser.hostApproved) {
        return {
          message: 'Email verified. Your account is pending admin approval.',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role,
            status: updatedUser.status,
            emailVerified: updatedUser.emailVerified,
            hostApproved: updatedUser.hostApproved,
          }
        } as any;
      }

      // If approved (unlikely in this flow, but possible), generate fresh token
      const payload = { sub: updatedUser.id, email: updatedUser.email, role: updatedUser.role };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          status: updatedUser.status,
          emailVerified: updatedUser.emailVerified,
          hostApproved: updatedUser.hostApproved,
        },
      };
    }

    // For other users, return simple message (existing behavior)
    return { message: 'Email verified successfully' };
  }

  @Post('verify-email-public')
  async verifyEmailPublic(
    @Body() verifyDto: { email: string; otp: string },
  ) {
    // Find user by email
    const user = await this.authService.findUserByEmail(verifyDto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isValid = await this.authService.verifyOtp(user.id, verifyDto.otp);

    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Get updated user data after verification
    const updatedUser = await this.authService.getCurrentUser(user.id);

    // For HOST users, never return token - they must wait for approval
    if (updatedUser.role === 'HOST') {
      return {
        message: 'Email verified. Your host request has been sent to admin for approval.',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          status: updatedUser.status,
          emailVerified: updatedUser.emailVerified,
          hostApproved: updatedUser.hostApproved,
        }
      };
    }

    // For other users, return simple message
    return { message: 'Email verified successfully' };
  }
}
