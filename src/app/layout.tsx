import type { Metadata } from 'next';
import { IBM_Plex_Mono, Newsreader, Sora } from 'next/font/google';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PRODUCT } from '@/lib/product';
import './globals.css';

const sans = Sora({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Newsreader({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCT.origin),
  title: { default: 'NexoToken Radar — AI API Provider Intelligence', template: '%s | NexoToken Radar' },
  description: PRODUCT.description,
  applicationName: PRODUCT.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: PRODUCT.name,
    title: 'NexoToken Radar — AI API Provider Intelligence',
    description: PRODUCT.description,
    url: PRODUCT.origin,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { '@context': 'https://schema.org', '@type': 'Organization', name: 'NexoToken', url: 'https://www.nexotoken.net', subOrganization: { '@type': 'Organization', name: PRODUCT.name, url: PRODUCT.origin } };
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <SiteHeader />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <div id="main">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
