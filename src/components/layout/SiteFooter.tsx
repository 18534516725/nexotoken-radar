import Link from 'next/link';
import { PRODUCT } from '@/lib/product';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <p className="eyebrow">NEXOTOKEN RADAR</p>
          <p className="site-footer__statement">
            Independent AI API benchmark and compatibility data, operated by NexoToken.
          </p>
        </div>
        <div>
          <p className="site-footer__label">Explore</p>
          <Link href="/providers">Providers</Link>
          <Link href="/benchmarks">Benchmarks</Link>
          <Link href="/data">Open data</Link>
          <Link href="/agent-doctor">Agent Doctor</Link>
        </div>
        <div>
          <p className="site-footer__label">Governance</p>
          <Link href="/methodology">Methodology</Link>
          <Link href="/corrections">Corrections</Link>
          <Link href="/sponsorship">Sponsorship</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
        <div>
          <p className="site-footer__label">NexoToken</p>
          <a href={PRODUCT.mainPlatformUrl}>AI API Platform ↗</a>
          <a href={PRODUCT.doctorRepositoryUrl}>GitHub ↗</a>
          <Link href="/about">About Radar</Link>
        </div>
      </div>
      <div className="shell site-footer__bottom">
        <span>© 2026 NexoToken Radar</span>
        <span>Measurements, not endorsements.</span>
      </div>
    </footer>
  );
}
