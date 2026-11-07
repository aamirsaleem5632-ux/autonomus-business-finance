# Development Guide & Code Quality Standards

## 1. Prerequisites
- **Node.js**: >= 20.x (tested on Node v24)
- **npm**: >= 10.x
- **PostgreSQL**: Optional for baseline health checks; required for database persistence operations.

---

## 2. Quick Start

### 2.1 Repository Setup
```bash
# Clone the repository
git clone <repository_url>
cd autonomous-business-finance

# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2.2 Running Backend and Frontend

You can run both tiers concurrently or independently:

```bash
# Terminal 1: Backend service (starts on http://localhost:3000)
npm run dev:backend

# Terminal 2: Frontend service (starts on http://localhost:5173)
npm run dev:frontend
```

---

## 3. Available NPM Scripts

From the repository root:

| Command | Action |
| :--- | :--- |
| `npm run dev:backend` | Starts NestJS server in watch mode |
| `npm run dev:frontend` | Starts Vite dev server with proxy to backend |
| `npm run build` | Compiles both backend and frontend applications |
| `npm run build:backend` | Compiles NestJS backend via `nest build` |
| `npm run build:frontend` | Type-checks and bundles frontend via Vite |
| `npm run lint` | Runs ESLint verification across frontend and backend |
| `npm run format` | Applies Prettier formatting rules |
| `npm run test` | Executes backend Vitest unit & E2E test suite |
| `npm run prisma:generate` | Generates type-safe `@prisma/client` |
| `npm run prisma:migrate` | Runs database migrations |
| `npm run prisma:studio` | Launches web database viewer |

---

## 4. Code Quality & Linting Rules

- **ESLint**: Modern flat configuration (`backend/eslint.config.mjs`, `frontend/eslint.config.js`).
- **Prettier**: Consistent formatting with single quotes, semicolons, and trailing commas (`.prettierrc`).
- **No Hardcoded Secrets**: All URLs, ports, and credentials must resolve through `.env`.
