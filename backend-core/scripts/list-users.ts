import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    console.log('🔍 Listing users...');
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
        }
    });
    console.table(users);

    // Also find AgentMax current owner
    const hackathon = await prisma.hackathon.findFirst({
        where: { title: { contains: 'AgentMaX', mode: 'insensitive' } },
        select: { id: true, title: true, organizerId: true, organizer: { select: { email: true } } }
    });

    if (hackathon) {
        console.log('\n🏆 AgentMax Hackathon:', hackathon);
    } else {
        console.log('\n❌ AgentMax Hackathon not found');
    }
}

listUsers()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
