# Monday.com Enhanced Location Filter

A Monday.com Board View app that intercepts and enhances the native filter functionality for Location columns, allowing users to filter by actual location values instead of just empty/not empty.

## 🎯 Features

- **Seamless Integration**: Intercepts native filter clicks on Location columns
- **Enhanced Filtering**: Filter by specific location values with multi-select
- **Native UI Match**: Exactly replicates Monday's filter design and behavior
- **Multiple Operators**: "is one of", "is not one of", "contains", "is empty", etc.
- **Persistent Filters**: Saves filter state and integrates with Monday's filter system
- **Real-time Updates**: Shows filtered item counts as you select locations

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Monday.com developer account
- Monday.com app created in your account

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd monday-location-filter
```

2. **Install dependencies:**
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add:
```
MONDAY_SIGNING_SECRET=your_signing_secret_here
PORT=8080
NODE_ENV=development
```

4. **Start development server:**
```bash
npm run dev
```

This will:
- Build the React client
- Start the Express server
- Create a tunnel for Monday.com testing

## 📋 Monday.com App Configuration

### 1. Create a Monday App

1. Go to [monday.com developers](https://developer.monday.com/)
2. Click "Create App"
3. Choose "Build your own app"
4. Name it "Enhanced Location Filter"

### 2. Configure Board View Feature

In your app's Feature section:

```json
{
  "name": "Enhanced Location Filter",
  "type": "board_view",
  "url": "https://your-app-url.com/view",
  "permissions": {
    "boards": ["read"],
    "items": ["read"],
    "columns": ["read"]
  }
}
```

### 3. Set Required Permissions

Enable these scopes in the Permissions section:
- `boards:read` - Read board structure
- `items:read` - Read board items
- `columns:read` - Read column data

### 4. Install the App

1. In your Monday workspace, go to any board
2. Click the "+" button to add a view
3. Search for "Enhanced Location Filter"
4. Click to install

## 🔧 How It Works

### Architecture

```
┌─────────────────────┐
│   Monday.com Board  │
│                     │
│  ┌───────────────┐  │
│  │ Location Col  │  │
│  │      ⋮        │  │  User clicks Filter
│  │   [Filter]    │──┼──────────┐
│  └───────────────┘  │          │
└─────────────────────┘          ▼
                        ┌─────────────────┐
                        │ Filter          │
                        │ Interceptor     │
                        │                 │
                        │ Detects location│
                        │ column filter   │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Enhanced Filter │
                        │ Modal           │
                        │                 │
                        │ • Multi-select  │
                        │ • Search        │
                        │ • Operators     │
                        └─────────────────┘
```

### Key Components

1. **FilterInterceptor Service** (`services/FilterInterceptor.ts`)
   - Monitors DOM for filter menu clicks
   - Identifies Location columns via Monday API
   - Intercepts native filter actions

2. **LocationFilterModal** (`components/LocationFilterModal.tsx`)
   - Exact replica of Monday's native filter UI
   - Fetches available locations from board data
   - Applies filters via Monday SDK

3. **Board View App** (`App.tsx`)
   - Invisible background app
   - Manages interceptor lifecycle
   - Handles filter state

## 🛠️ Development

### Local Testing

1. **Start dev server:**
```bash
npm run dev
```

2. **Test interceptor:**
- The app will show a green indicator in development mode
- Open browser console to see interceptor logs
- Click on a Location column's filter to test

### Building for Production

```bash
npm run build
```

This creates:
- `dist/` - Compiled server files
- `client/build/` - Production React bundle

### Deployment Options

#### Option 1: Monday Code (Recommended)

```bash
npm run deploy
```

This uses Monday's hosting infrastructure.

#### Option 2: Custom Hosting

Deploy to any Node.js host (Heroku, AWS, etc.):

1. Set environment variables on host
2. Run build command
3. Start with `npm start`

## 📊 API Reference

### Monday SDK Methods Used

```javascript
// Get board context
monday.get('context')

// Fetch board data
monday.api(graphqlQuery, { variables })

// Apply filter
monday.execute('filterBoard', { filterParams })

// Store filter state
monday.storage.instance.setItem(key, value)
```

### Filter Parameters

```javascript
{
  columnId: string,        // Location column ID
  compareValue: string[],  // Selected locations
  operator: 'any_of' | 'not_any_of' | 'is_empty' | 'is_not_empty'
}
```

## 🐛 Troubleshooting

### Filter not intercepting

1. Check browser console for errors
2. Verify Location column type in Monday
3. Ensure app has correct permissions

### Locations not loading

1. Check Monday API response in Network tab
2. Verify board has Location column with data
3. Check for API rate limits

### UI doesn't match Monday's style

1. Clear browser cache
2. Check for Monday UI updates
3. Verify CSS is loading correctly

## 🔍 Debug Mode

Add to URL: `?debug=true` to enable verbose logging:
- Shows all interceptor actions
- Logs Monday API calls
- Displays column detection

## 📝 Future Enhancements

- [ ] Radius-based filtering (within X miles)
- [ ] Location grouping (by city, state, country)
- [ ] Saved filter presets
- [ ] Bulk location operations
- [ ] Integration with map view
- [ ] Custom location hierarchies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 💬 Support

- **Documentation**: [Monday API Docs](https://developer.monday.com/)
- **Issues**: Submit via GitHub Issues
- **Community**: [Monday Community Forum](https://community.monday.com/)

## 🙏 Acknowledgments

- Monday.com for the comprehensive API
- React team for the excellent framework
- The Monday developer community

---

**Note**: This app enhances Monday.com's native functionality. Always test thoroughly before deploying to production boards.