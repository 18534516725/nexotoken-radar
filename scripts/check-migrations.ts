import { readdir, readFile } from 'node:fs/promises';

const files = (await readdir('migrations')).filter((file) => /^\d+.*\.sql$/.test(file)).sort();
if (!files.length) throw new Error('No migrations found');
for (const file of files) {
  const sql = await readFile(`migrations/${file}`, 'utf8');
  if (/CREATE TABLE(?! IF NOT EXISTS radar_)/i.test(sql)) throw new Error(`${file}: table without radar_ prefix`);
  await readFile(`migrations/rollback/${file}`, 'utf8');
  process.stdout.write(`checked ${file}\n`);
}
