import fs from 'node:fs';
import { parseEnv } from 'node:util';
import { execFileSync } from 'node:child_process';

// Never print the private list or interpolate it into shell commands.
const path = '.env.local';
if (!fs.existsSync(path)) throw new Error('Create the ignored .env.local before configuring authority access.');
let source = fs.readFileSync(path, 'utf8');
const env = parseEnv(source);
function convex(args) {
  try { return execFileSync('npx', ['convex', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
  catch { throw new Error('Convex configuration failed. Check team/deployment access; private configuration was not printed.'); }
}
if (process.argv.includes('--demo')) {
  const scope = JSON.parse(convex(['run', 'operator:ensureDemoAuthorityScope', '{}']));
  if (scope.audience !== 'DEMO' || !scope.agencyId || !Array.isArray(scope.jurisdictionIds)) throw new Error('Invalid DEMO scope response.');
  env.AUTHORITY_AGENCY_ID = scope.agencyId; env.AUTHORITY_JURISDICTION_IDS = scope.jurisdictionIds.join(',');
}
env.AUTHORITY_EMAILS ??= '';
if (!env.AUTHORITY_AGENCY_ID || !env.AUTHORITY_JURISDICTION_IDS) throw new Error('Set the approved agency/jurisdiction IDs, or run npm run authority:configure -- --demo.');
const emails = env.AUTHORITY_EMAILS.split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
if (emails.length > 250 || emails.some(value => value.length > 254 || !/^[^\s,@]+@[^\s,@]+\.[^\s,@]+$/.test(value))) throw new Error('AUTHORITY_EMAILS must contain comma-separated email addresses.');
env.AUTHORITY_EMAILS = [...new Set(emails)].join(',');
for (const key of ['AUTHORITY_AGENCY_ID', 'AUTHORITY_JURISDICTION_IDS', 'AUTHORITY_EMAILS']) {
  const value = env[key];
  if (value.includes("'") || /[\r\n]/.test(value)) throw new Error('Invalid authority configuration value.');
  convex(['env', 'set', key, value]);
  const line = `${key}='${value}'`;
  const pattern = new RegExp('^' + key + '=.*$', 'm');
  source = pattern.test(source) ? source.replace(pattern, () => line) : source.trimEnd() + '\n' + line + '\n';
}
fs.writeFileSync(path, source, { mode: 0o600 }); fs.chmodSync(path, 0o600);
console.log('Authority access configured on the selected Convex deployment. Private emails were not printed.');
