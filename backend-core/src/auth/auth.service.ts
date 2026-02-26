import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EmailService } from '../utils/emailService';
import { OtpService } from '../utils/otpService';
import { hostRequestNotificationEmail } from '../utils/emailTemplates';

@Injectable()
export class AuthService implements OnModuleInit {
  private emailService: EmailService;
  private otpService: OtpService;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.emailService = new EmailService(this.prisma);
    this.otpService = new OtpService(this.prisma, this.emailService);
  }

  async onModuleInit() {
    // Initialize with a default admin user
    await this.initializeDefaultUser();
  }

  private async initializeDefaultUser() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'admin123';

    if (!adminEmail) {
      console.warn('⚠️ ADMIN_EMAIL not configured in environmental variables');
      return;
    }

    const adminExists = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
      console.log(`✅ Default admin created with email: ${adminEmail}`);
    } else {
      // Optional: Update password if it changed in .env
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.prisma.user.update({
        where: { email: adminEmail },
        data: { passwordHash: hashedPassword }
      });
      console.log(`✅ Admin password updated from .env for: ${adminEmail}`);
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Determine role and admin status
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const isAdmin = adminEmail && email.toLowerCase() === adminEmail.toLowerCase();

    let userRole = role || 'PARTICIPANT';
    if (isAdmin) {
      userRole = 'ADMIN';
    } else if (userRole.toUpperCase() === 'HOST' || userRole.toUpperCase() === 'ORGANIZER') {
      userRole = 'HOST';
    }

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: userRole,
        status: 'ACTIVE',
        emailVerified: false,
        hostApproved: true, // Now auto-approved!
      },
    });

    // Send OTP email for verification
    try {
      await this.otpService.sendOtp(newUser.id);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
    }

    // No longer sending admin notifications since hosts are auto-approved

    // Generate JWT token ONLY for non-OTP requirements
    // (HOSTs still need OTP for login, so we follow the login flow logic)
    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        status: newUser.status,
        emailVerified: newUser.emailVerified,
        hostApproved: newUser.hostApproved,
      },
    };
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Require OTP for ALL user logins (security measure)
    // Send OTP
    await this.otpService.sendOtp(user.id);

    // Return specific response indicating OTP is needed
    // We do NOT return the token yet
    return {
      requiresOtp: true,
      email: user.email,
      message: 'OTP sent to your email',
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update user fields
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateDto,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      status: updatedUser.status,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
      githubUrl: updatedUser.githubUrl,
      linkedinUrl: updatedUser.linkedinUrl,
      portfolioUrl: updatedUser.portfolioUrl,
      organizationName: updatedUser.organizationName,
      phoneNumber: updatedUser.phoneNumber,
      experienceLevel: updatedUser.experienceLevel,
      hostOnboarded: updatedUser.hostOnboarded,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      hostApproved: user.hostApproved,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      portfolioUrl: user.portfolioUrl,
      organizationName: user.organizationName,
      phoneNumber: user.phoneNumber,
      experienceLevel: user.experienceLevel,
      hostOnboarded: user.hostOnboarded,
    };
  }

  // Debug method to view all users (remove in production)
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    return users;
  }

  async sendOtp(userId: string): Promise<void> {
    await this.otpService.sendOtp(userId);
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    return this.otpService.verifyOtp(userId, otp);
  }

  async verifyLoginOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.otpService.verifyOtp(user.id, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Ensure email is verified if it wasn't
    if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: true, // It's verified now
        hostApproved: user.hostApproved,
      },
    };
  }
}
