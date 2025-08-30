import app from './app';

// This file exists solely to start the server
// The actual app configuration is in app.ts

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Board view available at: http://localhost:${PORT}/view`);
  console.log(`🔗 Integration endpoint: http://localhost:${PORT}/api/monday`);
  console.log(`📊 API endpoints: http://localhost:${PORT}/api/boards/:boardId`);
});