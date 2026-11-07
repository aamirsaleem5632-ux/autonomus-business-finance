# OptiFinance — Frontend Application

React 19, TypeScript, Vite 8, and Tailwind CSS multi-page finance workspace. It presents database
records or visibly labeled simulated data and offers a rules-based finance assistant.
The shared interface uses a luxury obsidian palette with matte glass surfaces, warm off-white
typography, and champagne-gold active states and financial highlights.
The product subtitle is “Autonomous Business Finance.”

## Architecture & Structure
```
frontend/
├── src/
│   ├── api/                    # Typed finance and health API clients
│   ├── components/             # Shared responsive layout, finance UI, and health UI
│   ├── pages/                  # Overview, ledger, operations, insights, agents, and system views
│   ├── types/                  # Finance and health API contracts
│   ├── App.tsx                 # Route handling and shared backend/finance state
│   ├── index.css               # Tailwind CSS styles
│   └── main.tsx                # Client bootstrap
├── .env.example                # Frontend environment template
├── eslint.config.js            # ESLint flat config
├── vite.config.ts              # Vite configuration with API reverse proxy
└── tsconfig.json               # TypeScript configuration
```

## Application Views

The shared sidebar links to dedicated client-side views:

- `/` — command center with balances, cashflow, and monthly profitability snapshot
- `/transactions` — general journal and line-by-line inbound/outbound ledger entries
- `/payments` — payment gateways, bank transfers, payout schedules, and settlements
- `/cards` — cardholder controls, spend limits, and local-only freeze demonstrations
- `/vaults` — treasury sub-accounts, reserves, multi-currency holdings, and liquidity locks
- `/capital` — credit facilities, debt financing, and capital allocation
- `/reports` — executive summary, tax audit availability, and printable PDF output
- `/analytics` — interactive revenue/expense/net trends and source-provided cash forecasts
- `/activity` — agent execution audit history and login-audit integration availability
- `/agents` — specialist execution and rules-based finance assistant
- `/system` — backend/database health, memory telemetry, and architecture diagnostics

Legacy `/invoices` and `/budgets` URLs redirect to `/transactions` and `/analytics`.

The backend connection indicator remains in the shared top bar as routes change.
The Overview date selector filters its cashflow chart, and the Transactions page Export action
downloads available ledger entries as CSV. Its USD, EUR, and GBP balance cards use fixed,
explicitly labeled demo treasury-account values; they are illustrative and are not sourced from
the finance API. The Payments, Vaults, and Capital views identify
their missing provider integrations rather than inventing live records. Card controls are
explicitly local demonstrations. Reports can be printed or saved as PDF through the browser's
print dialog. Analytics uses available monthly and forecast data; Activity contains finance-agent
execution events, while user login audit data is marked unavailable when not provided by the
backend. The sidebar dark-mode setting switches the application theme.

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
