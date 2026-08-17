import Link from 'next/link';
import { PRODUCT } from '@/lib/product';
import { copy, type Locale } from '@/lib/i18n';

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <p className="eyebrow">NEXOTOKEN RADAR</p>
          <p className="site-footer__statement">
            {t.statement}
          </p>
        </div>
        <div>
          <p className="site-footer__label">{t.explore}</p>
          <Link href="/providers">{t.nav[0]}</Link>
          <Link href="/benchmarks">{t.nav[2]}</Link>
          <Link href="/data">{t.openData}</Link>
          <Link href="/agent-doctor">Agent Doctor</Link>
        </div>
        <div>
          <p className="site-footer__label">{t.governance}</p>
          <Link href="/methodology">{t.nav[4]}</Link>
          <Link href="/corrections">{locale === 'zh' ? '更正' : 'Corrections'}</Link>
          <Link href="/sponsorship">{locale === 'zh' ? '赞助政策' : 'Sponsorship'}</Link>
          <Link href="/privacy">{t.privacy}</Link>
        </div>
        <div>
          <p className="site-footer__label">NexoToken</p>
          <a href={PRODUCT.mainPlatformUrl}>AI API Platform ↗</a>
          <a href={PRODUCT.doctorRepositoryUrl}>GitHub ↗</a>
          <Link href="/about">{t.about}</Link>
        </div>
      </div>
      <div className="shell site-footer__bottom">
        <span>© 2026 NexoToken Radar</span>
        <span>{t.measurements}</span>
      </div>
    </footer>
  );
}
