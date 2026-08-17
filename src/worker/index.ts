import { databasePool } from '@/lib/db/pool';

const intervalMs = Math.max(10_000, Number(process.env.RADAR_WORKER_INTERVAL_MS || 30_000));
let stopping = false;

async function heartbeat() {
  try { await databasePool().query('SELECT 1'); process.stdout.write(`${new Date().toISOString()} radar-worker healthy\n`); }
  catch { process.stderr.write(`${new Date().toISOString()} radar-worker database unavailable\n`); }
}

async function run() {
  while (!stopping) { await heartbeat(); await new Promise((resolve) => setTimeout(resolve, intervalMs)); }
  await databasePool().end();
}
process.on('SIGTERM', () => { stopping = true; }); process.on('SIGINT', () => { stopping = true; });
void run();
