import fs from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
const envText = await fs.readFile('.env', 'utf8').catch(() => '');
const credential = process.env.RESEND_API_KEY || envText.match(/^RESEND_API_KEY\s*=\s*["']?([^\r\n"']+)/m)?.[1]?.trim();
const commits = execFileSync('git', ['rev-list', '--all'], { encoding: 'utf8' }).trim().split('\n');
const historyPaths = [];
for (const commit of commits) {
  const r = spawnSync('git', ['grep', '-I', '-l', '-E', 're_[A-Za-z0-9]{20,}|RESEND_API_KEY[[:space:]]*=[[:space:]]*[^#[:space:]]+', commit], { encoding: 'utf8' });
  if (r.stdout) historyPaths.push(...r.stdout.trim().split('\n').map(path => path.replace(commit, commit.slice(0,8))));
}
const browserCredentialPaths = [];
async function scan(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true }).catch(() => [])) {
    const path = directory + '/' + entry.name;
    if (entry.isDirectory()) await scan(path);
    else if (credential && (await fs.readFile(path)).includes(Buffer.from(credential))) browserCredentialPaths.push(path);
  }
}
await scan('.next/static'); await scan('public');
let provider;
if (credential) {
  try {
    const r = await fetch('https://api.resend.com/domains', { headers: { Authorization: 'Bearer ' + credential }, signal: AbortSignal.timeout(15000) });
    provider = { readOnlyEndpoint: '/domains', status: r.status, conclusion: r.ok ? 'Provider accepted this key for read access; treat as active and rotate.' : r.status === 401 ? 'Provider rejected authentication for this request; verify key status in account.' : 'Key activity cannot be established from this response; permissions may restrict read access.' };
  } catch (e) { provider = { error: e.message, conclusion: 'Activity unverified.' }; }
}
const report = { auditDate: '2026-10-13', credentialConfigured: !!credential, commitsScanned: commits.length, historyPaths, browserCredentialPaths, provider, limitations: 'Pattern scan covers six available commits and current key in public/browser assets, not other clones, exports, provider logs or hosting settings. No key values recorded; no email sent; no rotation performed.' };
await fs.writeFile('outputs/seo/security-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
