
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Listing all hackathons...');
    const hackathons = await prisma.hackathon.findMany({
        select: {
            id: true,
            title: true,
            status: true,
            maxTeamSize: true,
            _count: {
                select: {
                    teams: true,
                    participants: true
                }
            }
        }
    });

    if (hackathons.length === 0) {
        console.log('❌ No hackathons found.');
    } else {
        console.table(hackathons);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
