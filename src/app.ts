import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

// Import routes
import boardRoutes from './routes/board';
import mondayRoutes from './routes/monday';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api', boardRoutes);
app.use(mondayRoutes); // Add Monday integration routes

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Board view endpoint - serves the React app
app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Integration endpoint (for Monday.com webhooks/integrations)
app.post('/api/monday', (req, res) => {
  try {
    // Handle Monday.com integration requests here
    console.log('Monday integration request:', req.body);
    res.status(200).json({ 
      message: 'Integration endpoint received',
      data: req.body 
    });
  } catch (error) {
    console.error('Integration error:', error);
    res.status(500).json({ error: 'Integration error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Pinpoint Location Filter is running',
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
    message: err.message 
  });
});

export default app;