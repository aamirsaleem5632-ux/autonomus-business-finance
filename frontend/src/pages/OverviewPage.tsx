import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  FileText,
  History,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { EmptyState, money, Panel } from '../components/FinanceUI';
import type { AppRoute, DashboardPeriod } from '../components/Layout';
import type { FinanceOverview } from '../types/finance';

const preciseMoney = (cents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

const currencyAccounts = [
  {
    code: 'USD',
    amountCents: 28_540_000,
    change: { value: '+3.7% Revenue', positive: true },
  },
  {
    code: 'EUR',
    amountCents: 4_650_000,
    change: { value: '+2.1% Growth', positive: true },
  },
  {
    code: 'GBP',
    amountCents: 1_865_000,
    change: { value: '-1.4% Variance', positive: false },
  },
] as const;

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function Sparkline({
  values,
  color,
  label,
}: {
  values: number[];
  color: string;
  label: string;
}) {
  const points = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const minimum = Math.min(...points);
  const maximum = Math.max(...points);
  const span = Math.max(maximum - minimum, 1);
  const coordinates = points.map((value, index) => {
    const x = (index / (points.length - 1)) * 180;
    const y = 44 - ((value - minimum) / span) * 36;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 180 52" role="img" aria-label={label} className="h-12 w-full overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,52 ${coordinates.join(' ')} 180,52`} fill={`url(#spark-${color.replace('#', '')})`} />
      <polyline
        points={coordinates.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function TrendBadge({ positive, children }: { positive: boolean; children: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
        positive ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'
      }`}
    >
      {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {children}
    </span>
  );
}

function BalanceCard({
  currency,
  amountCents,
  detail,
  change,
  selected,
  onSelect,
}: {
  currency: (typeof currencyAccounts)[number]['code'];
  amountCents: number;
  detail: string;
  change: { value: string; positive: boolean };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`glass-panel balance-card min-w-0 rounded-xl p-3.5 text-left transition duration-300 hover:-translate-y-0.5 sm:p-4 ${
        selected ? 'border-emerald-400/40 shadow-[0_0_22px_rgba(16,185,129,0.08)]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[10px] font-medium text-slate-400">{currency} Balance</h2>
        <span
          className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          role="img"
          aria-label="Demo account status: active"
          title="Demo account status: active"
        />
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-lg font-semibold tracking-tight text-white tabular-nums">{formatCurrency(amountCents, currency)}</div>
          <div className="mt-1 text-[8px] text-slate-400">{detail}</div>
        </div>
        <TrendBadge positive={change.positive}>{change.value}</TrendBadge>
      </div>
    </button>
  );
}

function CashflowChart({
  overview,
  period,
}: {
  overview: FinanceOverview;
  period: DashboardPeriod;
}) {
  const trend = (() => {
    if (period === '12m') {
      return overview.monthlyTrend.slice(-12).map((month) => ({
        month: month.month,
        revenueCents: month.revenueCents,
        expensesCents: month.expensesCents,
      }));
    }

    const bucketDays = period === '90d' ? 7 : 1;
    const dayCount = period === 'week' ? 7 : period === '90d' ? 91 : 30;
    const bucketCount = Math.ceil(dayCount / bucketDays);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(today);
    start.setDate(today.getDate() - dayCount + 1);
    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index * bucketDays);
      return {
        month:
          period === '90d'
            ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenueCents: 0,
        expensesCents: 0,
      };
    });

    for (const transaction of overview.transactions) {
      const date = new Date(transaction.date);
      const transactionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const daysFromStart = Math.floor((transactionDay.getTime() - start.getTime()) / 86_400_000);
      if (daysFromStart < 0 || daysFromStart >= dayCount) continue;
      const bucket = buckets[Math.floor(daysFromStart / bucketDays)];
      if (transaction.type === 'income') bucket.revenueCents += transaction.amountCents;
      else bucket.expensesCents += transaction.amountCents;
    }

    return overview.transactions.length ? buckets : overview.monthlyTrend.slice(-6);
  })();
  const values = trend.flatMap((item) => [item.revenueCents, item.expensesCents]);
  const maximum = Math.max(1, ...values);
  const net = trend.reduce((sum, item) => sum + item.revenueCents - item.expensesCents, 0);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);

  const pointsFor = (key: 'revenueCents' | 'expensesCents') =>
    trend
      .map((item, index) => {
        const x = trend.length > 1 ? 28 + (index / (trend.length - 1)) * 544 : 300;
        const y = 176 - (item[key] / maximum) * 140;
        return `${x},${y}`;
      })
      .join(' ');

  const active = trend.find((item) => item.month === activeMonth);

  return (
    <Panel
      title="Cashflow"
      description="Income and outflows over time"
      action={
        <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[8px] text-slate-400">
          {period === 'week' ? 'This week' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : '12 months'}
          <ChevronDown className="h-2.5 w-2.5" />
        </span>
      }
      className="h-full"
    >
      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold tracking-tight text-white tabular-nums">
          {preciseMoney(net)}
        </div>
        {active && <div className="text-right text-[9px] text-slate-500">{active.month} · Net cashflow</div>}
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-7 pt-1">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="flex items-center gap-2">
              <span className="w-6 text-[7px] text-slate-600">{money((maximum * (3 - line)) / 3).replace('$', '')}</span>
              <span className="h-px flex-1 border-t border-dashed border-slate-700/40" />
            </div>
          ))}
        </div>
        {trend.length ? (
          <svg
            viewBox="0 0 600 220"
            role="img"
            aria-label="Cashflow trend showing revenue and expenses over the selected period"
            className="relative h-[12rem] w-full overflow-visible sm:h-[13rem]"
          >
            <defs>
              <linearGradient id="cashflow-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity=".2" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
              </linearGradient>
            </defs>
            {trend.length > 1 && (
              <>
                <polygon points={`28,188 ${pointsFor('revenueCents')} 572,188`} fill="url(#cashflow-fill)" />
                <polyline points={pointsFor('expensesCents')} fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </>
            )}
            <polyline points={pointsFor('revenueCents')} fill="none" stroke="#d4af37" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {trend.map((item, index) => {
              const x = trend.length > 1 ? 28 + (index / (trend.length - 1)) * 544 : 300;
              const y = 176 - (item.revenueCents / maximum) * 140;
              const showLabel =
                period === 'week' ||
                period === '12m' ||
                trend.length < 8 ||
                index % Math.ceil(trend.length / 6) === 0;
              return (
                <g key={item.month} onMouseEnter={() => setActiveMonth(item.month)} onMouseLeave={() => setActiveMonth(null)}>
                  <circle cx={x} cy={y} r={activeMonth === item.month ? 6 : 4} fill="#d4af37" stroke="#181818" strokeWidth="2" />
                  <circle cx={x} cy={y} r="14" fill="transparent" className="cursor-crosshair" />
                  <title>{`${item.month}: revenue ${preciseMoney(item.revenueCents)}, expenses ${preciseMoney(item.expensesCents)}`}</title>
                  {showLabel && (
                    <text x={x} y="210" textAnchor="middle" className="fill-slate-500 text-[9px]">
                      {item.month}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="relative pt-4"><EmptyState>No cashflow trend is available.</EmptyState></div>
        )}
      </div>
      <div className="mt-2 flex gap-4 text-[8px] text-slate-500">
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Income</span>
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Expenses</span>
      </div>
    </Panel>
  );
}

export function OverviewPage({
  overview,
  loading,
  period,
  onNavigate,
  onRefresh,
}: {
  overview: FinanceOverview | null;
  loading: boolean;
  period: DashboardPeriod;
  onNavigate: (route: AppRoute) => void;
  onRefresh: () => void;
}) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const trend = overview?.monthlyTrend ?? [];
  const recentTrend = trend.slice(-6);
  const incomeValues = recentTrend.map((month) => month.revenueCents);
  const expenseValues = recentTrend.map((month) => month.expensesCents);
  const income = overview?.metrics.revenueCents ?? 0;
  const expenses = overview?.metrics.expensesCents ?? 0;
  const latestTrend = trend.at(-1);
  const previousTrend = trend.at(-2);
  const latestNetIncome = latestTrend
    ? latestTrend.revenueCents - latestTrend.expensesCents
    : null;
  const previousNetIncome = previousTrend
    ? previousTrend.revenueCents - previousTrend.expensesCents
    : null;
  const monthlyStrengthDelta =
    latestNetIncome !== null &&
    previousNetIncome !== null &&
    previousNetIncome !== 0
      ? ((latestNetIncome - previousNetIncome) / Math.abs(previousNetIncome)) * 100
      : null;
  const cashflowVariance = monthlyStrengthDelta;
  const netIncomeValues = recentTrend.map(
    (month) => month.revenueCents - month.expensesCents,
  );
  const incomeDelta = latestTrend && previousTrend && previousTrend.revenueCents
    ? ((latestTrend.revenueCents - previousTrend.revenueCents) / previousTrend.revenueCents) * 100
    : null;
  const expenseDelta = latestTrend && previousTrend && previousTrend.expensesCents
    ? ((latestTrend.expensesCents - previousTrend.expensesCents) / previousTrend.expensesCents) * 100
    : null;
  if (!overview) {
    return (
      <div className="glass-panel flex min-h-56 flex-col items-center justify-center rounded-xl p-8 text-center">
        <p className="text-sm font-medium text-slate-300">
          {loading ? 'Loading your account overview…' : 'Account overview unavailable'}
        </p>
        {!loading && (
          <button type="button" onClick={onRefresh} className="mt-4 text-xs font-medium text-emerald-300 hover:text-emerald-200">
            Try again
          </button>
        )}
      </div>
    );
  }

  const selectedAccount = currencyAccounts.find(
    (account) => account.code === selectedCurrency,
  );

  return (
    <div className="space-y-3">
      <section className="grid gap-3 md:grid-cols-3">
        {currencyAccounts.map((account) => (
          <BalanceCard
            key={account.code}
            currency={account.code}
            amountCents={account.amountCents}
            detail="Treasury Sub-account · Demo data"
            selected={selectedCurrency === account.code}
            onSelect={() => setSelectedCurrency(account.code)}
            change={account.change}
          />
        ))}
      </section>

      <section><CashflowChart overview={overview} period={period} /></section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[0.8fr_0.8fr_1.2fr_1fr]">
        <Panel title="Expends" description="Monthly outgoing funds" className="overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xl font-semibold tracking-tight text-white tabular-nums">{money(expenses)}</div>
              <div className="mt-1">
                {expenseDelta !== null
                  ? <TrendBadge positive={expenseDelta <= 0}>{`${expenseDelta > 0 ? '+' : ''}${expenseDelta.toFixed(1)}%`}</TrendBadge>
                  : <span className="text-[8px] text-slate-600">Current period</span>}
              </div>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-400/[0.08] text-rose-300"><ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="mt-3"><Sparkline values={expenseValues} color="#f87171" label="Monthly expense trend" /></div>
        </Panel>

        <Panel title="Incomes" description="Monthly incoming funds" className="overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xl font-semibold tracking-tight text-emerald-300 [text-shadow:0_0_18px_rgba(16,185,129,0.15)] tabular-nums">{money(income)}</div>
              <div className="mt-1">
                {incomeDelta !== null
                  ? <TrendBadge positive={incomeDelta >= 0}>{`${incomeDelta > 0 ? '+' : ''}${incomeDelta.toFixed(1)}%`}</TrendBadge>
                  : <span className="text-[8px] text-slate-600">Current period</span>}
              </div>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-400/[0.08] text-emerald-300"><ArrowDownRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="mt-3"><Sparkline values={incomeValues} color="#d4af37" label="Monthly income trend" /></div>
        </Panel>

        <section className="available-card relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-xl border p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-emerald-400/[0.11] blur-[70px]" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                Available Balance · {selectedCurrency} <CircleHelp className="h-3 w-3 text-slate-600" />
              </div>
              <div className="mt-3 text-[1.65rem] font-semibold tracking-tight text-white [text-shadow:0_1px_14px_rgba(255,255,255,0.08)] tabular-nums">
                {selectedAccount
                  ? formatCurrency(selectedAccount.amountCents, selectedAccount.code)
                  : '—'}
              </div>
              <div className="mt-1 text-[8px] text-slate-500">Treasury Sub-account · Demo data</div>
            </div>
          </div>
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-[9px] font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
            >
              <Wallet className="h-3 w-3" /> Withdraw
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/transactions')}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-[9px] font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
            >
              <History className="h-3 w-3" /> History
            </button>
          </div>
        </section>

        <section className="glass-panel relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-emerald-400/[0.15] blur-[45px]" />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300/[0.08] shadow-[0_0_26px_rgba(212,175,55,0.2)]">
                <span className="absolute inset-1 rounded-full bg-gradient-to-br from-emerald-200 via-emerald-400 to-amber-800 shadow-[inset_0_0_10px_rgba(255,255,255,0.35),0_0_18px_rgba(212,175,55,0.55)]" />
                <span className="absolute left-[9px] top-[8px] h-2 w-2 rounded-full bg-white/70 blur-[2px]" />
                <Sparkles className="relative z-10 h-3.5 w-3.5 text-emerald-950" />
              </span>
              <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-emerald-200">AI Report Generation Hub</span>
            </div>
            <h2 className="mt-3 text-sm font-semibold leading-5 text-white">AI-generated report in few seconds</h2>
            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              Autonomous financial auditing, predictive variance analysis, and instant executive summaries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-2 text-[9px] font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            <FileText className="h-3 w-3" /> Create Now
          </button>
        </section>
      </section>

      <Panel
        title="Company Performance & Profitability"
        description="Monthly profitability and cashflow movement based on available finance data"
        icon={<TrendingUp className="h-4 w-4" />}
      >
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">
                  {monthlyStrengthDelta === null
                    ? 'Monthly performance overview'
                    : `Your company is financially ${monthlyStrengthDelta >= 0 ? 'stronger' : 'weaker'} this month`}
                </span>
                {monthlyStrengthDelta !== null && (
                  <TrendBadge positive={monthlyStrengthDelta >= 0}>
                    {`${monthlyStrengthDelta >= 0 ? '+' : ''}${monthlyStrengthDelta.toFixed(1)}%`}
                  </TrendBadge>
                )}
              </div>
              <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                {latestTrend && previousTrend
                  ? `${latestTrend.month} compared with ${previousTrend.month}, using net income as the profitability measure.`
                  : 'Add at least two monthly data points to calculate a month-over-month change.'}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="glass-inset rounded-lg p-3">
                <div className="text-[8px] text-slate-500">Latest monthly revenue</div>
                <div className="mt-1 text-sm font-semibold text-white tabular-nums">
                  {latestTrend ? money(latestTrend.revenueCents) : '—'}
                </div>
                {incomeDelta !== null && (
                  <div className="mt-1"><TrendBadge positive={incomeDelta >= 0}>{`${incomeDelta >= 0 ? '+' : ''}${incomeDelta.toFixed(1)}%`}</TrendBadge></div>
                )}
              </div>
              <div className="glass-inset rounded-lg p-3">
                <div className="text-[8px] text-slate-500">Latest net income</div>
                <div className={`mt-1 text-sm font-semibold tabular-nums ${latestNetIncome !== null && latestNetIncome >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {latestNetIncome !== null ? money(latestNetIncome) : '—'}
                </div>
                {monthlyStrengthDelta !== null && (
                  <div className="mt-1"><TrendBadge positive={monthlyStrengthDelta >= 0}>{`${monthlyStrengthDelta >= 0 ? '+' : ''}${monthlyStrengthDelta.toFixed(1)}%`}</TrendBadge></div>
                )}
              </div>
              <div className="glass-inset rounded-lg p-3">
                <div className="text-[8px] text-slate-500">Cashflow variance</div>
                <div className="mt-1 text-sm font-semibold text-white tabular-nums">
                  {cashflowVariance !== null ? `${cashflowVariance >= 0 ? '+' : ''}${cashflowVariance.toFixed(1)}%` : '—'}
                </div>
                <div className="mt-1">
                  {cashflowVariance !== null
                    ? <TrendBadge positive={cashflowVariance >= 0}>{cashflowVariance >= 0 ? 'Improving' : 'Declining'}</TrendBadge>
                    : <span className="text-[8px] text-slate-600">Insufficient comparison data</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="glass-inset flex min-h-40 flex-col justify-between rounded-lg p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[9px] font-medium text-slate-300">Monthly profitability trend</div>
                <div className="mt-1 text-[8px] text-slate-600">
                  {recentTrend.length ? `${recentTrend.length} latest months · revenue less expenses` : 'No monthly trend data'}
                </div>
              </div>
              {latestNetIncome !== null && (
                <div className={`text-xs font-semibold tabular-nums ${latestNetIncome >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {money(latestNetIncome)}
                </div>
              )}
            </div>
            {recentTrend.length > 0
              ? <div className="mt-4"><Sparkline values={netIncomeValues} color={latestNetIncome !== null && latestNetIncome < 0 ? '#fb7185' : '#d4af37'} label="Monthly net income trend" /></div>
              : <div className="mt-4"><EmptyState>No monthly profitability data is available.</EmptyState></div>}
            <div className="mt-3 flex items-center gap-2 text-[8px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Performance highlights reflect API data; no fixed growth rate is assumed.
            </div>
          </div>
        </div>
      </Panel>

      {withdrawOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setWithdrawOpen(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="withdraw-title" className="glass-panel w-full max-w-sm rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="withdraw-title" className="text-base font-semibold text-slate-100">Withdrawals unavailable</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">This platform is an analytics workspace and does not initiate payments or money transfers.</p>
              </div>
              <button type="button" onClick={() => setWithdrawOpen(false)} aria-label="Close withdrawal notice" className="rounded-md p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"><X className="h-4 w-4" /></button>
            </div>
            <button type="button" onClick={() => setWithdrawOpen(false)} className="mt-5 w-full rounded-md bg-emerald-400 py-2.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-300">Close</button>
          </section>
        </div>
      )}
      {reportOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReportOpen(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="report-title" className="glass-panel w-full max-w-lg rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider">Financial report preview</span>
                </div>
                <h2 id="report-title" className="mt-2 text-lg font-semibold text-white">Your finance snapshot</h2>
              </div>
              <button type="button" onClick={() => setReportOpen(false)} aria-label="Close report preview" className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-5 text-slate-400">
              Local preview based on the current finance data. No external AI service is configured.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="glass-inset rounded-lg p-3">
                <div className="text-[8px] text-slate-500">Cash balance</div>
                <div className="mt-1 text-sm font-semibold text-white">{preciseMoney(overview.metrics.cashBalanceCents)}</div>
              </div>
              <div className="glass-inset rounded-lg p-3">
                <div className="text-[8px] text-slate-500">Net income</div>
                <div className="mt-1 text-sm font-semibold text-emerald-300">{preciseMoney(overview.metrics.netIncomeCents)}</div>
              </div>
            </div>
            {overview.insights.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[10px] font-semibold text-slate-200">Available insights</h3>
                <ul className="mt-2 space-y-2">
                  {overview.insights.slice(0, 3).map((insight) => (
                    <li key={insight.title} className="glass-inset rounded-lg p-3">
                      <div className="text-[9px] font-medium text-slate-200">{insight.title}</div>
                      <p className="mt-1 text-[9px] leading-4 text-slate-500">{insight.summary}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setReportOpen(false)} className="rounded-md border border-white/10 px-3 py-2 text-[9px] font-medium text-slate-300 transition hover:bg-white/[0.05]">Close</button>
              <button
                type="button"
                onClick={() => {
                  setReportOpen(false);
                  onNavigate('/agents');
                }}
                className="rounded-md bg-emerald-400 px-3 py-2 text-[9px] font-semibold text-emerald-950 transition hover:bg-emerald-300"
              >
                Open agent hub
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
