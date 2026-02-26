import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Create a Default Organizer
    const organizerEmail = 'organizer@gccfusion.com';
    let organizer = await prisma.user.findUnique({
        where: { email: organizerEmail }
    });

    if (!organizer) {
        const hashedPassword = await bcrypt.hash('Organize123!', 10);
        organizer = await prisma.user.create({
            data: {
                email: organizerEmail,
                passwordHash: hashedPassword,
                firstName: 'Global',
                lastName: 'Organizer',
                role: 'ORGANIZER',
                status: 'ACTIVE',
                bio: 'Official GCC Fusion Organizer'
            }
        });
        console.log('✅ Created default organizer');
    } else {
        console.log('ℹ️ Organizer already exists');
    }

    // 2. Create a Sample Hackathon
    const sampleHackathonTitle = 'Global Innovation Challenge 2026';
    const existingHackathon = await prisma.hackathon.findFirst({
        where: { title: sampleHackathonTitle }
    });

    if (!existingHackathon) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 30); // 30 days from now

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 3); // 3 days duration

        const regEnd = new Date(startDate);
        regEnd.setDate(regEnd.getDate() - 7); // Registration ends 7 days before start

        await prisma.hackathon.create({
            data: {
                title: sampleHackathonTitle,
                description: 'A global hackathon to solve world problems using AI and modern tech.',
                whyParticipate: 'Networking, prizes, and global exposure.',
                category: 'AI_ML',
                status: 'UPCOMING',
                startDate: startDate,
                endDate: endDate,
                registrationStart: new Date(),
                registrationDeadline: regEnd,
                organizerId: organizer.id,
                location: 'Global / Virtual',
                isVirtual: true,
                prizeAmount: 50000,
                prizeCurrency: 'USD',
                expectedOutcome: 'Working prototypes address climate change.',
                rules: 'Teams of up to 5 members.',
                guidelines: 'Use of open-source frameworks is encouraged.',
                termsAndConditions: 'All work must be original.',
                contactPerson: 'Global Organizer',
                contactEmail: 'contact@gccfusion.com',
                judgingCriteria: [
                    { criterion: 'Innovation', weight: 40, description: 'How innovative is the solution?' },
                    { criterion: 'Technical Depth', weight: 30, description: 'The quality of the code and architecture.' }
                ] as any,
                judges: [
                    { name: 'Dr. Tech', email: 'drtech@example.com', bio: 'AI Researcher', expertise: 'Machine Learning' }
                ] as any
            }
        });
        console.log('✅ Created sample hackathon');
    } else {
        console.log('ℹ️ Sample hackathon already exists');
    }

    console.log('✨ Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
