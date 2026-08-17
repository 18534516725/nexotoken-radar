import Link from 'next/link';

const signals = [
  ['01', '价格', '公开标价与实测计费分开记录'],
  ['02', '可靠性', '按时间窗口统计成功率、429 和 5xx'],
  ['03', '兼容性', 'Claude Code、Codex、Cursor 与协议检测'],
  ['04', '可信度', '每项结果旁展示样本数和测量来源'],
] as const;

const suites = [
  { code: 'CC', title: 'Claude Code', href: '/compatibility/claude-code' as const, text: 'Messages API、流式、工具调用、多轮和提示缓存行为。' },
  { code: 'CX', title: 'Codex', href: '/compatibility/codex' as const, text: 'Responses API、流式事件、工具调用和长任务稳定性。' },
  { code: 'CU', title: 'Cursor', href: '/compatibility/cursor' as const, text: 'OpenAI 兼容聊天、模型访问、编辑流程和高级能力检查。' },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero__grid">
          <div className="hero__copy">
            <p className="eyebrow"><span className="status-dot" /> 供应商实时数据</p>
            <h1>了解哪些 AI API<br /><em>真正可用。</em></h1>
            <p className="hero__lede">
              为选择 AI API 供应商的开发者提供独立的价格、可靠性和编程 Agent 兼容性数据。
            </p>
            <div className="hero__actions">
              <Link className="button" href="/doctor">运行私有 API 检测</Link>
              <Link className="button button--secondary" href="/providers">比较供应商</Link>
            </div>
            <p className="privacy-line">API 密钥仅用于本次检测，绝不保存。</p>
          </div>
          <div className="instrument" aria-label="Example Radar test sequence">
            <div className="instrument__top">
              <span>雷达 / 实时检测</span><span className="instrument__id">R-240817</span>
            </div>
            <div className="instrument__scope">
              <span className="crosshair" aria-hidden="true" />
              <p>目标</p><strong>你的 API 端点</strong>
              <span className="instrument__sweep" aria-hidden="true" />
            </div>
            <div className="instrument__checks">
              {['连通性', '身份验证', '流式响应', '工具调用'].map((label, index) => (
                <div key={label}><span>0{index + 1}</span><strong>{label}</strong><b>就绪</b></div>
              ))}
            </div>
            <Link className="instrument__run" href="/doctor"><span>▶</span> 开始检测</Link>
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
          <div><p className="eyebrow">决策数据</p><h2>比较证据，<br />不要只看营销说法。</h2></div>
          <p>每项结果都包含来源、测试区域、观测窗口、样本数和最后检查时间。</p>
        </div>
        <div className="decision-grid">
          <Link href="/rankings/cheapest" className="decision-block decision-block--price">
            <span className="decision-block__index">A / 价格</span><h3>价格最低</h3><p>统一输入、输出和缓存价格，不把公开标价误认为实测计费。</p><b>查看价格雷达 →</b>
          </Link>
          <Link href="/rankings/reliable" className="decision-block decision-block--reliable">
            <span className="decision-block__index">B / 可用性</span><h3>最可靠</h3><p>在明确的观测窗口内比较成功率、限流和服务器错误。</p><b>查看可靠性雷达 →</b>
          </Link>
          <Link href="/rankings/fastest" className="decision-block decision-block--speed">
            <span className="decision-block__index">C / 延迟</span><h3>速度最快</h3><p>查看指定测试区域和可复现请求配置下的中位数与尾延迟。</p><b>查看延迟雷达 →</b>
          </Link>
        </div>
      </section>

      <section className="agent-section">
        <div className="shell">
          <div className="section-heading section-heading--light">
            <div><p className="eyebrow">编程 Agent 实验室</p><h2>兼容性不只是<br />一次请求成功。</h2></div>
            <Link className="button button--light" href="/methodology">查看测试方法论</Link>
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
          <p className="eyebrow">本地优先诊断</p>
          <h2>需要在自己的电脑上持续留存证据？</h2>
          <p>NexoToken Agent Doctor 在本地记录任务证据、上下文健康和成本信号。Radar 负责一次性 API 兼容性检测，Doctor 伴随你的开发流程运行。</p>
        </div>
        <div className="doctor-callout__actions">
          <Link className="button" href="/agent-doctor">下载 Agent Doctor</Link>
          <a className="text-link" href="https://github.com/18534516725/Agent-Doctor">查看源码 ↗</a>
        </div>
      </section>
    </>
  );
}
