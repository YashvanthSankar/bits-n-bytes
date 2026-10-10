import { query } from './_generated/server';
import { POLICY_VERSION } from '../src/domain/policy';

/** Public operational status; never returns credentials or user information. */
export const status = query({
  args: {},
  handler: () => ({ service: 'gudtour', version: '0.1.0', policyVersion: POLICY_VERSION }),
});
