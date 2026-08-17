'use client';

import { FormEvent, useState } from 'react';
import type { DiagnosticResult } from '@/lib/probe/diagnostic';

type ApiState = { status: 'idle' | 'running' } | { status: 'success'; result: DiagnosticResult } | { status: 'error'; message: string };

export function DoctorClient() {
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
          protocol: form.get('protocol'), targetTool: form.get('targetTool'), authStyle: form.get('authStyle'),
        }),
      });
      const payload = await response.json() as { result?: DiagnosticResult; error?: { message?: string } };
      if (!response.ok || !payload.result) throw new Error(payload.error?.message || 'The test could not be completed.');
      setState({ status: 'success', result: payload.result });
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'The test could not be completed.' });
    }
  }

  return (
    <div className="doctor-workbench">
      <form className="doctor-form" onSubmit={submit} autoComplete="off">
        <div className="doctor-form__head"><span>PRIVATE TEST INPUT</span><b>KEY IS NEVER STORED</b></div>
        <label><span>Base URL</span><input name="baseUrl" type="url" placeholder="https://api.example.com/v1" required /></label>
        <div className="doctor-form__pair">
          <label><span>API key</span><input name="credential" type="password" placeholder="Used in memory for this test" minLength={8} required autoComplete="new-password" /></label>
          <label><span>Model</span><input name="model" placeholder="Model identifier" required /></label>
        </div>
        <div className="doctor-form__pair">
          <label><span>Protocol</span><select name="protocol" defaultValue="openai_responses"><option value="openai_responses">OpenAI Responses API</option><option value="openai_chat">OpenAI Chat Completions</option><option value="anthropic_messages">Anthropic Messages API</option></select></label>
          <label><span>Target tool</span><select name="targetTool" defaultValue="codex"><option value="codex">Codex</option><option value="claude_code">Claude Code</option><option value="cursor">Cursor</option><option value="generic_openai">Generic OpenAI client</option><option value="generic_anthropic">Generic Anthropic client</option></select></label>
        </div>
        <details>
          <summary>Advanced authentication</summary>
          <label><span>Credential header</span><select name="authStyle" defaultValue="auto"><option value="auto">Automatic by protocol</option><option value="bearer">Authorization: Bearer</option><option value="x_api_key">x-api-key</option><option value="anthropic">Anthropic x-api-key</option></select></label>
        </details>
        <label className="doctor-consent"><input type="checkbox" name="anonymousContribution" /><span>Share anonymous timing and compatibility metrics with Radar. Off by default; credentials and content are never included.</span></label>
        <button className="button doctor-form__submit" type="submit" disabled={state.status === 'running'}>{state.status === 'running' ? 'Running bounded test…' : 'Run compatibility sequence'}</button>
        <p className="doctor-form__fineprint">Only test an endpoint you are authorized to use. Tests are capped by time, response size and request count.</p>
      </form>

      <section className="doctor-results" aria-live="polite">
        <div className="doctor-results__head"><span>SEQUENCE OUTPUT</span><span>{state.status === 'success' ? state.result.overall.replace('_', ' ').toUpperCase() : 'WAITING'}</span></div>
        {state.status === 'idle' && <div className="doctor-results__empty"><span className="scope-mini" /><h2>Ready to inspect</h2><p>Three bounded probes check access, SSE streaming and structured tool calls.</p></div>}
        {state.status === 'running' && <div className="doctor-results__empty"><span className="scope-mini scope-mini--running" /><h2>Testing endpoint</h2><p>The credential stays inside this request and will be discarded when the sequence ends.</p></div>}
        {state.status === 'error' && <div className="doctor-results__error"><span>TEST STOPPED</span><h2>{state.message}</h2><p>Review the public error, then change one input at a time. Raw provider responses are not exposed.</p></div>}
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
