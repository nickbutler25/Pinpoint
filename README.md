# Monday.com Location Filter App

## Overview

This is a Monday.com integration app that provides location-based filtering for board items. It's built with TypeScript, Express.js backend, and React frontend. The app can be used as a board view integration to filter items by location columns.

## Features

- 📍 **Location Filtering**: Filter board items by location or text columns
- 🎯 **Smart Column Detection**: Automatically detects location-related columns
- 🔍 **Search & Filter**: Search through locations and apply filters
- 📊 **Real-time Stats**: Shows filtered vs total item counts
- 🎨 **Modern UI**: Clean, responsive interface matching Monday's design language

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Monday.com developer account
- Monday.com app with necessary permissions

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd monday-location-filter-app
```

2. Install server dependencies:

```bash
npm install
```

3. Install client dependencies:

```bash
cd client && npm install && cd ..
```

4. Set up environment variables:

```bash
cp .env.example .env
```

5. Configure your `.env` file with your Monday.com credentials:
   - Get your `MONDAY_SIGNING_SECRET` from Monday.com Developers section → Your App → Basic Information → Signing Secret

## Development

1. **Start the development server:**

```bash
npm run dev
```

This command will:

- Build the React client
- Start the Express server with hot reload
- Create a secure tunnel for Monday.com integration testing

2. **Alternative development commands:**

```bash
# Start only the server
npm run dev-server

# Build the client only
npm run client-build

# Start client development server
npm run client-dev
```

## Project Structure

```
├── src/                    # Backend source code
│   ├── controllers/        # Request handlers
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── middlewares/       # Express middlewares
│   ├── generated/         # GraphQL generated types
│   ├── app.ts            # Express app configuration
│   └── server.ts         # Server entry point
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   └── App.tsx       # Main React component
│   └── public/           # Static assets
├── package.json          # Server dependencies and scripts
└── README.md
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /view` - Serves the React application
- `GET /api/boards/:boardId` - Fetch board data with columns and items
- `POST /api/monday` - Monday.com webhook endpoint
- `POST /api/monday/execute_action` - Monday automation trigger
- `POST /api/monday/reverse_string` - Example Monday action

## Usage

1. **In Monday.com:**

   - Install the app in your Monday workspace
   - Add it as a board view to any board with location data
   - The app will automatically detect location columns

2. **Local Testing:**
   - Run `npm run dev` to start development
   - Visit `http://localhost:8080/view` to test locally
   - Mock data will be used for local development

## Configuration

### Environment Variables

- `MONDAY_SIGNING_SECRET` - Your Monday app's signing secret (required)
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (development/production)

### Monday.com App Configuration

Ensure your Monday.com app has:

- Board view permissions
- Read board data permissions
- Webhook URL configured (for production)

## Building for Production

1. **Build the application:**

```bash
npm run build
```

2. **Deploy to Monday Code:**

```bash
npm run deploy
```

3. **Alternative deployment:**

- The built files will be in `dist/` (server) and `client/build/` (client)
- Deploy to your preferred hosting platform

## GraphQL Code Generation

This project uses GraphQL code generation for type safety:

```bash
# Fetch latest Monday.com GraphQL schema
npm run fetch:schema

# Generate TypeScript types
npm run codegen

# Do both in one command
npm run fetch:generate
```

## Troubleshooting

**Common Issues:**

1. **"No board context found"**

   - Ensure the app is installed as a board view
   - Check that you're accessing it from within a Monday.com board

2. **"Authorization token required"**

   - Verify `MONDAY_SIGNING_SECRET` is set correctly
   - Ensure your Monday.com app has proper permissions

3. **Build failures**

   - Run `npm install` in both root and `client/` directories
   - Check Node.js version (requires v18+)

4. **Development script issues**
   - Make sure port 8080 is available
   - Run `npm run stop` to kill any hanging processes

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under UNLICENSED - see the package.json file for details.

## Support

For support with this integration:

- Check the [Monday.com Developer Documentation](https://developer.monday.com/)
- Review the [Monday.com GraphQL API](https://developer.monday.com/api-reference/docs/introduction-to-graphql)
- Open an issue in this repository
