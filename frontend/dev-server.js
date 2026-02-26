const { createServer } = require('vite');

async function startServer() {
  try {
    const server = await createServer({
      server: {
        port: 3001,
        host: '0.0.0.0',
        allowedHosts: ['aaaf0e3734870.notebooks.jarvislabs.net'],
        strictPort: false,
        open: false
      }
    });
    
    await server.listen();
    console.log('🚀 Frontend server running on http://localhost:3001');
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();