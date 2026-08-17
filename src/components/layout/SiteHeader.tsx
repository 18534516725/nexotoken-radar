import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { copy, type Locale } from '@/lib/i18n';

const NAV_ITEMS = [
  ['Providers', '/providers'],
  ['Models', '/models'],
  ['Benchmarks', '/benchmarks'],
  ['Compatibility', '/compatibility/claude-code'],
  ['Methodology', '/methodology'],
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="brand" href="/" aria-label="NexoToken Radar home">
          <BrandMark />
          <span className="brand__name">NexoToken</span>
          <span className="brand__product">RADAR</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map(([, href], index) => (
            <Link key={href} href={href}>{t.nav[index]}</Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <Link className="text-link" href="/submit">{t.submit}</Link>
          <Link className="button button--compact" href="/doctor">{t.test}</Link>
        </div>
      </div>
    </header>
  );
}
