// src/routes/monday-graphql.ts
import express from 'express';

const router = express.Router();

// GraphQL proxy endpoint for Monday.com API
router.post('/graphql', async (req, res) => {
  try {
    const { query, variables } = req.body;
    
    // Get API token from environment or request headers
    const apiToken = process.env.MONDAY_API_TOKEN || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiToken) {
      return res.status(401).json({ 
        error: 'Missing Monday.com API token',
        message: 'Set MONDAY_API_TOKEN environment variable or provide Authorization header'
      });
    }

    console.log('🔗 Proxying GraphQL request to Monday.com API');
    
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;