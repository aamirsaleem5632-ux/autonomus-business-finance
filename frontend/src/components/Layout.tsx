import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BriefcaseBusiness,
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  Command,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  Menu,
  Moon,
  ReceiptText,
  Search,
  Server,
  Settings2,
  Sparkles,
  Sun,
  Vault,
  X,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export type AppRoute =
  | '/'
  | '/transactions'
  | '/payments'
  | '/cards'
  | '/vaults'
  | '/capital'
  | '/reports'
  | '/analytics'
  | '/activity'
  | '/agents'
  | '/system';
export type DashboardPeriod = 'week' | '30d' | '90d' | '12m';

const navigationSections = [
  {
    label: 'General',
    links: [
      { route: '/', label: 'Dashboard', icon: LayoutDashboard },
      { route: '/transactions', label: 'Transactions', icon: ReceiptText },
      { route: '/payments', label: 'Payments', icon: ArrowDownToLine },
    ],
  },
  {
    label: 'Tools',
    links: [
      { route: '/cards', label: 'Cards', icon: CreditCard },
      { route: '/vaults', label: 'Vaults', icon: Vault },
      { route: '/capital', label: 'Capital', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'Insights',
    links: [
      { route: '/reports', label: 'Reports', icon: FileBarChart },
      { route: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
      { route: '/activity', label: 'Activity', icon: Activity },
    ],
  },
  {
    label: 'Other',
    links: [
      { route: '/agents', label: 'AI Agents', icon: Bot },
      { route: '/system', label: 'System Telemetry', icon: Server },
    ],
  },
] satisfies Array<{
  label: string;
  links: Array<{ route: AppRoute; label: string; icon: typeof LayoutDashboard }>;
}>;

const pageDetails: Record<AppRoute, { title: string; description: string }> = {
  '/': {
    title: 'Overview',
    description: 'Your financial position, cashflow, and monthly profitability snapshot.',
  },
  '/transactions': {
    title: 'Transactions',
    description: 'Review general journal entries and line-by-line inbound and outbound ledger activity.',
  },
  '/payments': {
    title: 'Payments',
    description: 'Payment gateways, bank transfers, payout schedules, and settlement status.',
  },
  '/cards': {
    title: 'Corporate Cards',
    description: 'Cardholder controls, spend limits, and card status.',
  },
  '/vaults': {
    title: 'Treasury Vaults',
    description: 'Reserve funds, treasury sub-accounts, and liquidity controls.',
  },
  '/capital': {
    title: 'Capital',
    description: 'Business credit facilities, debt financing, and capital allocation.',
  },
  '/reports': {
    title: 'Reports',
    description: 'Executive summaries, tax audit materials, and financial statements.',
  },
  '/analytics': {
    title: 'Analytics',
    description: 'Interactive performance trends, cash forecasts, and variance analysis.',
  },
  '/activity': {
    title: 'Activity Audit Trail',
    description: 'Available autonomous agent actions and connected audit events.',
  },
  '/agents': {
    title: 'AI Specialist Agents',
    description: 'Run rules-based financial analyses and interact with the finance assistant.',
  },
  '/system': {
    title: 'System Telemetry',
    description: 'Inspect service health, database connectivity, and platform diagnostics.',
  },
};

const activeNavigationLabel: Record<AppRoute, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/payments': 'Payments',
  '/cards': 'Cards',
  '/vaults': 'Vaults',
  '/capital': 'Capital',
  '/reports': 'Reports',
  '/analytics': 'Analytics',
  '/activity': 'Activity',
  '/system': 'System Telemetry',
  '/agents': 'AI Agents',
};

const periodLabels: Record<DashboardPeriod, string> = {
  week: 'This week',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

interface LayoutProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  backendConnected: boolean;
  backendStatus: 'ok' | 'degraded' | 'error' | 'pending';
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  onExport: () => void;
  children: ReactNode;
}

export function Layout({
  route,
  onNavigate,
  backendConnected,
  backendStatus,
  period,
  onPeriodChange,
  onExport,
  children,
}: LayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const page = pageDetails[route];

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if (event.code === 'Space' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
        setUpgradeOpen(false);
        searchRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  function navigate(event: MouseEvent<HTMLAnchorElement>, target: AppRoute) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigate(target);
    setIsMobileOpen(false);
  }

  function submitSearch(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    const query = search.trim().toLowerCase();
    const target: AppRoute = query.includes('payment') || query.includes('gateway') || query.includes('settlement') || query.includes('payout') || query.includes('transfer')
      ? '/payments'
      : query.includes('card')
        ? '/cards'
        : query.includes('vault') || query.includes('reserve')
          ? '/vaults'
          : query.includes('capital') || query.includes('credit') || query.includes('debt')
            ? '/capital'
            : query.includes('analytic') || query.includes('budget')
              ? '/analytics'
              : query.includes('activity') || query.includes('audit trail') || query.includes('login')
                ? '/activity'
                : query.includes('agent')
                  ? '/agents'
                  : query.includes('report') || query.includes('tax') || query.includes('statement')
                    ? '/reports'
                    : query.includes('transaction') || query.includes('payment') || query.includes('invoice') || query.includes('ledger')
                      ? '/transactions'
                      : query.includes('system') || query.includes('health')
                        ? '/system'
                        : '/';
    onNavigate(target);
    setSearch('');
    searchRef.current?.blur();
  }

  return (
    <div className={`app-shell min-h-screen text-slate-100 ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      <div className="ambient-glow pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-48 top-[-20rem] h-[38rem] w-[38rem] rounded-full bg-emerald-500/[0.065] blur-[140px]" />
        <div className="absolute -right-52 top-[32rem] h-[36rem] w-[36rem] rounded-full bg-amber-500/[0.035] blur-[140px]" />
      </div>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="mobile-navigation"
        className={`app-sidebar fixed inset-y-0 left-0 z-50 flex w-[15.5rem] flex-col border-r px-3 py-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between rounded-xl px-2 py-2">
          <a
            href="/"
            onClick={(event) => navigate(event, '/')}
            className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-300/25 bg-emerald-400/[0.08] text-emerald-300">
              <span className="text-sm font-bold">O</span>
            </span>
            <span className="brand-lockup min-w-0">
              <span className="brand-name block text-[13px] font-semibold tracking-[0.025em]">OptiFinance</span>
              <span className="brand-subtitle mt-0.5 block text-[8px] tracking-wide">Autonomous Business Finance</span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-emerald-300"
            title="Plan details"
            aria-label="View plan details"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="ml-1 rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-4 overflow-y-auto" aria-label="Main navigation">
          {navigationSections.map((section) => (
            <div key={section.label}>
              <div className="mb-1.5 px-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.links.map(({ route: target, label, icon: Icon }) => {
                  const active =
                    route === target &&
                    label === activeNavigationLabel[route];
                  return (
                    <a
                      key={`${section.label}-${label}`}
                      href={target}
                      onClick={(event) => navigate(event, target)}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[10px] font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 ${
                        active
                          ? 'border border-emerald-300/25 bg-gradient-to-r from-emerald-400/80 to-emerald-500/60 text-[#03140c] shadow-[0_0_18px_rgba(16,185,129,0.2)]'
                          : 'border border-transparent text-slate-400 hover:bg-white/[0.045] hover:text-slate-100'
                      }`}
                    >
                      {active && <span className="absolute -left-[13px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />}
                      <Icon className={`h-3.5 w-3.5 ${active ? 'text-emerald-950' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="flex-1">{label}</span>
                      {active && <span className="h-1 w-1 rounded-full bg-emerald-950" />}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setUpgradeOpen(true)}
          className="upgrade-card mt-3 flex w-full items-center gap-2.5 rounded-lg border border-emerald-400/15 p-2.5 text-left transition duration-300 hover:border-emerald-300/40 hover:shadow-[0_0_22px_rgba(16,185,129,0.12)]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-semibold text-slate-200">Upgrade to pro</span>
            <span className="mt-0.5 block truncate text-[8px] text-slate-500">Get more from your account</span>
          </span>
          <ArrowUpRight className="h-3 w-3 text-emerald-300" />
        </button>

        <div className="mt-3 flex items-center justify-between px-2 py-1.5">
          <span className="text-[9px] font-medium text-slate-500">Dark Mode</span>
          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((enabled) => !enabled)}
            className={`relative h-[15px] w-[28px] rounded-full border transition-colors duration-200 ${
              darkMode ? 'border-emerald-400/40 bg-emerald-500/50' : 'border-slate-500/40 bg-slate-600/50'
            }`}
          >
            <span className={`absolute top-[2px] flex h-[9px] w-[9px] items-center justify-center rounded-full bg-white transition-transform duration-200 ${darkMode ? 'translate-x-[15px]' : 'translate-x-[2px]'}`}>
              {darkMode ? <Moon className="h-[6px] w-[6px] text-slate-700" /> : <Sun className="h-[6px] w-[6px] text-amber-600" />}
            </span>
          </button>
        </div>
      </aside>

      <div className="relative min-h-screen lg:pl-[15.5rem]">
        <header className="app-topbar sticky top-0 z-30 border-b">
          <div className="flex min-h-[3.6rem] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:flex-nowrap lg:px-8">
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] p-2 text-[#D4AF37] transition duration-200 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/[0.12] hover:text-[#F5D76E] lg:hidden"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open navigation"
                aria-expanded={isMobileOpen}
                aria-controls="mobile-navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="hidden items-center gap-1.5 text-[9px] sm:flex">
                <span className="text-slate-500">OptiFinance</span>
                <span className="text-slate-700">/</span>
                <span className="font-medium text-slate-300">{page.title}</span>
              </div>
              <div className="brand-name text-[11px] font-semibold tracking-[0.025em] sm:hidden">OptiFinance</div>
            </div>

            <label className="search-field mx-auto flex h-8 w-full max-w-[16rem] items-center gap-2 rounded-md border px-2.5 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <Search className="h-3 w-3 shrink-0 text-slate-500" />
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={submitSearch}
                aria-label="Search or type a command"
                placeholder="Search or type a command"
                className="min-w-0 flex-1 bg-transparent text-[9px] text-slate-200 outline-none placeholder:text-slate-600"
              />
              <span className="hidden shrink-0 items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-300 sm:inline-flex">
                <Command className="h-2.5 w-2.5" /> + Space
              </span>
            </label>

            <div className="flex shrink-0 items-center gap-1.5">
              <StatusBadge status={backendStatus} label={backendConnected ? 'Connected' : backendStatus === 'pending' ? 'Connecting' : 'Offline'} size="sm" />
              {route === '/' && <label className="period-select hidden h-7 items-center gap-1.5 rounded-md border px-2 sm:flex">
                <CalendarDays className="h-3 w-3 text-slate-500" />
                <select
                  aria-label="Dashboard date range"
                  value={period}
                  onChange={(event) => onPeriodChange(event.target.value as DashboardPeriod)}
                  className="max-w-[5.6rem] bg-transparent text-[9px] text-slate-300 outline-none"
                >
                  {Object.entries(periodLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </label>}
              {route === '/transactions' && <button
                type="button"
                onClick={onExport}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/[0.09] bg-white/[0.035] px-2 text-[9px] font-medium text-slate-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
              >
                <ArrowDownToLine className="h-3 w-3" />
                <span className="hidden sm:inline">Export</span>
              </button>}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 pb-8 pt-5 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h1 className="page-heading text-xl font-semibold tracking-tight text-white">{page.title}</h1>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">{page.description}</p>
            </div>
            {route === '/' && (
              <div className="hidden items-center gap-1 text-[9px] text-slate-500 md:flex">
                <CircleHelp className="h-3 w-3" /> All figures in USD
              </div>
            )}
          </div>
          {children}
          <footer className="mt-8 border-t border-white/[0.06] pt-4 text-[9px] text-slate-600">
            OptiFinance · Advisory analytics only · No payments or money transfers
          </footer>
        </main>
      </div>

      {upgradeOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setUpgradeOpen(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="upgrade-title" className="glass-panel w-full max-w-sm rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Sparkles className="h-4 w-4" /></div>
                <h2 id="upgrade-title" className="mt-4 text-base font-semibold text-slate-100">Upgrade to Pro</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">Plan management is not connected in this demo. Contact your platform administrator for subscription changes.</p>
              </div>
              <button type="button" onClick={() => setUpgradeOpen(false)} aria-label="Close plan details" className="rounded-md p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"><X className="h-4 w-4" /></button>
            </div>
            <button type="button" onClick={() => setUpgradeOpen(false)} className="mt-5 w-full rounded-lg bg-emerald-400 py-2.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-300">Got it</button>
          </section>
        </div>
      )}
    </div>
  );
}
