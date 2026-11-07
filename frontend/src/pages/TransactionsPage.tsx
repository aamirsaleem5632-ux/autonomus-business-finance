import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ReceiptText } from 'lucide-react';
import { EmptyState, MetricCard, money, Panel } from '../components/FinanceUI';
import type { FinanceOverview } from '../types/finance';

type DirectionFilter = 'all' | 'inbound' | 'outbound';

export function TransactionsPage({
  overview,
  loading,
}: {
  overview: FinanceOverview | null;
  loading: boolean;
}) {
  const [direction, setDirection] = useState<DirectionFilter>('all');

  if (!overview) {
    return <EmptyState>{loading ? 'Loading ledger entries…' : 'Ledger data is unavailable.'}</EmptyState>;
  }

  const inbound = overview.transactions.filter((entry) => entry.type === 'income');
  const outbound = overview.transactions.filter((entry) => entry.type === 'expense');
  const visible = overview.transactions.filter((entry) =>
    direction === 'all' ||
    (direction === 'inbound' ? entry.type === 'income' : entry.type === 'expense'),
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Journal entries" value={overview.transactions.length.toString()} detail="Line-by-line ledger records" icon={<ReceiptText className="h-4 w-4" />} tone="violet" />
        <MetricCard label="Inbound entries" value={inbound.length.toString()} detail="Recorded income rows" icon={<ArrowDownLeft className="h-4 w-4" />} tone="emerald" />
        <MetricCard label="Outbound entries" value={outbound.length.toString()} detail="Recorded expense rows" icon={<ArrowUpRight className="h-4 w-4" />} tone="rose" />
      </div>
      <Panel
        title="General journal"
        description="Each row is a source ledger entry; amounts are shown in USD"
        icon={<ReceiptText className="h-4 w-4" />}
        action={
          <label className="flex items-center gap-2 text-[9px] text-slate-500">
            Direction
            <select
              aria-label="Filter ledger by direction"
              value={direction}
              onChange={(event) => setDirection(event.target.value as DirectionFilter)}
              className="rounded-lg border border-white/[0.08] bg-slate-950/60 px-2 py-1.5 text-[9px] text-slate-300"
            >
              <option value="all">All</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </label>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="text-[9px] uppercase tracking-wider text-slate-600">
              <tr className="border-b border-white/[0.06]">
                <th className="pb-3 font-medium">Entry</th>
                <th className="pb-3 font-medium">Posting date</th>
                <th className="pb-3 font-medium">Description / counterparty</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Direction</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.id} className="border-b border-white/[0.04] last:border-0">
                  <td className="py-3.5 font-mono text-[10px] text-slate-500">{entry.id}</td>
                  <td className="py-3.5 text-slate-400">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="py-3.5 font-medium text-slate-200">
                    {entry.description}
                    <div className="mt-1 text-[10px] font-normal text-slate-500">{entry.counterparty}</div>
                  </td>
                  <td className="py-3.5 text-slate-400">{entry.category}</td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] uppercase tracking-wider ${entry.type === 'income' ? 'bg-emerald-300/[0.08] text-emerald-200' : 'bg-rose-300/[0.08] text-rose-200'}`}>
                      {entry.type === 'income' ? <ArrowDownLeft className="h-2.5 w-2.5" /> : <ArrowUpRight className="h-2.5 w-2.5" />}
                      {entry.type === 'income' ? 'Inbound' : 'Outbound'}
                    </span>
                  </td>
                  <td className={`py-3.5 text-right font-semibold tabular-nums ${entry.type === 'income' ? 'text-emerald-200' : 'text-slate-300'}`}>
                    {entry.type === 'income' ? '+' : '−'}{money(entry.amountCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <EmptyState>No ledger entries match this direction.</EmptyState>}
        </div>
      </Panel>
    </div>
  );
}
