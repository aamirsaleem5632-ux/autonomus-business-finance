import { timingSafeEqual } from 'node:crypto';
import { ForbiddenException } from '@nestjs/common';

export type FinanceRole = 'viewer' | 'admin';

export function requireFinanceRole(
  apiKey: string | undefined,
  requiredRole: FinanceRole,
): void {
  const credentials: Array<{ key: string | undefined; role: FinanceRole }> = [
    { key: process.env.FINANCE_VIEWER_API_KEY, role: 'viewer' },
    { key: process.env.FINANCE_ADMIN_API_KEY, role: 'admin' },
  ];
  const role =
    credentials[1]?.key &&
    credentials[1].key.length >= 32 &&
    matchesSecret(apiKey, credentials[1].key)
      ? 'admin'
      : credentials[0]?.key &&
          credentials[0].key.length >= 32 &&
          matchesSecret(apiKey, credentials[0].key)
        ? 'viewer'
        : undefined;
  const authorized =
    requiredRole === 'viewer' ? role === 'viewer' || role === 'admin' : role === 'admin';

  if (!authorized) {
    throw new ForbiddenException(
      'A valid finance API key with the required role is required.',
    );
  }
}

function matchesSecret(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}
