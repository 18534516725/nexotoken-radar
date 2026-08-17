'use client';

import { FormEvent, useState } from 'react';
import type { DiagnosticResult } from '@/lib/probe/diagnostic';
import { copy, type Locale } from '@/lib/i18n';

type ApiState = { status: 'idle' | 'running' } | { status: 'success'; result: DiagnosticResult } | { status: 'error'; message: string };

export function DoctorClient({ locale }: { locale: Locale }) {
  const t = copy[locale].doctor;
  const [state, setState] = useState<ApiState>({ status: 'idle' });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ status: 'running' });
    try {
      const response = await fetch('/api/doctor/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          baseUrl: form.get('baseUrl'), credential: form.get('credential'), model: form.get('model'),
          protocol: form.get('protocol'), targetTool: form.get('targetTool'), authStyle: form.get('authStyle'), mode: form.get('mode'),
        }),
      });
      const payload = await response.json() as { result?: DiagnosticResult; error?: { code?: string; message?: string } };
      if (!response.ok || !payload.result) {
        const messages: Record<string, string> = {
          INVALID_REQUEST: '请检查基础 URL、模型、协议和 API 密钥。',
          UNSAFE_TARGET: '此基础 URL 不允许进行远程测试，请使用公开 HTTPS 域名。',
          AUTHENTICATION_FAILED: '身份验证失败，或当前密钥没有该模型的调用权限。',
          MODEL_UNAVAILABLE: '模型或协议端点不存在，请检查模型名称和协议选择。',
          RATE_LIMITED: '测试请求过于频繁，请稍后再试。',
          TEST_TIMEOUT: '供应商在测试时限内没有完成响应，请稍后重试。',
          PROVIDER_UNAVAILABLE: '端点暂时无法完成请求，请检查 URL、协议和服务状态。',
        };
        throw new Error((payload.error?.code && messages[payload.error.code]) || payload.error?.message || t.errorDefault);
      }
      setState({ status: 'success', result: payload.result });
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : t.errorDefault });
    }
  }

  return (
    <div className="doctor-workbench">
      <form className="doctor-form" onSubmit={submit} autoComplete="off">
        <div className="doctor-form__head"><span>{t.input}</span><b>{t.never}</b></div>
        <label><span>{t.base}</span><input name="baseUrl" type="text" placeholder="api.example.com" required /></label>
        <label><span>{locale === 'zh' ? '检测模式' : 'Test mode'}</span><select name="mode" defaultValue="quick"><option value="quick">{locale === 'zh' ? '快速检测（3 项）' : 'Quick (3 probes)'}</option><option value="full">{locale === 'zh' ? '完整检测（动态维度）' : 'Full (dynamic probes)'}</option></select></label>
        <div className="doctor-form__pair">
          <label><span>{t.key}</span><input name="credential" type="password" placeholder={t.keyPlaceholder} minLength={8} required autoComplete="new-password" /></label>
          <label><span>{t.model}</span><input name="model" placeholder={t.modelPlaceholder} required /></label>
        </div>
        <div className="doctor-form__pair">
          <label><span>{t.protocol}</span><select name="protocol" defaultValue="openai_responses"><option value="openai_responses">OpenAI Responses API</option><option value="openai_chat">OpenAI Chat Completions</option><option value="anthropic_messages">Anthropic Messages API</option></select></label>
          <label><span>{t.tool}</span><select name="targetTool" defaultValue="codex"><option value="codex">Codex</option><option value="claude_code">Claude Code</option><option value="cursor">Cursor</option><option value="generic_openai">Generic OpenAI client</option><option value="generic_anthropic">Generic Anthropic client</option></select></label>
        </div>
        <details>
          <summary>{t.auth}</summary>
          <label><span>{t.header}</span><select name="authStyle" defaultValue="auto"><option value="auto">{t.auto}</option><option value="bearer">{t.bearer}</option><option value="x_api_key">x-api-key</option><option value="anthropic">Anthropic x-api-key</option></select></label>
        </details>
        <label className="doctor-consent"><input type="checkbox" name="anonymousContribution" /><span>{t.consent}</span></label>
        <button className="button doctor-form__submit" type="submit" disabled={state.status === 'running'}>{state.status === 'running' ? t.running : t.run}</button>
        <p className="doctor-form__fineprint">{t.fineprint}</p>
      </form>

      <section className="doctor-results" aria-live="polite">
        <div className="doctor-results__head"><span>{t.output}</span><span>{state.status === 'success' ? `${state.result.overall.replace('_', ' ').toUpperCase()} · ${state.result.score ?? 0}/100` : t.waiting}</span></div>
        {state.status === 'idle' && <div className="doctor-results__empty"><span className="scope-mini" /><h2>{t.ready}</h2><p>{t.readyDesc}</p></div>}
        {state.status === 'running' && <div className="doctor-results__empty"><span className="scope-mini scope-mini--running" /><h2>{t.testing}</h2><p>{t.testingDesc}</p></div>}
        {state.status === 'error' && <div className="doctor-results__error"><span>{t.stopped}</span><h2>{state.message}</h2><p>{t.stoppedDesc}</p></div>}
        {state.status === 'success' && <div className="doctor-results__checks">
          {state.result.checks.map((check, index) => <article key={check.id}>
            <span className={`check-state check-state--${check.outcome}`}>{check.outcome}</span>
            <div><small>0{index + 1}</small><h2>{check.label}</h2><p>{check.message}</p></div>
            <dl><div><dt>TTFB</dt><dd>{check.firstByteMs ?? '—'} ms</dd></div><div><dt>Total</dt><dd>{check.totalMs ?? '—'} ms</dd></div></dl>
          </article>)}
        </div>}
      </section>
    </div>
  );
}
