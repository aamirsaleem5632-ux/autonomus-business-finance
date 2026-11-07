# Autonomous Business Finance Platform - Frontend Application

React 19, TypeScript, Vite 8, and Tailwind CSS web client.

## Architecture & Structure
```
frontend/
├── src/
│   ├── api/                    # Typed API client and endpoint queries
│   ├── components/             # Reusable UI components
│   ├── types/                  # TypeScript interfaces and contracts
│   ├── App.tsx                 # Main application view
│   ├── index.css               # Tailwind CSS styles
│   └── main.tsx                # Client bootstrap
├── .env.example                # Frontend environment template
├── eslint.config.js            # ESLint flat config
├── vite.config.ts              # Vite configuration with API reverse proxy
└── tsconfig.json               # TypeScript configuration
```

## Setup & Running
```bash
# Copy environment configuration
cp .env.example .env

# Start development server (with /api proxy to http://localhost:3000)
npm run dev

# Run linting
npm run lint

# Build production bundle
npm run build
```
