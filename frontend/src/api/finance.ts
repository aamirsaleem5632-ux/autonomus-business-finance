import { request } from './client';
import type {
  FinanceAgent,
  FinanceAgentActivity,
  FinanceAssistantResponse,
  FinanceOverview,
} from '../types/finance';

function headers(apiKey?: string): HeadersInit {
  return apiKey ? { 'x-finance-api-key': apiKey } : {};
}

export function getFinanceOverview(apiKey?: string): Promise<FinanceOverview> {
  return request<FinanceOverview>('/finance/overview', {
    headers: headers(apiKey),
  });
}

export function getFinanceAgents(apiKey?: string): Promise<FinanceAgent[]> {
  return request<FinanceAgent[]>('/finance/agents', {
    headers: headers(apiKey),
  });
}

export function runFinanceAgent(
  agentId: string,
  apiKey?: string,
): Promise<FinanceAgentActivity> {
  return request<FinanceAgentActivity>(`/finance/agents/${agentId}/run`, {
    method: 'POST',
    headers: headers(apiKey),
  });
}

export function askFinanceAssistant(
  query: string,
  apiKey?: string,
): Promise<FinanceAssistantResponse> {
  return request<FinanceAssistantResponse>('/finance/assistant', {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ query }),
  });
}
