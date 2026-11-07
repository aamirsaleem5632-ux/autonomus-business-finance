import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { ApiClientError } from '../api/client';

interface ErrorBannerProps {
  error: ApiClientError | Error | null;
  onDismiss: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  const isApiClientError = 'statusCode' in error;
  const statusCode = isApiClientError ? (error as ApiClientError).statusCode : undefined;

  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-rose-200 backdrop-blur-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-rose-300">
                {statusCode ? `API Error [HTTP ${statusCode}]` : 'System Alert'}
              </span>
              <span className="rounded bg-rose-900/60 px-1.5 py-0.5 text-xs text-rose-300">
                Handled by Global Filter
              </span>
            </div>
            <p className="text-sm text-rose-200/90">{error.message}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-lg p-1 text-rose-400 hover:bg-rose-900/50 hover:text-rose-200"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
