import { useState, type FormEvent } from 'react';
import {
  Bot,
  BrainCircuit,
  Check,
  LoaderCircle,
  Send,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { EmptyState, Panel } from '../components/FinanceUI';
import type {
  FinanceAgent,
  FinanceAgentActivity,
  FinanceAssistantResponse,
} from '../types/finance';

export function AgentsPage({
  agents,
  loading,
  runningAgent,
  lastRun,
  assistantResponse,
  assistantBusy,
  onRunAgent,
  onAskAssistant,
}: {
  agents: FinanceAgent[];
  loading: boolean;
  runningAgent: string | null;
  lastRun: FinanceAgentActivity | null;
  assistantResponse: FinanceAssistantResponse | null;
  assistantBusy: boolean;
  onRunAgent: (id: string) => void;
  onAskAssistant: (query: string) => void;
}) {
  const [query, setQuery] = useState('');

  function submitAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() || assistantBusy) return;
    onAskAssistant(query);
    setQuery('');
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-violet-300/[0.07] blur-[70px]" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-200/10 bg-violet-200/[0.06] text-violet-200">
            <WandSparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-white">Financial intelligence, on demand</h2>
              <span className="rounded-full border border-cyan-200/10 bg-cyan-200/[0.04] px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-cyan-100">Rules-based analysis</span>
            </div>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">
              Each specialist runs a defined calculation over your financial snapshot. Review the evidence and recommendation before acting.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Specialist directory" description={`${agents.length} analytical agents available`} icon={<Bot className="h-4 w-4" />}>
          <div className="space-y-2.5">
            {agents.map((agent) => (
              <div key={agent.id} className="glass-inset flex items-center justify-between gap-4 rounded-xl p-4 transition duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/[0.025]">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-200/[0.08] bg-cyan-200/[0.04] text-cyan-200"><Sparkles className="h-3.5 w-3.5" /></span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200">{agent.name}</div>
                    <div className="mt-1 text-[11px] leading-5 text-slate-500">{agent.operation}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRunAgent(agent.id)}
                  disabled={runningAgent !== null || loading}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-2 text-[10px] font-medium text-slate-300 transition hover:border-cyan-200/20 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {runningAgent === agent.id ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  {runningAgent === agent.id ? 'Running' : 'Run analysis'}
                </button>
              </div>
            ))}
            {!agents.length && <EmptyState>{loading ? 'Loading specialist agents…' : 'No specialist agents are available.'}</EmptyState>}
          </div>
          {lastRun && (
            <div className="glass-inset mt-4 rounded-xl border-emerald-500/20 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100"><Check className="h-3.5 w-3.5" />Analysis completed</div>
              <p className="mt-2 text-[10px] leading-5 text-slate-400">The detailed execution record is available in the Activity audit trail.</p>
            </div>
          )}
        </Panel>

        <Panel
          title="Finance assistant"
          description="Ask about cash flow, budgets, expenses, or performance"
          icon={<BrainCircuit className="h-4 w-4" />}
        >
          <form onSubmit={submitAssistant}>
            <label htmlFor="finance-question" className="sr-only">Ask a finance question</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-slate-950/60 p-1.5 pl-3 focus-within:border-cyan-200/25">
              <input
                id="finance-question"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask a financial question…"
                maxLength={1000}
                className="min-w-0 flex-1 bg-transparent py-2 text-xs text-white outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!query.trim() || assistantBusy}
                aria-label="Ask finance assistant"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-200 text-slate-950 transition hover:bg-cyan-100 disabled:opacity-40"
              >
                {assistantBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
          {assistantBusy && <p className="mt-3 text-[10px] text-slate-500">Analyzing your financial snapshot…</p>}
          {assistantResponse ? (
            <div className="glass-inset mt-4 rounded-xl border-cyan-500/20 p-4">
              <div className="flex items-center gap-2 text-[10px] font-medium text-cyan-100">
                <Bot className="h-3.5 w-3.5" /> Delegated to {assistantResponse.delegatedTo.join(', ')}
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-300">{assistantResponse.answer}</p>
            </div>
          ) : !assistantBusy && (
            <div className="glass-inset mt-4 rounded-xl border-dashed px-4 py-6 text-center">
              <BrainCircuit className="mx-auto h-5 w-5 text-slate-600" />
              <p className="mt-2 text-[11px] text-slate-500">Your analysis will appear here with its specialist routing.</p>
            </div>
          )}
          <p className="mt-4 text-[10px] leading-4 text-slate-600">The assistant uses rules-based routing; no external AI service is configured.</p>
        </Panel>
      </div>

    </div>
  );
}
