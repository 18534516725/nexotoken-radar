'use client';

export function LanguageToggle({ locale, label }: { locale: 'zh' | 'en'; label: string }) {
  return <button className="text-link language-toggle" type="button" aria-label={label} onClick={() => { document.cookie = `radar-locale=${locale === 'zh' ? 'en' : 'zh'}; path=/; max-age=31536000; samesite=lax`; window.location.reload(); }}>{locale === 'zh' ? 'EN' : '中文'}</button>;
}
