import React from 'react';
import { Layers, Database, Shield, Layout, CheckCircle2 } from 'lucide-react';

export const ArchitectureGrid: React.FC = () => {
  const tiers = [
    {
      title: 'Frontend Tier',
      icon: Layout,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      badge: 'React 19 + Vite 8',
      items: [
        'React with TypeScript & strict typing',
        'Tailwind CSS responsive design layout',
        'Vite reverse proxy & dedicated API client',
        'Resilient error boundaries & status telemetry',
      ],
    },
    {
      title: 'Backend Tier',
      icon: Layers,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
      badge: 'NestJS 12 + Node.js',
      items: [
        'NestJS Enterprise Modular Architecture',
        'Global API route prefix (/api)',
        'GlobalHttpExceptionFilter error normalization',
        'HTTP Request telemetry & LoggingInterceptor',
      ],
    },
    {
      title: 'Data & ORM Tier',
      icon: Database,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'Prisma ORM + PostgreSQL',
      items: [
        'PostgreSQL datasource schema with Prisma ORM',
        'SystemHealthCheck & AuditLog entity models',
        'Graceful disconnection & pool lifecycle handling',
        'Typed Prisma Client with automated generation',
      ],
    },
    {
      title: 'Security & DevOps',
      icon: Shield,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      badge: 'Standards Compliant',
      items: [
        'Zero hardcoded credentials or API keys',
        'Environment variable schemas (.env.example)',
        'Unified ESLint & Prettier code quality gates',
        'Comprehensive multi-tier .gitignore configuration',
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white">Platform Architectural Foundation</h3>
        <p className="text-xs text-slate-400">
          Phase 1 foundational substrate initialized for high-assurance autonomous financial workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.title}
              className="glass-panel rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-gradient-to-tr ${tier.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/60">
                  {tier.badge}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{tier.title}</h4>
              <ul className="mt-3 space-y-2">
                {tier.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-400 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
