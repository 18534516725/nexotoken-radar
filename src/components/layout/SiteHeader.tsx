import Link from 'next/link';
import { BrandMark } from './BrandMark';

const NAV_ITEMS = [
  ['Providers', '/providers'],
  ['Models', '/models'],
  ['Benchmarks', '/benchmarks'],
  ['Compatibility', '/compatibility/claude-code'],
  ['Methodology', '/methodology'],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="brand" href="/" aria-label="NexoToken Radar home">
          <BrandMark />
          <span className="brand__name">NexoToken</span>
          <span className="brand__product">RADAR</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <Link className="text-link" href="/submit">Submit</Link>
          <Link className="button button--compact" href="/doctor">Test my API</Link>
        </div>
      </div>
    </header>
  );
}
