import React from 'react';
import {
  Server,
  Database,
  Cpu,
  Clock,
  RefreshCw,
  AlertCircle,
  Zap,
} from 'lucide-react';
import type { HealthResponse } from '../types/health';
import { StatusBadge } from './StatusBadge';

interface HealthCardProps {
  health: HealthResponse | null;
  latencyMs: number | null;
  loading: boolean;
  onRefresh: () => void;
  onTestError: () => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  health,
  latencyMs,
  loading,
  onRefresh,
  onTestError,
}) => {
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-300">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">System Health & Telemetry</h2>
              <code className="rounded border border-slate-700/70 bg-slate-950/60 px-2 py-0.5 font-mono text-xs text-cyan-300">
                GET /api/health
              </code>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated heartbeat telemetry validating NestJS runtime & Prisma PostgreSQL datasource
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTestError}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/40 transition-colors"
            title="Triggers /api/health/error-demo to test global exception filter"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Test Error Filter</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{loading ? 'Pinging...' : 'Refresh Health'}</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Service Status */}
        <div className="glass-inset rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Overall Service Status</span>
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between">
            <StatusBadge status={health ? health.status : 'error'} />
            <span className="text-xs text-slate-400 font-mono">
              {latencyMs !== null ? `${latencyMs}ms latency` : '—'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono truncate">
            {health?.service || 'Connecting to backend...'}
          </div>
        </div>

        {/* Database Status */}
        <div className="glass-inset rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Database (PostgreSQL / Prisma)</span>
            <Database className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between">
            <StatusBadge
              status={health?.database.status || 'disconnected'}
              label={
                health?.database.status === 'connected'
                  ? 'Connected'
                  : health?.database.status === 'unconfigured'
                    ? health.database.details?.includes('Simulated finance mode')
                      ? 'Demo Mode'
                      : 'Config Required'
                    : 'Configured (Standby)'
              }
            />
            <span className="text-xs font-mono text-slate-400">PostgreSQL</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono truncate">
            {health?.database.details || 'Prisma ORM schema prepared'}
          </div>
        </div>

        {/* Runtime Memory */}
        <div className="glass-inset rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Memory Footprint</span>
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-semibold text-white">
            {health ? `${health.memory.heapUsedMB} MB` : '—'}
            <span className="text-xs font-normal text-slate-400 ml-1">
              / {health ? `${health.memory.heapTotalMB} MB` : '—'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            RSS: {health ? `${health.memory.rssMB} MB` : '—'}
          </div>
        </div>

        {/* Uptime & Environment */}
        <div className="glass-inset rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Uptime & Environment</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-base font-semibold text-white font-mono">
            {health ? formatUptime(health.uptimeSeconds) : '00:00:00'}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>ENV: {health?.environment || 'development'}</span>
            <span>v{health?.version || '0.1.0'}</span>
          </div>
        </div>
      </div>

      {/* Raw Payload Preview Accordion */}
      {health && (
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Backend Response Payload:</span>
            <span>Timestamp: {health.timestamp}</span>
          </div>
          <pre className="glass-inset overflow-x-auto rounded-xl p-4 font-mono text-xs text-cyan-200">
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
