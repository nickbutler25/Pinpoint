// src/app.ts
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Board view endpoint - serves the React app
// This is the main endpoint Monday.com will load for the board view
app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// API endpoint for fetching board data
app.post('/api/board-data', async (req, res) => {
  try {
    const { boardId, columnId } = req.body;
    
    // This endpoint can be used to fetch board data server-side if needed
    // For now, we'll let the client handle API calls directly
    res.json({ 
      success: true,
      message: 'Board data endpoint',
      boardId,
      columnId
    });
  } catch (error) {
    console.error('Error fetching board data:', error);
    res.status(500).json({ error: 'Failed to fetch board data' });
  }
});

// Monday.com webhook endpoint (for future use)
app.post('/api/monday/webhook', (req, res) => {
  try {
    console.log('Monday webhook received:', req.body);
    
    // Verify webhook signature if MONDAY_SIGNING_SECRET is set
    if (process.env.MONDAY_SIGNING_SECRET) {
      // Add signature verification logic here
    }
    
    res.status(200).json({ 
      message: 'Webhook received'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Monday Location Filter is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

export default app;