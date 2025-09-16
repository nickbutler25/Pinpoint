# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pinpoint Location Filter is a Monday.com integration app that provides enhanced location-based filtering for the location column in any native Monday.com grids.

## Development Commands

### Main Development Commands

```bash
# Start full development environment (recommended)
npm run dev
# - Builds React client
# - Starts Express server with hot reload
# - Creates secure tunnel for Monday.com testing

# Server only
npm run dev-server

# Client only
npm run client-dev
cd client && npm run dev

# Clean build
npm run build
```

### Testing and Quality

```bash
# Lint TypeScript files
npm run lint

# Build client
npm run client-build

# Stop development servers (kills port 8080)
npm run stop
```

### GraphQL Code Generation

```bash
# Fetch latest Monday.com GraphQL schema
npm run fetch:schema

# Generate TypeScript types from schema
npm run codegen

# Do both operations
npm run fetch:generate
```

### Deployment

```bash
# Deploy to Monday.com platform
npm run deploy
```

## Architecture

### Backend Structure

- **Express.js server** with TypeScript
- **Service Layer**:
  - `MondayService` - Official Monday.com SDK integration
  - `TransformationService` - Data transformation utilities
- **Controllers**: REST API handlers for boards and Monday.com webhooks
- **Routes**: API endpoint definitions (`/api/boards/:boardId`, `/api/monday`)

### Frontend Structure

- **React application** with TypeScript
- **Multi-mode detection**: Automatically adapts UI based on Monday.com context
- **Key Components**:
  - `RealBoardGrid` - Displays actual Monday.com board data
  - `LocationFilter` - Advanced filtering UI with search and multi-select
  - `ColumnExtension` - Popup interface for column-specific filtering

### Key Integrations

- **Monday.com SDK**: Official SDK for context and API access
- **GraphQL API**: Direct queries to Monday.com's GraphQL endpoint
- **Vibe UI**: Monday.com's design system components

## Local Development Modes

The app supports multiple testing configurations via URL parameters:

- **Standard Development**: `http://localhost:8080/view` (mock data)
- **Real Board Testing**: `http://localhost:8080/view?board=real&boardId=BOARD_ID`
- **Column Extension Testing**: `http://localhost:8080/view?test=column`
- **Direct Extension**: `http://localhost:8080/column-extension`

## Environment Configuration

Required environment variables in `.env`:

- `MONDAY_SIGNING_SECRET` - Monday.com app signing secret (required for authentication)
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - development/production

## File Structure Patterns

### Server Files (`src/`)

- `server.ts` - Entry point
- `app.ts` - Express app configuration and middleware
- `routes/` - API route definitions
- `controllers/` - Request handlers and business logic
- `services/` - External API integrations and data services
- `middlewares/` - Express middleware functions
- `generated/` - Auto-generated GraphQL types

### Client Files (`client/src/`)

- `app.tsx` - Main React component with context detection
- `components/` - Reusable UI components
- `types/` - TypeScript type definitions

## GraphQL Integration

- Schema auto-fetched from Monday.com API via `fetch-schema.sh`
- Types generated using GraphQL Code Generator (`codegen.yml`)
- Generated types in `src/generated/graphql.ts`

## Monday.com App Configuration

The app supports three Monday.com feature types (defined in `src/app-manifest.yml`):

- **Board View** (`/view`) - Full board interface
- **Column Extension** (`/column-extension`) - Column popup
- **Integration** (`/api/monday`) - Webhook/automation endpoint

## Key Development Notes

- App uses **dual SDK approach**: Official Monday.com SDK + direct GraphQL queries
- **Context-aware routing**: Different UI modes based on Monday.com execution context
- **Mock data support**: Comprehensive test data for local development without Monday.com access
- **Native filtering integration**: Leverages Monday.com's built-in `filterBoard` API rather than reimplementing
