import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAgentMaxParticipants() {
    console.log('🧹 Cleaning up AgentMax participants...');

    try {
        // 1. Find the AgentMax hackathon
        const hackathon = await prisma.hackathon.findFirst({
            where: {
                title: {
                    contains: 'AgentMaX',
                    mode: 'insensitive',
                },
            },
        });

        if (!hackathon) {
            console.error('❌ AgentMax hackathon not found');
            return;
        }

        console.log(`✅ Found hackathon: ${hackathon.title} (${hackathon.id})`);

        // 2. Delete all participants for this hackathon
        // Note: Due to foreign key constraints, we might need to delete submissions or teams first if cascading isn't set up
        // But typically deleting participants is sufficient if they are the link

        // Deleting teams associated with this hackathon
        // This will likely cascade delete participants who are part of these teams, or we handle them separately

        // First, let's count what we're about to delete
        const participantCount = await prisma.hackathonParticipant.count({
            where: { hackathonId: hackathon.id }
        });

        const teamCount = await prisma.team.count({
            where: { hackathonId: hackathon.id }
        });

        console.log(`📊 Found ${participantCount} participants and ${teamCount} teams to delete.`);

        if (participantCount > 0) {
            // Delete participants
            const { count: deletedParticipants } = await prisma.hackathonParticipant.deleteMany({
                where: { hackathonId: hackathon.id }
            });
            console.log(`🗑️ Deleted ${deletedParticipants} participants.`);
        }

        if (teamCount > 0) {
            // Delete teams
            const { count: deletedTeams } = await prisma.team.deleteMany({
                where: { hackathonId: hackathon.id }
            });
            console.log(`🗑️ Deleted ${deletedTeams} teams.`);
        }

        // Optional: Delete the user accounts created for seeding if they follow a specific pattern and aren't used elsewhere
        // For now, minimizing risk by only removing them from the hackathon as requested ("in the database dont add any users details in it")

        console.log('✨ Cleanup complete!');

    } catch (error) {
        console.error('❌ Error cleaning up:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupAgentMaxParticipants();
