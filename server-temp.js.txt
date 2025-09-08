// server-temp.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GraphQL proxy endpoint for Monday.com API
app.post('/api/monday/graphql', async (req, res) => {
  try {
    const { query, variables } = req.body;
    
    // Get API token from environment
    const apiToken = process.env.MONDAY_API_TOKEN;
    
    if (!apiToken) {
      return res.status(401).json({ 
        error: 'Missing Monday.com API token',
        message: 'Set MONDAY_API_TOKEN environment variable'
      });
    }

    console.log('🔗 Proxying GraphQL request to Monday.com API');
    
    // Use dynamic import for fetch in Node.js
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
        'API-Version': '2023-10'
      },
      body: JSON.stringify({ query, variables })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Monday.com API Error:', result);
      return res.status(response.status).json(result);
    }

    res.json(result);
    
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Board view endpoint - serves the React app
app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Column extension endpoint
app.get('/column-extension', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

// Catch all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Board view available at: http://localhost:${PORT}/view`);
  console.log(`🔗 Integration endpoint: http://localhost:${PORT}/api/monday`);
  console.log(`📊 API endpoints: http://localhost:${PORT}/api/boards/:boardId`);
});