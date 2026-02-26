const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'gcc_fusion'"
    );
    
    if (result.rows.length === 0) {
      await client.query('CREATE DATABASE gcc_fusion');
      console.log('✅ Database "gcc_fusion" created successfully');
    } else {
      console.log('✅ Database "gcc_fusion" already exists');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
