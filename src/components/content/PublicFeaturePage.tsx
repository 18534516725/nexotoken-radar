import type { PublicRoute } from '@/lib/publicRoutes';

export function PublicFeaturePage({ route }: { route: PublicRoute }) {
  return (
    <article className="feature-page shell">
      <header className="feature-page__header">
        <p className="eyebrow">{route.eyebrow}</p>
        <h1>{route.heading}</h1>
        <p>{route.description}</p>
      </header>
      <div className="feature-page__rail" aria-label="What this page provides">
        {route.points.map((point, index) => (
          <section key={point}>
            <span>0{index + 1}</span>
            <h2>{point}</h2>
          </section>
        ))}
      </div>
      <section className="data-empty">
        <div><p className="eyebrow">仅展示已验证数据</p><h2>证据正在接入。</h2></div>
        <p>本页面不会发布虚构榜单。只有来源、观测窗口和方法论齐备后，记录才会出现。</p>
      </section>
    </article>
  );
}
