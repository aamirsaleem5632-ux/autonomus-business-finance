import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CircleAlert,
  Clock3,
  Coins,
  FileText,
  LoaderCircle,
  RefreshCw,
  Send,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { ApiClientError } from '../api/client';
import {
  askFinanceAssistant,
  getFinanceAgents,
  getFinanceOverview,
  runFinanceAgent,
} from '../api/finance';
import type {
  FinanceAgent,
  FinanceAgentActivity,
  FinanceAssistantResponse,
  FinanceInsight,
  FinanceOverview,
} from '../types/finance';

const money = (cents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);

function Panel({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/10">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-cyan-300">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function InsightCard({ item }: { item: FinanceInsight }) {
  const color =
    item.severity === 'critical'
      ? 'border-rose-500/30 bg-rose-950/20'
      : item.severity === 'warning'
        ? 'border-amber-500/30 bg-amber-950/20'
        : 'border-slate-800 bg-slate-950/40';
  return (
    <article className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-start gap-2">
        {item.severity === 'info' ? (
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
        ) : (
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-300">{item.summary}</p>
        </div>
      </div>
      <details className="mt-3 text-xs text-slate-400">
        <summary className="cursor-pointer text-cyan-300">Evidence and recommendation</summary>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {item.evidence.map((evidence) => (
            <li key={evidence}>{evidence}</li>
          ))}
        </ul>
        <p className="mt-2 text-slate-300">{item.recommendation}</p>
      </details>
    </article>
  );
}

export function FinanceDashboard() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [agents, setAgents] = useState<FinanceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState<FinanceAssistantResponse | null>(
    null,
  );
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<FinanceAgentActivity | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, directory] = await Promise.all([
        getFinanceOverview(apiKey || undefined),
        getFinanceAgents(apiKey || undefined),
      ]);
      setOverview(data);
      setAgents(directory);
      setNeedsApiKey(false);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      setError(message);
      setNeedsApiKey(reason instanceof ApiClientError && reason.statusCode === 403);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const maximumTrendValue = useMemo(
    () =>
      Math.max(
        1,
        ...(overview?.monthlyTrend.map((month) =>
          Math.max(month.revenueCents, month.expensesCents),
        ) ?? []),
      ),
    [overview],
  );

  async function submitAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assistantQuery.trim()) return;
    setAssistantBusy(true);
    setError(null);
    try {
      setAssistantResponse(
        await askFinanceAssistant(assistantQuery.trim(), apiKey || undefined),
      );
      setAssistantQuery('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setAssistantBusy(false);
    }
  }

  async function executeAgent(agentId: string) {
    setRunningAgent(agentId);
    setError(null);
    try {
      setLastRun(await runFinanceAgent(agentId, apiKey || undefined));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setRunningAgent(null);
    }
  }

  const metrics = overview?.metrics;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/30 px-3 py-1 text-xs text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {overview?.source === 'database'
                ? 'Connected financial records'
                : 'Simulated data — not connected to a financial institution'}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Finance command center
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              A transparent finance operations workspace. Specialist agents calculate from the
              figures below; every insight includes its evidence and recommendation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh figures
          </button>
        </div>
      </section>

      {error && (
        <section
          role="alert"
          className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200"
        >
          <div className="font-medium">Finance data could not be loaded</div>
          <p className="mt-1">{error}</p>
          {needsApiKey && (
            <label className="mt-3 block max-w-lg text-xs text-rose-100">
              Finance API key (kept in memory only)
              <span className="mt-1 flex gap-2">
                <input
                  type="password"
                  value={apiKeyDraft}
                  onChange={(event) => setApiKeyDraft(event.target.value)}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setApiKey(apiKeyDraft)}
                  className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950"
                >
                  Connect
                </button>
              </span>
            </label>
          )}
        </section>
      )}

      {loading && !overview ? (
        <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-400">
          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-400" />
          Loading financial data…
        </div>
      ) : overview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              title="Available cash"
              amount={metrics!.cashBalanceCents}
              icon={<Wallet className="h-4 w-4" />}
              accent="text-cyan-300"
            />
            <MetricCard
              title="Monthly revenue"
              amount={metrics!.revenueCents}
              icon={<ArrowUpRight className="h-4 w-4" />}
              accent="text-emerald-300"
            />
            <MetricCard
              title="Monthly expenses"
              amount={metrics!.expensesCents}
              icon={<ArrowDownRight className="h-4 w-4" />}
              accent="text-rose-300"
            />
            <MetricCard
              title="Net income"
              amount={metrics!.netIncomeCents}
              icon={<Coins className="h-4 w-4" />}
              accent="text-indigo-300"
            />
            <MetricCard
              title="Accounts receivable"
              amount={metrics!.receivablesCents}
              icon={<ArrowUpRight className="h-4 w-4" />}
              accent="text-teal-300"
            />
            <MetricCard
              title="Accounts payable"
              amount={metrics!.payablesCents}
              icon={<ArrowDownRight className="h-4 w-4" />}
              accent="text-amber-300"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <Panel
              title="Revenue and expense trend"
              description="Recorded or simulated monthly totals"
              icon={<Activity className="h-4 w-4" />}
            >
              <div className="space-y-4">
                {overview.monthlyTrend.map((month) => (
                  <div key={month.month} className="grid grid-cols-[5.5rem_1fr_5.5rem] items-center gap-3">
                    <span className="text-xs text-slate-400">{month.month}</span>
                    <div className="space-y-1.5">
                      <div
                        className="h-2 rounded-full bg-emerald-400/80"
                        style={{
                          width: `${Math.max(3, (month.revenueCents / maximumTrendValue) * 100)}%`,
                        }}
                        title={`Revenue ${money(month.revenueCents)}`}
                      />
                      <div
                        className="h-2 rounded-full bg-rose-400/70"
                        style={{
                          width: `${Math.max(3, (month.expensesCents / maximumTrendValue) * 100)}%`,
                        }}
                        title={`Expenses ${money(month.expensesCents)}`}
                      />
                    </div>
                    <span className="text-right text-xs font-medium text-slate-300">
                      {money(month.revenueCents - month.expensesCents)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-emerald-400" /> Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-rose-400" /> Expenses
                </span>
              </div>
            </Panel>

            <Panel
              title="Cash outlook"
              description="Trend-based estimate, not a guarantee"
              icon={<Wallet className="h-4 w-4" />}
            >
              <div className="space-y-3">
                {overview.forecast.map((point, index) => (
                  <div
                    key={point.month}
                    className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3"
                  >
                    <span className="text-sm text-slate-300">
                      {index === 0 ? 'Next month' : point.month}
                    </span>
                    <span
                      className={`text-sm font-semibold ${point.projectedCashCents < 0 ? 'text-rose-300' : 'text-white'}`}
                    >
                      {money(point.projectedCashCents)}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel
              title="Budget utilization"
              description="Actual allocated and spent amounts by department"
              icon={<Coins className="h-4 w-4" />}
            >
              <div className="space-y-4">
                {overview.budgets.map((budget) => {
                  const utilization = budget.allocatedCents
                    ? Math.round((budget.spentCents / budget.allocatedCents) * 100)
                    : 0;
                  return (
                    <div key={budget.id}>
                      <div className="mb-1.5 flex justify-between gap-3 text-xs">
                        <span className="font-medium text-slate-200">{budget.department}</span>
                        <span className="text-slate-400">
                          {money(budget.spentCents)} / {money(budget.allocatedCents)} · {utilization}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${utilization >= 100 ? 'bg-rose-400' : utilization >= 80 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel
              title="Agent insights"
              description="Calculated from the current financial snapshot"
              icon={<Sparkles className="h-4 w-4" />}
            >
              <div className="space-y-3">
                {overview.insights.map((item) => (
                  <InsightCard key={item.title} item={item} />
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <InvoicePanel title="Accounts receivable" records={overview.receivables} />
            <InvoicePanel title="Accounts payable" records={overview.payables} />
          </div>

          <Panel
            title="Recent transactions"
            description="Amounts are shown in USD; expenses are outflows"
            icon={<FileText className="h-4 w-4" />}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="text-slate-500">
                  <tr className="border-b border-slate-800">
                    <th className="pb-3 font-medium">Transaction</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-800/60 last:border-0">
                      <td className="py-3">
                        <div className="font-medium text-slate-200">{transaction.description}</div>
                        <div className="mt-0.5 text-slate-500">{transaction.counterparty}</div>
                      </td>
                      <td className="py-3 text-slate-400">{transaction.category}</td>
                      <td className="py-3 text-slate-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td
                        className={`py-3 text-right font-semibold ${transaction.type === 'income' ? 'text-emerald-300' : 'text-slate-200'}`}
                      >
                        {transaction.type === 'income' ? '+' : '−'}
                        {money(transaction.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Panel
              title="Finance assistant"
              description="Rules-based routing to computed specialist analyses; no external AI is configured."
              icon={<BrainCircuit className="h-4 w-4" />}
            >
              <form onSubmit={submitAssistant} className="flex gap-2">
                <input
                  value={assistantQuery}
                  onChange={(event) => setAssistantQuery(event.target.value)}
                  placeholder="Ask about cash flow, budgets, expenses, or performance…"
                  maxLength={1000}
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={assistantBusy || !assistantQuery.trim()}
                  aria-label="Ask finance assistant"
                  className="rounded-xl bg-cyan-500 px-3 text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
                >
                  {assistantBusy ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
              {assistantResponse && (
                <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-cyan-200">
                    <Bot className="h-4 w-4" />
                    Delegated to {assistantResponse.delegatedTo.join(', ')}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{assistantResponse.answer}</p>
                </div>
              )}
            </Panel>

            <Panel
              title="Specialist agents"
              description="Each run performs a defined calculation over the financial snapshot."
              icon={<Bot className="h-4 w-4" />}
            >
              <div className="space-y-2">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/50 p-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200">{agent.name}</div>
                      <div className="mt-1 text-[11px] leading-4 text-slate-500">
                        {agent.operation}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void executeAgent(agent.id)}
                      disabled={runningAgent !== null}
                      className="shrink-0 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200 disabled:opacity-40"
                    >
                      {runningAgent === agent.id ? 'Running…' : 'Run'}
                    </button>
                  </div>
                ))}
              </div>
              {lastRun && (
                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs">
                  <div className="font-medium text-emerald-200">
                    {lastRun.agentName} completed in {lastRun.durationMs} ms
                  </div>
                  <p className="mt-1 text-slate-300">{lastRun.insights[0]?.summary}</p>
                </div>
              )}
            </Panel>
          </div>

          <Panel
            title="Agent activity"
            description="Recent completed calculations and execution times"
            icon={<Clock3 className="h-4 w-4" />}
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {overview.activity.map((run) => (
                <div key={run.id} className="rounded-xl bg-slate-950/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-200">{run.agentName}</span>
                    <span
                      className={`text-[10px] ${run.status === 'failed' ? 'text-rose-300' : 'text-emerald-300'}`}
                    >
                      {run.status === 'failed' ? 'Failed' : 'Completed'}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {new Date(run.completedAt).toLocaleTimeString()} · {run.durationMs} ms
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                    {run.insights[0]?.summary}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({
  title,
  amount,
  icon,
  accent,
}: {
  title: string;
  amount: number;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{title}</span>
        <span className={accent}>{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{money(amount)}</div>
      <div className="mt-1 text-[11px] text-slate-500">USD</div>
    </div>
  );
}

function InvoicePanel({
  title,
  records,
}: {
  title: string;
  records: FinanceOverview['receivables'];
}) {
  return (
    <Panel title={title} icon={<FileText className="h-4 w-4" />}>
      <div className="space-y-2">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/50 p-3"
          >
            <div>
              <div className="text-xs font-medium text-slate-200">{record.counterparty}</div>
              <div className="mt-1 text-[11px] text-slate-500">
                Due {new Date(record.dueDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{money(record.amountCents)}</div>
              <div
                className={`mt-1 text-[10px] uppercase tracking-wide ${record.status === 'overdue' ? 'text-rose-300' : 'text-slate-500'}`}
              >
                {record.status}
              </div>
            </div>
          </div>
        ))}
        {!records.length && <p className="text-xs text-slate-500">No open records.</p>}
      </div>
    </Panel>
  );
}
