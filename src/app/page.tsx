import Link from 'next/link';

const signals = [
  ['01', 'PRICE', 'Published and observed billing kept separate'],
  ['02', 'RELIABILITY', 'Success rate, 429 and 5xx by time window'],
  ['03', 'COMPATIBILITY', 'Claude Code, Codex, Cursor and protocol checks'],
  ['04', 'CONFIDENCE', 'Sample count and measurement source beside every result'],
] as const;

const suites = [
  { code: 'CC', title: 'Claude Code', href: '/compatibility/claude-code' as const, text: 'Messages API, streaming, tool use, multi-turn and prompt-cache behavior.' },
  { code: 'CX', title: 'Codex', href: '/compatibility/codex' as const, text: 'Responses API, streaming events, tool calling and long-running task stability.' },
  { code: 'CU', title: 'Cursor', href: '/compatibility/cursor' as const, text: 'OpenAI-compatible chat, model access, editing flow and advanced capability checks.' },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero__grid">
          <div className="hero__copy">
            <p className="eyebrow"><span className="status-dot" /> LIVE PROVIDER INTELLIGENCE</p>
            <h1>Know which AI API<br /><em>actually works.</em></h1>
            <p className="hero__lede">
              Independent price, reliability and coding-agent compatibility data for developers choosing an AI API provider.
            </p>
            <div className="hero__actions">
              <Link className="button" href="/doctor">Run a private API test</Link>
              <Link className="button button--secondary" href="/providers">Compare providers</Link>
            </div>
            <p className="privacy-line">API keys are used only for your test and are never stored.</p>
          </div>
          <div className="instrument" aria-label="Example Radar test sequence">
            <div className="instrument__top">
              <span>RADAR / LIVE TEST</span><span className="instrument__id">R-240817</span>
            </div>
            <div className="instrument__scope">
              <span className="crosshair" aria-hidden="true" />
              <p>Target</p><strong>Your API endpoint</strong>
              <span className="instrument__sweep" aria-hidden="true" />
            </div>
            <div className="instrument__checks">
              {['Connectivity', 'Authentication', 'Streaming', 'Tool calling'].map((label, index) => (
                <div key={label}><span>0{index + 1}</span><strong>{label}</strong><b>READY</b></div>
              ))}
            </div>
            <Link className="instrument__run" href="/doctor"><span>▶</span> Start diagnostic sequence</Link>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Radar methodology summary">
        <div className="shell signal-strip__grid">
          {signals.map(([number, title, text]) => (
            <article key={number}><span>{number}</span><h2>{title}</h2><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div><p className="eyebrow">DECISION SURFACES</p><h2>Compare evidence,<br />not marketing claims.</h2></div>
          <p>Every result carries its source, test region, observation window, sample count and last-checked time.</p>
        </div>
        <div className="decision-grid">
          <Link href="/rankings/cheapest" className="decision-block decision-block--price">
            <span className="decision-block__index">A / PRICE</span><h3>Cheapest</h3><p>Normalize input, output and cache prices without confusing published price with observed billing.</p><b>Open price radar →</b>
          </Link>
          <Link href="/rankings/reliable" className="decision-block decision-block--reliable">
            <span className="decision-block__index">B / UPTIME</span><h3>Most reliable</h3><p>Compare success rate, throttling and server errors across explicit measurement windows.</p><b>Open reliability radar →</b>
          </Link>
          <Link href="/rankings/fastest" className="decision-block decision-block--speed">
            <span className="decision-block__index">C / LATENCY</span><h3>Fastest</h3><p>Inspect median and tail latency from a named probe region and reproducible request profile.</p><b>Open latency radar →</b>
          </Link>
        </div>
      </section>

      <section className="agent-section">
        <div className="shell">
          <div className="section-heading section-heading--light">
            <div><p className="eyebrow">CODING-AGENT LAB</p><h2>Compatibility is more<br />than a successful ping.</h2></div>
            <Link className="button button--light" href="/methodology">Read the test methodology</Link>
          </div>
          <div className="suite-list">
            {suites.map((suite) => (
              <Link key={suite.code} href={suite.href} className="suite-row">
                <span className="suite-row__code">{suite.code}</span><h3>{suite.title}</h3><p>{suite.text}</p><span className="suite-row__arrow">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="doctor-callout shell">
        <div>
          <p className="eyebrow">LOCAL-FIRST DIAGNOSTICS</p>
          <h2>Need continuous evidence from your own machine?</h2>
          <p>Agent Doctor by NexoToken records task evidence, context health and cost signals locally. Radar handles one-time API compatibility tests; Doctor stays with your development workflow.</p>
        </div>
        <div className="doctor-callout__actions">
          <Link className="button" href="/agent-doctor">Download Agent Doctor</Link>
          <a className="text-link" href="https://github.com/18534516725/Agent-Doctor">View source ↗</a>
        </div>
      </section>
    </>
  );
}
