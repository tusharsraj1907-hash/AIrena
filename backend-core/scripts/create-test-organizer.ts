import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestOrganizer() {
  const email = 'organizer@test.com';
  const password = 'Test@123'; // Simple test password
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      // Update existing user
      const updated = await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          role: 'ORGANIZER',
          status: 'ACTIVE',
        },
      });
      console.log('✅ Updated existing user to organizer:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${updated.role}`);
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: 'Test',
          lastName: 'Organizer',
          role: 'ORGANIZER',
          status: 'ACTIVE',
        },
      });
      console.log('✅ Created test organizer account:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${user.role}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrganizer();
