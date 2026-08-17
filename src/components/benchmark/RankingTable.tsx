import type { RankingRow } from '@/lib/db/providers';

function value(kind: string, row: RankingRow) {
  if (kind === 'cheapest') return row.input_price_per_million == null ? '—' : `$${Number(row.input_price_per_million).toFixed(2)} / 1M`;
  if (kind === 'fastest') return row.median_ttft_ms == null ? '—' : `${row.median_ttft_ms} ms`;
  if (kind === 'reliable') return row.success_rate == null ? '—' : `${(Number(row.success_rate) * 100).toFixed(2)}%`;
  return `${row.observations} 次观测`;
}

export function RankingTable({ kind, rows }: { kind: string; rows: RankingRow[] }) {
  if (!rows.length) return <section className="catalog-empty"><p className="eyebrow">证据不足</p><h2>暂时没有供应商达到发布门槛。</h2><p>Radar 要求至少 20 次近期观测，供应商才可以进入正式榜单。</p></section>;
  return <div className="ranking-table" role="table" aria-label={`${kind} provider ranking`}>
    {rows.map((row, index) => <article role="row" key={`${row.slug}-${row.model_name}-${index}`}><b>第 {index + 1} 名</b><div><h2>{row.name}</h2><p>{row.model_name} · {row.probe_region}</p></div><strong>{value(kind, row)}</strong><small>{row.observations} 次样本 · 可信度：{row.confidence} · {row.stat_date}</small></article>)}
  </div>;
}
