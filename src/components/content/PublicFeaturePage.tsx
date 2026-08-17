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
        <div><p className="eyebrow">VERIFIED DATA ONLY</p><h2>Evidence is being connected.</h2></div>
        <p>This surface will not publish fabricated rankings. Records appear after their source, observation window and methodology are available.</p>
      </section>
    </article>
  );
}
