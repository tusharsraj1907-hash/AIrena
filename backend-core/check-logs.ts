import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.emailLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    console.log('--- Last 10 Email Logs ---');
    logs.forEach(log => {
        console.log(`To: ${log.to}, Subject: ${log.subject}, Status: ${log.status}, Error: ${log.error || 'None'}, Date: ${log.createdAt}`);
    });

    const payments = await prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { host: true }
    });

    console.log('\n--- Last 10 Payments ---');
    payments.forEach(payment => {
        console.log(`ID: ${payment.id}, Host: ${payment.host.email}, Status: ${payment.status}, Invoice: ${payment.invoiceId}, Date: ${payment.createdAt}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
