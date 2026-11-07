import type { ReactNode } from 'react';

export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);

export function Panel({
  title,
  description,
  icon,
  action,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass-panel min-w-0 rounded-2xl p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/[0.15] bg-cyan-500/[0.07] text-cyan-300">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="panel-title text-sm font-semibold text-slate-100">{title}</h2>
            {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = 'cyan',
}: {
  label: string;
  value: string;
  detail?: string;
  icon: ReactNode;
  tone?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose';
}) {
  const tones = {
    cyan: 'text-cyan-300 bg-cyan-500/[0.09] border-cyan-500/[0.16]',
    emerald: 'text-emerald-300 bg-emerald-500/[0.09] border-emerald-500/[0.16]',
    violet: 'text-violet-200 bg-violet-300/[0.08] border-violet-200/[0.1]',
    amber: 'text-amber-200 bg-amber-300/[0.08] border-amber-200/[0.1]',
    rose: 'text-rose-200 bg-rose-300/[0.08] border-rose-200/[0.1]',
  };
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <div
        className={`mt-4 truncate text-[1.65rem] font-semibold tabular-nums tracking-[-0.045em] sm:text-[1.85rem] ${
          tone === 'emerald'
            ? 'text-emerald-300 [text-shadow:0_0_22px_rgba(212,175,55,0.16)]'
            : 'text-slate-50'
        }`}
      >
        {value}
      </div>
      {detail && <div className="mt-1.5 text-[11px] text-slate-500">{detail}</div>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="glass-inset rounded-xl border-dashed px-4 py-8 text-center text-xs text-slate-400">
      {children}
    </div>
  );
}
