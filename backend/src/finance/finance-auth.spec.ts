import { ForbiddenException } from '@nestjs/common';
import { requireFinanceRole } from './finance-auth.js';

describe('finance role authorization', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows a viewer key to read but not ingest', () => {
    vi.stubEnv('FINANCE_VIEWER_API_KEY', 'v'.repeat(32));

    expect(() => requireFinanceRole('v'.repeat(32), 'viewer')).not.toThrow();
    expect(() => requireFinanceRole('v'.repeat(32), 'admin')).toThrow(
      ForbiddenException,
    );
  });

  it('allows an admin key to read and ingest', () => {
    vi.stubEnv('FINANCE_ADMIN_API_KEY', 'a'.repeat(32));

    expect(() => requireFinanceRole('a'.repeat(32), 'viewer')).not.toThrow();
    expect(() => requireFinanceRole('a'.repeat(32), 'admin')).not.toThrow();
  });

  it('rejects short and incorrect keys', () => {
    vi.stubEnv('FINANCE_ADMIN_API_KEY', 'short');

    expect(() => requireFinanceRole('short', 'admin')).toThrow(
      ForbiddenException,
    );
    expect(() => requireFinanceRole('x'.repeat(32), 'admin')).toThrow(
      ForbiddenException,
    );
  });
});
