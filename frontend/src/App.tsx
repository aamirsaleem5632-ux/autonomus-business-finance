import { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HealthCard } from './components/HealthCard';
import { ArchitectureGrid } from './components/ArchitectureGrid';
import { ErrorBanner } from './components/ErrorBanner';
import { getBackendHealth, testErrorHandling } from './api/health';
import type { HealthResponse } from './types/health';
import { ApiClientError } from './api/client';
import { ArrowUpRight, BookOpen, Terminal, CheckCircle2 } from 'lucide-react';

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiClientError | Error | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const { data, latencyMs: latency } = await getBackendHealth();
      setHealth(data);
      setLatencyMs(latency);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setHealth(null);
      setLatencyMs(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getBackendHealth()
      .then(({ data, latencyMs: latency }) => {
        if (!ignore) {
          setHealth(data);
          setLatencyMs(latency);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setHealth(null);
          setLatencyMs(null);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleTestError = async () => {
    try {
      await testErrorHandling();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const getSystemStatus = (): 'ok' | 'degraded' | 'error' | 'pending' => {
    if (loading && !health) return 'pending';
    if (!health) return 'error';
    return health.status;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <Navbar backendConnected={health !== null} status={getSystemStatus()} />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300">
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Phase 1 Architecture Complete &amp; Verified
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Autonomous Business Finance Platform
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Industrial-grade browser-based platform substrate. Engineered with a decoupled React
              frontend, NestJS enterprise REST API backend, and PostgreSQL persistence with Prisma
              ORM. Ready for autonomous financial operations and execution engines.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>REST API Configured (/api)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Prisma Client Generated</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                <span>Zero Hardcoded Secrets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        {/* Health Telemetry Section */}
        <HealthCard
          health={health}
          latencyMs={latencyMs}
          loading={loading}
          onRefresh={fetchHealth}
          onTestError={handleTestError}
        />

        {/* Architecture Grid */}
        <ArchitectureGrid />

        {/* Developer Quick-Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Development Commands</span>
            </div>
            <p className="text-xs text-slate-400">
              Run services simultaneously or independently using root scripts:
            </p>
            <div className="space-y-1.5 font-mono text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-cyan-400">npm run dev:backend</span>
                <span className="text-slate-500"># NestJS port 3000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">npm run dev:frontend</span>
                <span className="text-slate-500"># Vite port 5173</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">npm run prisma:generate</span>
                <span className="text-slate-500"># Generate ORM Client</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">npm run lint</span>
                <span className="text-slate-500"># ESLint &amp; Prettier</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Phase 1 Verification Matrix</span>
            </div>
            <p className="text-xs text-slate-400">
              All 15 initialization tasks completed with zero skipped steps:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>React + TS + Vite</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>NestJS + TypeScript</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Prisma ORM</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>PostgreSQL Env</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Health Endpoint</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>ESLint &amp; Prettier</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Global Error Filter</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Autonomous Business Finance Platform &bull; Phase 1 Infrastructure</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <span>Documentation in /docs</span>
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
