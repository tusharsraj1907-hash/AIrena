const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🔄 Running Prisma migrations...');
  
  // Generate Prisma Client
  execSync('npx prisma generate', {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: '1' }
  });
  
  console.log('✅ Prisma Client generated');
  
  // Run migrations
  execSync('npx prisma migrate deploy', {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: '1' }
  });
  
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
