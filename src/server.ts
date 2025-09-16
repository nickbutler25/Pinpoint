// src/server.ts
import app from './app';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Monday Location Filter Server Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Board View:     http://localhost:${PORT}/view`);
  console.log(`🏥 Health Check:   http://localhost:${PORT}/health`);
  console.log(`🔧 Environment:    ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('💡 Development Tips:');
    console.log('   - Use "npm run tunnel" to create a public URL');
    console.log('   - Check browser console for interceptor logs');
    console.log('   - Add ?debug=true to URL for verbose logging');
    console.log('');
  }
});