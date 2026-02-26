import { Controller, Get, Post, Param, Body, UseGuards, ForbiddenException, Query, Res, HttpStatus, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Response, Request } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  private checkAdminRole(user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('host-requests')
  @UseGuards(JwtAuthGuard)
  async getHostRequests(@CurrentUser() user: any) {
    this.checkAdminRole(user);
    return this.adminService.getHostRequests();
  }

  @Get('approve-host/:userId')
  @Post('approve-host/:userId')
  async approveHost(
    @Param('userId') userId: string,
    @Query('email') fromEmail: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // If not from email, require authentication
    if (!fromEmail) {
      // Apply JWT guard manually for dashboard requests
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ForbiddenException('Authentication required');
      }
      // For dashboard requests, we'd need to validate JWT here
      // For now, we'll assume email-only access
    }

    try {
      const result = await this.adminService.approveHost(userId);

      if (fromEmail) {
        // Return HTML response for email clicks
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Host Approved - AIrena</title>
            <style>
              body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; padding: 40px; }
              .container { max-width: 600px; margin: 0 auto; background: #020617; padding: 40px; border-radius: 12px; text-align: center; }
              .success { color: #10b981; font-size: 32px; margin-bottom: 20px; }
              .details { background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
              .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; }
              .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">✨</div>
              <h1 style="background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">AIrena</h1>
              <p style="color: #94a3b8; margin-bottom: 30px;">Hackathon Platform</p>
              
              <div class="success">✅ Host Approved Successfully!</div>
              <div class="details">
                <p><strong>Name:</strong> ${result.name}</p>
                <p><strong>Email:</strong> ${result.email}</p>
                <p><strong>Status:</strong> <span style="color: #10b981;">Approved</span></p>
                <p><strong>Approved At:</strong> ${result.hostApprovedAt ? new Date(result.hostApprovedAt).toLocaleString() : 'Just now'}</p>
              </div>
              <p>The host has been notified via email and can now create hackathons on the platform.</p>
              <a href="http://localhost:3001/dashboard" class="button">Go to Dashboard</a>
            </div>
          </body>
          </html>
        `;
        return res.status(HttpStatus.OK).send(html);
      }

      return res.json(result);
    } catch (error) {
      if (fromEmail) {
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Error - AIrena</title>
            <style>
              body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; padding: 40px; }
              .container { max-width: 600px; margin: 0 auto; background: #020617; padding: 40px; border-radius: 12px; text-align: center; }
              .error { color: #ef4444; font-size: 32px; margin-bottom: 20px; }
              .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">✨</div>
              <h1 style="background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">AIrena</h1>
              <p style="color: #94a3b8; margin-bottom: 30px;">Hackathon Platform</p>
              
              <div class="error">❌ Error</div>
              <p>${error.message}</p>
              <p style="margin-top: 20px; color: #94a3b8;">Please try again or contact support if the issue persists.</p>
            </div>
          </body>
          </html>
        `;
        return res.status(HttpStatus.BAD_REQUEST).send(html);
      }
      throw error;
    }
  }

  @Get('reject-host/:userId')
  @Post('reject-host/:userId')
  async rejectHost(
    @Param('userId') userId: string,
    @Query('email') fromEmail: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // If not from email, require authentication
    if (!fromEmail) {
      // Apply JWT guard manually for dashboard requests
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ForbiddenException('Authentication required');
      }
    }

    try {
      const result = await this.adminService.rejectHost(userId);

      if (fromEmail) {
        // Return HTML response for email clicks
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Host Rejected - AIrena</title>
            <style>
              body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; padding: 40px; }
              .container { max-width: 600px; margin: 0 auto; background: #020617; padding: 40px; border-radius: 12px; text-align: center; }
              .warning { color: #ef4444; font-size: 32px; margin-bottom: 20px; }
              .details { background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
              .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; }
              .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">✨</div>
              <h1 style="background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">AIrena</h1>
              <p style="color: #94a3b8; margin-bottom: 30px;">Hackathon Platform</p>
              
              <div class="warning">❌ Host Request Rejected</div>
              <div class="details">
                <p><strong>Name:</strong> ${result.rejectedUser.name}</p>
                <p><strong>Email:</strong> ${result.rejectedUser.email}</p>
                <p><strong>Status:</strong> <span style="color: #ef4444;">Rejected</span></p>
                <p><strong>Action:</strong> User account removed</p>
              </div>
              <p>The user has been notified via email about the decision.</p>
              <a href="http://localhost:3001/dashboard" class="button">Go to Dashboard</a>
            </div>
          </body>
          </html>
        `;
        return res.status(HttpStatus.OK).send(html);
      }

      return res.json(result);
    } catch (error) {
      if (fromEmail) {
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Error - AIrena</title>
            <style>
              body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; padding: 40px; }
              .container { max-width: 600px; margin: 0 auto; background: #020617; padding: 40px; border-radius: 12px; text-align: center; }
              .error { color: #ef4444; font-size: 32px; margin-bottom: 20px; }
              .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">✨</div>
              <h1 style="background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">AIrena</h1>
              <p style="color: #94a3b8; margin-bottom: 30px;">Hackathon Platform</p>
              
              <div class="error">❌ Error</div>
              <p>${error.message}</p>
              <p style="margin-top: 20px; color: #94a3b8;">Please try again or contact support if the issue persists.</p>
            </div>
          </body>
          </html>
        `;
        return res.status(HttpStatus.BAD_REQUEST).send(html);
      }
      throw error;
    }
  }

  @Get('hosts')
  @UseGuards(JwtAuthGuard)
  async getHosts(@CurrentUser() user: any) {
    this.checkAdminRole(user);
    return this.adminService.getAllHosts();
  }

  @Get('participants')
  @UseGuards(JwtAuthGuard)
  async getParticipants(@CurrentUser() user: any) {
    this.checkAdminRole(user);
    return this.adminService.getAllParticipants();
  }

  @Get('config/:key')
  @UseGuards(JwtAuthGuard)
  async getConfig(@Param('key') key: string, @CurrentUser() user: any) {
    // Allow any authenticated user to read config (needed for hosts)
    // But specific configs might need restriction. For now, creation_fee is public.
    return this.adminService.getSystemConfig(key);
  }

  @Post('config')
  @UseGuards(JwtAuthGuard)
  async updateConfig(
    @Body() body: { key: string; value: string; description?: string },
    @CurrentUser() user: any
  ) {
    this.checkAdminRole(user);
    return this.adminService.updateSystemConfig(body.key, body.value, body.description);
  }

  @Post('users/:userId/delete')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('userId') userId: string, @CurrentUser() user: any) {
    this.checkAdminRole(user);
    return this.adminService.deleteUser(userId);
  }
}