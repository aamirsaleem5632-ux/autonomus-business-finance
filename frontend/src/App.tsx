import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { askFinanceAssistant, getFinanceAgents, getFinanceOverview, runFinanceAgent } from './api/finance';
import { ApiClientError } from './api/client';
import { testErrorHandling, getBackendHealth } from './api/health';
import { Layout, type AppRoute, type DashboardPeriod } from './components/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AgentsPage } from './pages/AgentsPage';
import { SystemPage } from './pages/SystemPage';
import {
  ActivityPage,
  AnalyticsPage,
  CapitalPage,
  CardsPage,
  PaymentsPage,
  ReportsPage,
  VaultsPage,
} from './pages/OperationsPages';
import type {
  FinanceAgent,
  FinanceAgentActivity,
  FinanceAssistantResponse,
  FinanceOverview,
} from './types/finance';
import type { HealthResponse } from './types/health';

function routeFromPath(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/invoices') return '/transactions';
  if (path === '/budgets') return '/analytics';
  if (
    path === '/transactions' ||
    path === '/payments' ||
    path === '/cards' ||
    path === '/vaults' ||
    path === '/capital' ||
    path === '/reports' ||
    path === '/analytics' ||
    path === '/activity' ||
    path === '/agents' ||
    path === '/system'
  ) {
    return path;
  }
  return '/';
}

export function App() {
  const [route, setRoute] = useState<AppRoute>(() => routeFromPath(window.location.pathname));
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<Error | null>(null);
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [agents, setAgents] = useState<FinanceAgent[]>([]);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [financeError, setFinanceError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<FinanceAgentActivity | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<FinanceAssistantResponse | null>(null);
  const [assistantBusy, setAssistantBusy] = useState(false);

  const refreshHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const result = await getBackendHealth();
      setHealth(result.data);
      setHealthLatency(result.latencyMs);
      setHealthError(null);
    } catch (reason) {
      setHealth(null);
      setHealthLatency(null);
      setHealthError(reason instanceof Error ? reason : new Error(String(reason)));
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const refreshFinance = useCallback(async () => {
    setFinanceLoading(true);
    setFinanceError(null);
    try {
      const [data, directory] = await Promise.all([
        getFinanceOverview(apiKey || undefined),
        getFinanceAgents(apiKey || undefined),
      ]);
      setOverview(data);
      setAgents(directory);
      setNeedsApiKey(false);
    } catch (reason) {
      setFinanceError(reason instanceof Error ? reason.message : String(reason));
      setNeedsApiKey(reason instanceof ApiClientError && reason.statusCode === 403);
      setOverview(null);
    } finally {
      setFinanceLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshHealth();
      void refreshFinance();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshHealth, refreshFinance]);

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = routeFromPath(window.location.pathname);
      if (window.location.pathname !== nextRoute) {
        window.history.replaceState({}, '', nextRoute);
      }
      setRoute(nextRoute);
    };
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextRoute: AppRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute);
    }
    setRoute(nextRoute);
  }, []);

  function exportTransactions() {
    if (!overview?.transactions.length) {
      setFinanceError('There are no transactions available to export.');
      return;
    }

    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ['Date', 'Description', 'Counterparty', 'Type', 'Category', 'Amount USD'],
      ...overview.transactions.map((transaction) => [
        transaction.date,
        transaction.description,
        transaction.counterparty,
        transaction.type,
        transaction.category,
        (transaction.amountCents / 100).toFixed(2),
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'finance-transactions.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function executeAgent(agentId: string) {
    setRunningAgent(agentId);
    setFinanceError(null);
    try {
      setLastRun(await runFinanceAgent(agentId, apiKey || undefined));
    } catch (reason) {
      setFinanceError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setRunningAgent(null);
    }
  }

  async function submitAssistant(query: string) {
    if (!query.trim()) return;
    setAssistantBusy(true);
    setFinanceError(null);
    try {
      setAssistantResponse(await askFinanceAssistant(query.trim(), apiKey || undefined));
    } catch (reason) {
      setFinanceError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setAssistantBusy(false);
    }
  }

  async function handleTestError() {
    try {
      await testErrorHandling();
    } catch (reason) {
      setHealthError(reason instanceof Error ? reason : new Error(String(reason)));
    }
  }

  const auditActivity = lastRun
    ? [lastRun, ...(overview?.activity ?? []).filter((event) => event.id !== lastRun.id)]
    : overview?.activity ?? [];

  const routeContent: Record<AppRoute, ReactNode> = {
    '/': (
      <OverviewPage
        overview={overview}
        loading={financeLoading}
        period={period}
        onNavigate={navigate}
        onRefresh={() => void refreshFinance()}
      />
    ),
    '/transactions': <TransactionsPage overview={overview} loading={financeLoading} />,
    '/payments': <PaymentsPage />,
    '/cards': <CardsPage />,
    '/vaults': <VaultsPage />,
    '/capital': <CapitalPage />,
    '/reports': <ReportsPage overview={overview} />,
    '/analytics': <AnalyticsPage overview={overview} />,
    '/activity': <ActivityPage activity={auditActivity} />,
    '/agents': (
      <AgentsPage
        agents={agents}
        loading={financeLoading}
        runningAgent={runningAgent}
        lastRun={lastRun}
        assistantResponse={assistantResponse}
        assistantBusy={assistantBusy}
        onRunAgent={(id) => void executeAgent(id)}
        onAskAssistant={(query) => void submitAssistant(query)}
      />
    ),
    '/system': (
      <SystemPage
        health={health}
        latencyMs={healthLatency}
        loading={healthLoading}
        error={healthError}
        onDismissError={() => setHealthError(null)}
        onRefresh={() => void refreshHealth()}
        onTestError={() => void handleTestError()}
      />
    ),
  };

  return (
    <Layout
      route={route}
      onNavigate={navigate}
      backendConnected={health !== null}
      backendStatus={healthLoading && !health ? 'pending' : health?.status ?? 'error'}
      period={period}
      onPeriodChange={setPeriod}
      onExport={exportTransactions}
    >
      {financeError && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-200"
        >
          <div className="font-semibold">Financial data could not be loaded</div>
          <p className="mt-1 text-rose-200/75">{financeError}</p>
          {needsApiKey && (
            <label className="mt-4 block max-w-lg text-xs text-rose-100">
              Finance API key <span className="text-rose-200/60">(kept in memory only)</span>
              <span className="mt-2 flex gap-2">
                <input
                  type="password"
                  value={apiKeyDraft}
                  onChange={(event) => setApiKeyDraft(event.target.value)}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                />
                <button
                  type="button"
                  onClick={() => setApiKey(apiKeyDraft)}
                  className="rounded-xl bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Connect
                </button>
              </span>
            </label>
          )}
        </div>
      )}
      {routeContent[route]}
    </Layout>
  );
}

export default App;
