import React from 'react';

interface StatusBadgeProps {
  status: 'ok' | 'degraded' | 'error' | 'connected' | 'disconnected' | 'unconfigured' | 'pending';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'ok':
      case 'connected':
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
          text: label || (status === 'connected' ? 'Connected' : 'Operational'),
        };
      case 'degraded':
      case 'pending':
        return {
          bg: 'bg-amber-950/70 border-amber-500/40 text-amber-400',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
          text: label || (status === 'pending' ? 'Connecting...' : 'Degraded (Configured)'),
        };
      case 'error':
      case 'disconnected':
      case 'unconfigured':
      default:
        return {
          bg: 'bg-rose-950/70 border-rose-500/40 text-rose-400',
          dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
          text:
            label ||
            (status === 'unconfigured'
              ? 'Unconfigured'
              : status === 'disconnected'
                ? 'Disconnected'
                : 'Offline'),
        };
    }
  };

  const current = getStyles();
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${current.dot} animate-pulse`} />
      <span>{current.text}</span>
    </span>
  );
};
