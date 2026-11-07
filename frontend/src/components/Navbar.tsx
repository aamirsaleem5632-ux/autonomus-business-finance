import React from 'react';
import { ShieldCheck, Activity, Terminal } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface NavbarProps {
  backendConnected: boolean;
  status: 'ok' | 'degraded' | 'error' | 'pending';
}

export const Navbar: React.FC<NavbarProps> = ({ backendConnected, status }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Autonomous Business Finance Platform
              </h1>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                Finance Operations
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Financial analytics &bull; NestJS / React / TypeScript / PostgreSQL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge
              status={status}
              label={backendConnected ? 'Backend Online' : 'Backend Offline'}
            />
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>REST API Active</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 text-xs text-slate-300 font-mono border border-slate-800">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            <span>PORT 3000 &bull; 5173</span>
          </div>
        </div>
      </div>
    </header>
  );
};
