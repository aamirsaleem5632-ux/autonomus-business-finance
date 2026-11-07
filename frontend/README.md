# Autonomous Business Finance Platform - Frontend Application

React 19, TypeScript, Vite 8, and Tailwind CSS finance dashboard. It presents database records
or visibly labeled simulated data and offers a rules-based finance assistant.

## Architecture & Structure
```
frontend/
├── src/
│   ├── api/                    # Typed finance and health API clients
│   ├── components/             # Finance dashboard, assistant, and health UI
│   ├── types/                  # Finance and health API contracts
│   ├── App.tsx                 # Finance command center
│   ├── index.css               # Tailwind CSS styles
│   └── main.tsx                # Client bootstrap
├── .env.example                # Frontend environment template
├── eslint.config.js            # ESLint flat config
├── vite.config.ts              # Vite configuration with API reverse proxy
└── tsconfig.json               # TypeScript configuration
```

## Setup & Running
```bash
# Optional: copy .env.example to .env.local. Keep VITE_API_BASE_URL=/api so Vite proxies
# requests to NestJS and avoids browser CORS issues. Set VITE_API_PROXY_TARGET only if the
# backend listens on a different host or port. Set VITE_USE_SIMULATED_DATA=true to force
# local simulated finance data. Finance requests also fall back locally on network errors
# and HTTP 404 responses. No frontend secret configuration is required.

# Start development server (with /api proxy to http://127.0.0.1:3000)
npm run dev

# Run linting
npm run lint

# Build production bundle
npm run build
```
