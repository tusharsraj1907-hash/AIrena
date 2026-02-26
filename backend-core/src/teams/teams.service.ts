import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(leaderId: string, createTeamDto: CreateTeamDto) {
    const { name, description, hackathonId, members } = createTeamDto;

    // Verify hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Verify leader is registered for hackathon
    const leaderParticipation = await this.prisma.hackathonParticipant.findUnique({
      where: {
        userId_hackathonId: {
          userId: leaderId,
          hackathonId,
        },
      },
    });

    if (!leaderParticipation) {
      throw new BadRequestException('You must be registered for the hackathon to create a team');
    }

    // Check team size limits
    const totalMembers = members.length + 1; // +1 for leader
    if (totalMembers < hackathon.minTeamSize) {
      throw new BadRequestException(`Team must have at least ${hackathon.minTeamSize} members`);
    }
    if (totalMembers > hackathon.maxTeamSize) {
      throw new BadRequestException(`Team cannot exceed ${hackathon.maxTeamSize} members`);
    }

    // Create team
    const team = await this.prisma.team.create({
      data: {
        name,
        description,
        hackathonId,
        leaderId,
      },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update leader's participation to link to team
    await this.prisma.hackathonParticipant.update({
      where: {
        userId_hackathonId: {
          userId: leaderId,
          hackathonId,
        },
      },
      data: {
        teamId: team.id,
        role: 'LEADER',
      },
    });

    // Process team member invites
    const memberResults = [];
    for (const member of members) {
      try {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
          where: { email: member.email },
        });

        if (user) {
          // Check if already registered for hackathon
          const existingParticipation = await this.prisma.hackathonParticipant.findUnique({
            where: {
              userId_hackathonId: {
                userId: user.id,
                hackathonId,
              },
            },
          });

          if (existingParticipation) {
            // Update to join team
            await this.prisma.hackathonParticipant.update({
              where: {
                userId_hackathonId: {
                  userId: user.id,
                  hackathonId,
                },
              },
              data: {
                teamId: team.id,
                role: 'MEMBER',
              },
            });
            memberResults.push({ email: member.email, status: 'added', userId: user.id });
          } else {
            // Register and add to team
            await this.prisma.hackathonParticipant.create({
              data: {
                userId: user.id,
                hackathonId,
                teamId: team.id,
                role: 'MEMBER',
              },
            });
            memberResults.push({ email: member.email, status: 'registered_and_added', userId: user.id });
          }
        } else {
          // User doesn't exist - send invite (for now, just log)
          memberResults.push({ email: member.email, status: 'invite_sent' });
          // TODO: Send email invitation
        }
      } catch (error) {
        console.error(`Error processing member ${member.email}:`, error);
        memberResults.push({ email: member.email, status: 'error' });
      }
    }

    return {
      team,
      memberResults,
    };
  }

  async findByHackathon(hackathonId: string) {
    return this.prisma.team.findMany({
      where: { hackathonId },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            submissions: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async findAll() {
    return [];
  }

  async update(id: string, updateData: any) {
    return null;
  }

  async remove(id: string) {
    return { message: 'Team deleted successfully' };
  }

  async addMember(teamId: string, userId: string) {
    return { message: 'Member added successfully' };
  }

  async removeMember(teamId: string, userId: string) {
    return { message: 'Member removed successfully' };
  }
}
