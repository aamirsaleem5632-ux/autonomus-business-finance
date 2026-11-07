import { Activity, Server, ShieldCheck } from 'lucide-react';
import { ArchitectureGrid } from '../components/ArchitectureGrid';
import { ErrorBanner } from '../components/ErrorBanner';
import { HealthCard } from '../components/HealthCard';
import { Panel } from '../components/FinanceUI';
import type { HealthResponse } from '../types/health';

export function SystemPage({
  health,
  latencyMs,
  loading,
  error,
  onDismissError,
  onRefresh,
  onTestError,
}: {
  health: HealthResponse | null;
  latencyMs: number | null;
  loading: boolean;
  error: Error | null;
  onDismissError: () => void;
  onRefresh: () => void;
  onTestError: () => void;
}) {
  return (
    <div className="space-y-6">
      {error && <ErrorBanner error={error} onDismiss={onDismissError} />}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="glass-panel flex items-center gap-3 rounded-2xl p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200/10 bg-cyan-200/[0.05] text-cyan-200"><Server className="h-4 w-4" /></span>
          <div><div className="text-[10px] text-slate-500">Backend service</div><div className="mt-1 text-xs font-medium text-slate-200">{health?.service ?? 'Awaiting connection'}</div></div>
        </div>
        <div className="glass-panel flex items-center gap-3 rounded-2xl p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200/10 bg-indigo-200/[0.05] text-indigo-200"><Activity className="h-4 w-4" /></span>
          <div><div className="text-[10px] text-slate-500">API response</div><div className="mt-1 text-xs font-medium text-slate-200">{latencyMs === null ? '—' : `${latencyMs} ms`}</div></div>
        </div>
        <div className="glass-panel flex items-center gap-3 rounded-2xl p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/10 bg-emerald-200/[0.05] text-emerald-200"><ShieldCheck className="h-4 w-4" /></span>
          <div><div className="text-[10px] text-slate-500">Runtime environment</div><div className="mt-1 text-xs font-medium capitalize text-slate-200">{health?.environment ?? '—'}</div></div>
        </div>
      </section>

      <HealthCard
        health={health}
        latencyMs={latencyMs}
        loading={loading}
        onRefresh={onRefresh}
        onTestError={onTestError}
      />

      <Panel title="Platform architecture" description="Services and infrastructure components powering finance operations" icon={<ShieldCheck className="h-4 w-4" />}>
        <ArchitectureGrid />
      </Panel>
    </div>
  );
}
