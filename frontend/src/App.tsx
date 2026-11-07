import { useCallback, useEffect, useState } from 'react';
import { Activity, ChevronDown } from 'lucide-react';
import { FinanceDashboard } from './components/FinanceDashboard';
import { Navbar } from './components/Navbar';
import { HealthCard } from './components/HealthCard';
import { ArchitectureGrid } from './components/ArchitectureGrid';
import { ErrorBanner } from './components/ErrorBanner';
import { getBackendHealth, testErrorHandling } from './api/health';
import { ApiClientError } from './api/client';
import type { HealthResponse } from './types/health';

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | Error | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const { data, latencyMs: latency } = await getBackendHealth();
      setHealth(data);
      setLatencyMs(latency);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error(String(reason)));
      setHealth(null);
      setLatencyMs(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchHealth(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchHealth]);

  async function handleTestError() {
    try {
      await testErrorHandling();
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error(String(reason)));
    }
  }

  const status = loading && !health ? 'pending' : health?.status ?? 'error';

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar backendConnected={health !== null} status={status} />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <ErrorBanner error={error} onDismiss={() => setError(null)} />
        <FinanceDashboard />

        <details className="group rounded-2xl border border-slate-800 bg-slate-900/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium text-slate-300">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-300" />
              Infrastructure health and architecture
            </span>
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <div className="space-y-6 border-t border-slate-800 p-4 sm:p-6">
            <HealthCard
              health={health}
              latencyMs={latencyMs}
              loading={loading}
              onRefresh={() => void fetchHealth()}
              onTestError={() => void handleTestError()}
            />
            <ArchitectureGrid />
          </div>
        </details>
      </main>

      <footer className="border-t border-slate-900 py-5 text-center text-xs text-slate-500">
        Business Autonomous Finance · No payments or money transfers are initiated by this platform.
      </footer>
    </div>
  );
}

export default App;
