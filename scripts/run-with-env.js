const { spawnSync } = require('child_process');

const neonUrl =
  'postgresql://neondb_owner:npg_zriZkC1WQph9@ep-hidden-shape-b3qm86ks-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15';

const env = { ...process.env };

if (
  !env.DATABASE_URL ||
  env.DATABASE_URL.includes('skillbridge') ||
  env.DATABASE_URL.includes('dpg-dabv7k6k1f9s73dlugog')
) {
  console.log('[LifeOS Env Guard] Intercepted stale skillbridge DATABASE_URL. Substituting Neon PostgreSQL URL.');
  env.DATABASE_URL = neonUrl;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('[LifeOS Env Guard] No target command specified.');
  process.exit(1);
}

const command = args[0];
const cmdArgs = args.slice(1);

const result = spawnSync(command, cmdArgs, {
  env,
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 0);
