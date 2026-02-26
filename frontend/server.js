const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the src directory for development
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
});