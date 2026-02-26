import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAgentMax() {
    console.log('🌱 Seeding AgentMax hackathon...');

    // 1. Create/find the organizer user
    const organizerEmail = 'organizer@agentmax.in';
    let organizer = await prisma.user.findUnique({ where: { email: organizerEmail } });

    if (!organizer) {
        const hashedPassword = await bcrypt.hash('AgentMax2025!', 10);
        organizer = await prisma.user.create({
            data: {
                email: organizerEmail,
                passwordHash: hashedPassword,
                firstName: 'AgentMaX',
                lastName: 'Team',
                role: 'ORGANIZER',
                status: 'ACTIVE',
                organizationName: 'AgentMaX',
                bio: "India's Largest Agentic AI Hackathon organizer",
            },
        });
        console.log('✅ Created AgentMax organizer user');
    } else {
        console.log('ℹ️ AgentMax organizer already exists');
    }

    // 2. Create/find the AgentMax hackathon
    const existing = await prisma.hackathon.findFirst({
        where: { title: { contains: 'AgentMaX' } },
    });

    if (existing) {
        console.log('ℹ️ AgentMax hackathon already exists:', existing.id);
        await prisma.$disconnect();
        return;
    }

    const hackathon = await prisma.hackathon.create({
        data: {
            title: "AgentMaX - India's Largest Agentic AI Hackathon",
            description:
                'Join the revolution! Build the next generation of autonomous AI agents. AgentMax is bringing together the brightest minds to solve complex problems using agentic workflows.',
            whyParticipate:
                "🚀 **Why AgentMax?**\n- **Massive Prize Pool**: ₹5,00,000 up for grabs!\n- **Networking**: Connect with top AI researchers and founders.\n- **Learning**: Workshops on LangChain, AutoGPT, and more.",
            category: 'AI_ML',
            type: 'TEAM',
            status: 'LIVE',
            startDate: new Date('2025-03-15T09:00:00Z'),
            endDate: new Date('2025-03-16T18:00:00Z'),
            registrationStart: new Date('2025-01-01T00:00:00Z'),
            registrationDeadline: new Date('2025-03-10T23:59:59Z'),
            submissionDeadline: new Date('2025-03-16T12:00:00Z'),
            location: 'KTPO, Whitefield, Bangalore, India',
            isVirtual: false,
            bannerUrl:
                'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop',
            logoUrl: '/agentmax-logo.png',
            prizeAmount: 500000,
            prizeCurrency: 'INR',
            prizePool: 'INR 500000',
            minTeamSize: 2,
            maxTeamSize: 5,
            registrationFee: 29999,
            expectedOutcome:
                'Functional agentic workflows that can solve real-world tasks autonomously. Prototypes should demonstrate reasoning, planning, and execution capabilities.',
            rules: '1. All code must be written during the hackathon.\n2. Teams must consist of 2-5 members.\n3. Use of open-source models is encouraged.\n4. Respect the Code of Conduct.',
            guidelines: 'Focus on innovation and usability. Presentations should be 5 minutes max.',
            termsAndConditions:
                'All submissions must be original work. Participants must agree to the AgentMaX code of conduct.',
            contactPerson: 'AgentMaX Team',
            contactEmail: 'hackathon@agentmax.in',
            contactPhone: '+91-89512-80606',
            organizerId: organizer.id,
            judgingCriteria: [
                { criterion: 'Innovation', weight: 35, description: 'How novel and creative is the agentic solution?' },
                { criterion: 'Technical Depth', weight: 30, description: 'Quality of the code, architecture, and agent design.' },
                { criterion: 'Usability', weight: 20, description: 'How easy is it to use the agent in real-world scenarios?' },
                { criterion: 'Presentation', weight: 15, description: 'Clarity and quality of the demo and explanation.' },
            ] as any,
            judges: [
                {
                    name: 'Dr. Arun Kumar',
                    email: 'arun@agentmax.in',
                    bio: 'AI Researcher at IISc with focus on autonomous agents',
                    expertise: 'Agentic AI, LLMs',
                },
                {
                    name: 'Priya Sharma',
                    email: 'priya@agentmax.in',
                    bio: 'CTO at an AI startup, previously at Google DeepMind',
                    expertise: 'Multi-agent systems',
                },
            ] as any,
        },
    });

    console.log('✅ AgentMax hackathon created with ID:', hackathon.id);
    console.log('✨ Done!');
    await prisma.$disconnect();
}

seedAgentMax().catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
});
