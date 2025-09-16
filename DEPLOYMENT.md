# Monday.com Deployment Guide

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Prepare Your App

1. **Build the application:**
```bash
npm run build
```

This creates:
- `dist/` - Server files
- `client/build/` - Client files

### Step 2: Create Monday App

1. **Go to Monday Developers:**
   - Navigate to https://developer.monday.com/apps
   - Click "Create app"

2. **Configure Basic Information:**
   ```
   App Name: Enhanced Location Filter
   Description: Advanced filtering for location columns
   Category: Productivity & Efficiency
   ```

3. **Add App Icon:**
   - Use a 512x512px PNG
   - Suggested: Location pin icon

### Step 3: Configure Board View Feature

1. **In Features Section:**
   - Click "Add new feature"
   - Choose "Board View"

2. **Configure Board View:**
   ```json
   {
     "name": "Location Filter",
     "description": "Enhanced location filtering",
     "url": "https://your-app-url.com/view",
     "type": "board_view"
   }
   ```

### Step 4: Set Permissions

Required OAuth Scopes:
- ✅ `boards:read`
- ✅ `items:read` 
- ✅ `columns:read`

### Step 5: Deploy to Monday Code (Recommended)

1. **Install Monday CLI:**
```bash
npm install -g @mondaycom/apps-cli
```

2. **Login to Monday:**
```bash
mapps auth:login
```

3. **Initialize deployment:**
```bash
mapps code:init
```

4. **Deploy:**
```bash
npm run deploy
```

Your app URL will be:
```
https://your-app-id.monday-code.com/view
```

### Step 6: Alternative Deployment (Custom Hosting)

#### Option A: Heroku

1. **Create Heroku app:**
```bash
heroku create monday-location-filter
```

2. **Set environment variables:**
```bash
heroku config:set MONDAY_SIGNING_SECRET=your_secret
heroku config:set NODE_ENV=production
```

3. **Deploy:**
```bash
git push heroku main
```

#### Option B: AWS EC2

1. **Launch EC2 instance**
2. **Install Node.js 18+**
3. **Clone repository**
4. **Install PM2:**
```bash
npm install -g pm2
```

5. **Start app:**
```bash
pm2 start dist/server.js --name monday-filter
```

#### Option C: Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

### Step 7: Configure App URL

1. **Update Board View URL in Monday:**
   - Go to your app settings
   - Update the Board View URL to your deployment URL
   - Save changes

### Step 8: Test Installation

1. **Install in test workspace:**
   - Create a test board
   - Add Location column with data
   - Click "+" to add view
   - Select "Enhanced Location Filter"

2. **Verify functionality:**
   - Click "⋯" on Location column
   - Click "Filter"
   - Verify custom filter appears

### Step 9: Submit for Review (Optional)

For marketplace listing:

1. **Prepare assets:**
   - App icon (512x512)
   - Screenshots (1920x1080)
   - Demo video (< 2 min)

2. **Write descriptions:**
   - Short description (160 chars)
   - Long description (4000 chars)
   - Key features list

3. **Submit for review:**
   - Click "Submit for review"
   - Wait 5-10 business days

## 📊 Monitoring

### Add logging service:

```javascript
// src/app.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health monitoring endpoint:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: packageJson.version
  });
});
```

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Input validation added
- [ ] Error messages sanitized
- [ ] CORS configured properly
- [ ] Webhook signature verification
- [ ] API keys rotated regularly

## 🐛 Troubleshooting Deployment

### App not loading in Monday:

1. Check URL is accessible publicly
2. Verify HTTPS certificate
3. Check CORS headers
4. Review browser console errors

### Filter not intercepting:

1. Clear browser cache
2. Check app permissions
3. Verify board view is active
4. Review interceptor logs

### Performance issues:

1. Enable caching
2. Optimize API queries
3. Use CDN for assets
4. Implement lazy loading

## 📈 Scaling Considerations

For high-traffic boards:

1. **Implement caching:**
```javascript
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCachedLocations(boardId) {
  const cached = cache.get(boardId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

2. **Use connection pooling**
3. **Implement queue for API requests**
4. **Add horizontal scaling with load balancer**

## 🔄 Update Process

1. **Test updates locally**
2. **Deploy to staging**
3. **Run integration tests**
4. **Deploy to production**
5. **Monitor for issues**

## 📞 Support

- **Monday Developer Forum**: https://community.monday.com/c/developers
- **API Documentation**: https://developer.monday.com/api-reference
- **Support Email**: support@monday.com

---

**Remember:** Always test in a development workspace before deploying to production!