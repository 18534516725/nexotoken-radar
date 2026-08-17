import type { RankingRow } from '@/lib/db/providers';

function value(kind: string, row: RankingRow) {
  if (kind === 'cheapest') return row.input_price_per_million == null ? '—' : `$${Number(row.input_price_per_million).toFixed(2)} / 1M`;
  if (kind === 'fastest') return row.median_ttft_ms == null ? '—' : `${row.median_ttft_ms} ms`;
  if (kind === 'reliable') return row.success_rate == null ? '—' : `${(Number(row.success_rate) * 100).toFixed(2)}%`;
  return `${row.observations} observations`;
}

export function RankingTable({ kind, rows }: { kind: string; rows: RankingRow[] }) {
  if (!rows.length) return <section className="catalog-empty"><p className="eyebrow">INSUFFICIENT EVIDENCE</p><h2>No provider clears the publication threshold.</h2><p>Radar requires at least 20 recent observations before a provider can enter a definitive ranking.</p></section>;
  return <div className="ranking-table" role="table" aria-label={`${kind} provider ranking`}>
    {rows.map((row, index) => <article role="row" key={`${row.slug}-${row.model_name}-${index}`}><b>#{index + 1}</b><div><h2>{row.name}</h2><p>{row.model_name} · {row.probe_region}</p></div><strong>{value(kind, row)}</strong><small>{row.observations} samples · {row.confidence} confidence · {row.stat_date}</small></article>)}
  </div>;
}
