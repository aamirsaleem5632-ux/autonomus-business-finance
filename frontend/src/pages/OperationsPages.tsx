import { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  Check,
  CircleAlert,
  CreditCard,
  FileText,
  Landmark,
  LockKeyhole,
  Printer,
  Shield,
  TrendingDown,
  TrendingUp,
  UnlockKeyhole,
  Vault,
} from 'lucide-react';
import { EmptyState, MetricCard, money, Panel } from '../components/FinanceUI';
import type { FinanceAgentActivity, FinanceOverview } from '../types/finance';

function IntegrationNotice({ children }: { children: string }) {
  return (
    <div className="glass-inset flex items-start gap-3 rounded-xl border-amber-300/10 p-4">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
      <p className="text-[11px] leading-5 text-slate-400">{children}</p>
    </div>
  );
}

export function PaymentsPage() {
  return (
    <div className="space-y-5">
      <IntegrationNotice>
        Payment execution is not connected. The items below report integration availability only; this workspace does not initiate transfers or payouts.
      </IntegrationNotice>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Payment gateways" description="Gateway connection and settlement configuration" icon={<Shield className="h-4 w-4" />}>
          <div className="space-y-2">
            {['Gateway connection', 'Settlement account', 'Webhook status'].map((item) => (
              <div key={item} className="glass-inset flex items-center justify-between gap-3 rounded-lg p-3">
                <span className="text-xs text-slate-300">{item}</span>
                <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2 py-1 text-[9px] font-medium text-amber-200">Not connected</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Bank transfers" description="Transfer instructions and settlement tracking" icon={<Landmark className="h-4 w-4" />}>
          <EmptyState>No bank transfer provider is connected, so transfer and settlement records are unavailable.</EmptyState>
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Payout schedules" description="Scheduled disbursements and next settlement windows" icon={<Banknote className="h-4 w-4" />}>
          <EmptyState>Payout schedules will appear when a payment gateway integration is configured.</EmptyState>
        </Panel>
        <Panel title="Settlement statuses" description="Reconciliation state for completed gateway payments" icon={<Check className="h-4 w-4" />}>
          <EmptyState>Settlement status data is unavailable because no payment processor is connected.</EmptyState>
        </Panel>
      </div>
    </div>
  );
}

interface DemoCard {
  id: string;
  kind: 'Virtual' | 'Physical';
  holder: string;
  suffix: string;
  limit: number;
  frozen: boolean;
}

const initialDemoCards: DemoCard[] = [
  { id: 'virtual-demo', kind: 'Virtual', holder: 'Demo cardholder', suffix: '•• 4821', limit: 2500, frozen: false },
  { id: 'physical-demo', kind: 'Physical', holder: 'Demo cardholder', suffix: '•• 9014', limit: 5000, frozen: false },
];

export function CardsPage() {
  const [cards, setCards] = useState(initialDemoCards);

  function updateCard(id: string, update: Partial<DemoCard>) {
    setCards((current) => current.map((card) => card.id === id ? { ...card, ...update } : card));
  }

  return (
    <div className="space-y-5">
      <IntegrationNotice>
        These sample cards and controls are local UI demonstrations only. No issuer or card network is connected; changes do not affect real cards or transactions.
      </IntegrationNotice>
      <div className="grid gap-4 xl:grid-cols-2">
        {cards.map((card) => (
          <Panel
            key={card.id}
            title={`${card.kind} corporate card`}
            description={`${card.holder} · ${card.suffix}`}
            icon={<CreditCard className="h-4 w-4" />}
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block">
                <span className="text-[10px] font-medium text-slate-400">Monthly spend limit (demo USD)</span>
                <span className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-950/40 px-3">
                  <span className="text-xs text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={card.limit}
                    onChange={(event) => updateCard(card.id, { limit: Math.max(0, Number(event.target.value)) })}
                    aria-label={`${card.kind} card demo monthly spend limit`}
                    className="w-full bg-transparent py-2.5 text-xs text-slate-200 outline-none"
                  />
                </span>
              </label>
              <button
                type="button"
                aria-pressed={card.frozen}
                onClick={() => updateCard(card.id, { frozen: !card.frozen })}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[10px] font-medium transition ${
                  card.frozen
                    ? 'border-amber-300/20 bg-amber-300/[0.08] text-amber-200 hover:bg-amber-300/[0.12]'
                    : 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200 hover:bg-emerald-300/[0.12]'
                }`}
              >
                {card.frozen ? <UnlockKeyhole className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                {card.frozen ? 'Unfreeze demo card' : 'Freeze demo card'}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[9px] text-slate-500">
              <span>Demo card status</span>
              <span className={card.frozen ? 'text-amber-200' : 'text-emerald-200'}>{card.frozen ? 'Frozen locally' : 'Active locally'}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

export function VaultsPage() {
  return (
    <div className="space-y-5">
      <IntegrationNotice>
        Treasury and custody data is not connected. Balances, currency holdings, and lock states are therefore not available in this workspace.
      </IntegrationNotice>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Treasury sub-accounts" description="Operating and treasury account structure" icon={<Vault className="h-4 w-4" />}>
          <EmptyState>No treasury sub-accounts are connected.</EmptyState>
        </Panel>
        <Panel title="Reserve funds" description="Liquidity reserved for future obligations" icon={<Banknote className="h-4 w-4" />}>
          <EmptyState>Reserve balances are unavailable until a treasury source is connected.</EmptyState>
        </Panel>
        <Panel title="Multi-currency vaults" description="Currency holdings and liquidity locks" icon={<LockKeyhole className="h-4 w-4" />}>
          <div className="space-y-2">
            {['USD', 'EUR', 'GBP'].map((currency) => (
              <div key={currency} className="glass-inset flex items-center justify-between rounded-lg p-3">
                <span className="text-xs font-medium text-slate-300">{currency} holding</span>
                <span className="text-right text-[9px] leading-4 text-slate-500">Holding and lock unavailable</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function CapitalPage() {
  return (
    <div className="space-y-5">
      <IntegrationNotice>
        No lender, debt servicing, or capital allocation system is connected. Credit availability and obligations are not inferred from cashflow or budgets.
      </IntegrationNotice>
      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Business lines of credit" description="Facility limits and available credit" icon={<BriefcaseBusiness className="h-4 w-4" />}>
          <div className="text-sm font-semibold text-slate-300">Unavailable</div>
          <p className="mt-2 text-[10px] leading-4 text-slate-500">Connect a lender integration to view credit facilities.</p>
        </Panel>
        <Panel title="Debt financing" description="Balances, rates, and repayment schedule" icon={<Banknote className="h-4 w-4" />}>
          <div className="text-sm font-semibold text-slate-300">Unavailable</div>
          <p className="mt-2 text-[10px] leading-4 text-slate-500">No debt records are provided to this application.</p>
        </Panel>
        <Panel title="Capital allocation" description="Investment approvals and committed funds" icon={<ArrowUpRight className="h-4 w-4" />}>
          <EmptyState>No capital allocation records are connected.</EmptyState>
        </Panel>
      </div>
    </div>
  );
}

export function ReportsPage({ overview }: { overview: FinanceOverview | null }) {
  return (
    <div className="space-y-5">
      <Panel
        title="Executive financial summary"
        description="A printable snapshot of the current finance overview"
        icon={<FileText className="h-4 w-4" />}
        action={
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!overview}
            className="print-hidden inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-2 text-[10px] font-medium text-emerald-200 transition hover:bg-emerald-300/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer className="h-3.5 w-3.5" /> Print / Save PDF
          </button>
        }
      >
        {overview ? (
          <>
            <p className="mb-4 text-[10px] text-slate-500">Choose “Save as PDF” in the browser print dialog to download this summary.</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Cash balance" value={money(overview.metrics.cashBalanceCents)} detail="Finance overview" icon={<Banknote className="h-4 w-4" />} tone="emerald" />
              <MetricCard label="Revenue" value={money(overview.metrics.revenueCents)} detail="Reported total" icon={<ArrowUpRight className="h-4 w-4" />} tone="cyan" />
              <MetricCard label="Expenses" value={money(overview.metrics.expensesCents)} detail="Reported total" icon={<ArrowDownRight className="h-4 w-4" />} tone="rose" />
              <MetricCard label="Net income" value={money(overview.metrics.netIncomeCents)} detail={`As of ${new Date(overview.asOf).toLocaleDateString()}`} icon={<Check className="h-4 w-4" />} tone="violet" />
            </div>
            <div className="mt-4 glass-inset rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-200">Executive summary</h3>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                The finance overview reports {money(overview.metrics.revenueCents)} in revenue,
                {' '}{money(overview.metrics.expensesCents)} in expenses, and {money(overview.metrics.netIncomeCents)} in net income.
                {' '}Source: {overview.source}.
              </p>
            </div>
          </>
        ) : <EmptyState>Executive summary data is unavailable.</EmptyState>}
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Tax audit materials" description="Tax returns and supporting schedules" icon={<FileText className="h-4 w-4" />}>
          <EmptyState>Tax data and audit documents are not connected.</EmptyState>
        </Panel>
        <Panel title="Generated financial statements" description="Statement of income and balance sheet exports" icon={<Activity className="h-4 w-4" />}>
          <EmptyState>No formal statement-generation integration is configured. The executive snapshot above can be printed as a PDF.</EmptyState>
        </Panel>
      </div>
    </div>
  );
}

type AnalyticsSeries = 'revenue' | 'expenses' | 'net';

export function AnalyticsPage({ overview }: { overview: FinanceOverview | null }) {
  const [series, setSeries] = useState<AnalyticsSeries>('net');
  const [monthsToShow, setMonthsToShow] = useState<3 | 6 | 12>(6);
  if (!overview) return <EmptyState>Analytics data is unavailable.</EmptyState>;

  const trend = overview.monthlyTrend.slice(-monthsToShow);
  const valueFor = (item: FinanceOverview['monthlyTrend'][number]) =>
    series === 'revenue' ? item.revenueCents : series === 'expenses' ? item.expensesCents : item.revenueCents - item.expensesCents;
  const values = trend.map(valueFor);
  const maxMagnitude = Math.max(1, ...values.map((value) => Math.abs(value)));
  const selectedLabel = series === 'revenue' ? 'Revenue' : series === 'expenses' ? 'Expenses' : 'Net cashflow';
  const latest = trend.at(-1);
  const previous = trend.at(-2);
  const forecastEnd = overview.forecast.at(-1);
  const variance = latest && previous && valueFor(previous) !== 0
    ? ((valueFor(latest) - valueFor(previous)) / Math.abs(valueFor(previous))) * 100
    : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Cash forecast horizon" value={`${overview.forecast.length} months`} detail="Forecast records available" icon={<Activity className="h-4 w-4" />} tone="cyan" />
        <MetricCard label="Forecast endpoint" value={forecastEnd ? money(forecastEnd.projectedCashCents) : '—'} detail={forecastEnd?.month ?? 'No forecast data'} icon={<TrendingUp className="h-4 w-4" />} tone="emerald" />
        <MetricCard label="Latest variance" value={variance === null ? '—' : `${variance >= 0 ? '+' : ''}${variance.toFixed(1)}%`} detail={`${selectedLabel} · month over month`} icon={variance !== null && variance < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />} tone={variance !== null && variance < 0 ? 'rose' : 'violet'} />
      </div>
      <Panel
        title="Interactive trend analysis"
        description={`${selectedLabel} across the selected monthly window`}
        icon={<Activity className="h-4 w-4" />}
        action={
          <label className="flex items-center gap-2 text-[9px] text-slate-500">
            Window
            <select
              aria-label="Select analytics time window"
              value={monthsToShow}
              onChange={(event) => setMonthsToShow(Number(event.target.value) as 3 | 6 | 12)}
              className="rounded-lg border border-white/[0.08] bg-slate-950/60 px-2 py-1.5 text-[9px] text-slate-300"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </label>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Select trend series">
          {([
            ['revenue', 'Revenue'],
            ['expenses', 'Expenses'],
            ['net', 'Net cashflow'],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={series === value} onClick={() => setSeries(value)} className={`rounded-lg border px-3 py-1.5 text-[9px] font-medium transition ${series === value ? 'border-emerald-300/30 bg-emerald-300/[0.1] text-emerald-200' : 'border-white/[0.07] text-slate-500 hover:text-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>
        {trend.length ? (
          <div className="grid min-h-44 grid-cols-2 items-end gap-3 sm:grid-cols-4 xl:grid-cols-6">
            {trend.map((item) => {
              const value = valueFor(item);
              const height = Math.max(4, Math.abs(value) / maxMagnitude * 100);
              return (
                <div key={item.month} className="flex h-40 min-w-0 flex-col justify-end">
                  <div className="mb-2 truncate text-center text-[8px] text-slate-400">{money(value)}</div>
                  <div className="flex h-28 items-end justify-center border-b border-white/[0.07]">
                    <div className={`w-8 rounded-t-md ${series === 'expenses' ? 'bg-rose-300/80' : value < 0 ? 'bg-rose-300/80' : 'bg-emerald-300/80'}`} style={{ height: `${height}%` }} title={`${item.month}: ${money(value)}`} />
                  </div>
                  <div className="mt-2 truncate text-center text-[8px] text-slate-500">{item.month}</div>
                </div>
              );
            })}
          </div>
        ) : <EmptyState>No monthly trend data is available.</EmptyState>}
      </Panel>
      <Panel title="Predictive cash-flow forecast" description="Projected cash values supplied by the finance data source" icon={<TrendingUp className="h-4 w-4" />}>
        {overview.forecast.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-xs">
              <thead className="text-[9px] uppercase tracking-wider text-slate-600">
                <tr className="border-b border-white/[0.06]"><th className="pb-3 font-medium">Period</th><th className="pb-3 font-medium">Forecast basis</th><th className="pb-3 text-right font-medium">Projected cash</th></tr>
              </thead>
              <tbody>
                {overview.forecast.map((item) => (
                  <tr key={item.month} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-3 text-slate-300">{item.month}</td>
                    <td className="py-3 text-slate-500">Finance forecast</td>
                    <td className="py-3 text-right font-semibold text-slate-200">{money(item.projectedCashCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>No cash-flow forecast data is available.</EmptyState>}
      </Panel>
    </div>
  );
}

export function ActivityPage({ activity }: { activity: FinanceAgentActivity[] }) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');
  const visible = activity.filter((event) => filter === 'all' || event.status === filter);
  return (
    <div className="space-y-5">
      <Panel
        title="System audit events"
        description="Application and administrative change records"
        icon={<Activity className="h-4 w-4" />}
      >
        <IntegrationNotice>System audit event data is not exposed by the connected backend.</IntegrationNotice>
      </Panel>
      <Panel
        title="User authentication audit"
        description="Login and account access events"
        icon={<Shield className="h-4 w-4" />}
      >
        <IntegrationNotice>User login audit data is not exposed by the connected backend.</IntegrationNotice>
      </Panel>
      <Panel
        title="Autonomous agent action trail"
        description="Recorded specialist execution events"
        icon={<Activity className="h-4 w-4" />}
        action={
          <select
            aria-label="Filter agent audit events"
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            className="rounded-lg border border-white/[0.08] bg-slate-950/60 px-2 py-1.5 text-[9px] text-slate-300"
          >
            <option value="all">All events</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        }
      >
        {visible.length ? (
          <ol className="space-y-2">
            {visible.map((event) => (
              <li key={event.id} className="glass-inset rounded-lg p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {event.status === 'completed' ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <CircleAlert className="h-3.5 w-3.5 text-rose-300" />}
                    <span className="text-[10px] font-medium text-slate-200">{event.agentName}</span>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[8px] uppercase ${event.status === 'completed' ? 'bg-emerald-300/[0.08] text-emerald-200' : 'bg-rose-300/[0.08] text-rose-200'}`}>{event.status}</span>
                </div>
                <div className="mt-2 text-[9px] text-slate-500">{new Date(event.completedAt).toLocaleString()} · {event.durationMs} ms</div>
                {event.insights[0] && <p className="mt-2 text-[10px] leading-4 text-slate-400">{event.insights[0].summary}</p>}
              </li>
            ))}
          </ol>
        ) : <EmptyState>No matching agent audit events are available.</EmptyState>}
      </Panel>
    </div>
  );
}
