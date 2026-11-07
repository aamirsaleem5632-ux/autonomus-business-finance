import { ApiClientError, request } from './client';
import {
  askSimulatedFinanceAssistant,
  getSimulatedFinanceAgents,
  getSimulatedFinanceOverview,
  runSimulatedFinanceAgent,
} from './simulated-finance';
import type {
  FinanceAgent,
  FinanceAgentActivity,
  FinanceAssistantResponse,
  FinanceOverview,
} from '../types/finance';

function headers(apiKey?: string): HeadersInit {
  return apiKey ? { 'x-finance-api-key': apiKey } : {};
}

const useSimulatedData = import.meta.env.VITE_USE_SIMULATED_DATA === 'true';

async function withSimulatedFallback<T>(
  operation: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  if (useSimulatedData) {
    return fallback();
  }

  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApiClientError && (error.statusCode === 0 || error.statusCode === 404)) {
      return fallback();
    }
    throw error;
  }
}

export function getFinanceOverview(apiKey?: string): Promise<FinanceOverview> {
  return withSimulatedFallback(
    () => request<FinanceOverview>('/finance/overview', { headers: headers(apiKey) }),
    getSimulatedFinanceOverview,
  );
}

export function getFinanceAgents(apiKey?: string): Promise<FinanceAgent[]> {
  return withSimulatedFallback(
    () => request<FinanceAgent[]>('/finance/agents', { headers: headers(apiKey) }),
    getSimulatedFinanceAgents,
  );
}

export function runFinanceAgent(
  agentId: string,
  apiKey?: string,
): Promise<FinanceAgentActivity> {
  return withSimulatedFallback(
    () =>
      request<FinanceAgentActivity>(`/finance/agents/${agentId}/run`, {
        method: 'POST',
        headers: headers(apiKey),
      }),
    () => runSimulatedFinanceAgent(agentId),
  );
}

export function askFinanceAssistant(
  query: string,
  apiKey?: string,
): Promise<FinanceAssistantResponse> {
  return withSimulatedFallback(
    () =>
      request<FinanceAssistantResponse>('/finance/assistant', {
        method: 'POST',
        headers: headers(apiKey),
        body: JSON.stringify({ query }),
      }),
    () => askSimulatedFinanceAssistant(query),
  );
}
