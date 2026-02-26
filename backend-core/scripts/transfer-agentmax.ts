import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function transferAgentMax() {
    const targetAdminEmail = 'tusharsraj2002@gmail.com';

    console.log(`🔄 Transferring AgentMax to ${targetAdminEmail}...`);

    try {
        // 1. Find the target admin user
        const adminUser = await prisma.user.findUnique({
            where: { email: targetAdminEmail }
        });

        if (!adminUser) {
            console.error('❌ Admin user not found');
            return;
        }

        console.log(`✅ Found new owner: ${adminUser.firstName} (${adminUser.id})`);

        // 2. Find the AgentMax hackathon
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
        console.log(`   Current Organizer: ${hackathon.organizerId}`);

        // 3. Update the organizer
        const updated = await prisma.hackathon.update({
            where: { id: hackathon.id },
            data: {
                organizerId: adminUser.id
            }
        });

        console.log(`✨ Ownership transferred successfully!`);
        console.log(`   New Organizer: ${updated.organizerId}`);

    } catch (error) {
        console.error('❌ Error transferring hackathon:', error);
    } finally {
        await prisma.$disconnect();
    }
}

transferAgentMax();
