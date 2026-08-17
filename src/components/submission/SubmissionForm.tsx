'use client';

import { FormEvent, useState } from 'react';

type State = { status: 'idle' | 'saving' } | { status: 'success'; receipt: string; duplicate: boolean } | { status: 'error'; message: string };
const split = (value: FormDataEntryValue | null) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);

export function SubmissionForm() {
  const [state, setState] = useState<State>({ status: 'idle' });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setState({ status: 'saving' });
    try {
      const response = await fetch('/api/submissions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        siteName: form.get('siteName'), websiteUrl: form.get('websiteUrl'), baseUrl: form.get('baseUrl'), documentationUrl: form.get('documentationUrl'), pricingUrl: form.get('pricingUrl'), statusUrl: form.get('statusUrl'),
        supportedModels: split(form.get('supportedModels')), supportedTools: split(form.get('supportedTools')), protocols: split(form.get('protocols')), paymentMethods: split(form.get('paymentMethods')),
        minimumRecharge: form.get('minimumRecharge'), contact: form.get('contact'), notes: form.get('notes'), operatorConfirmed: form.get('operatorConfirmed') === 'on',
      }) });
      const payload = await response.json() as { result?: { receipt: string; duplicate: boolean }; error?: { message?: string } };
      if (!response.ok || !payload.result) throw new Error(payload.error?.message || 'Submission failed.');
      setState({ status: 'success', ...payload.result });
    } catch (error) { setState({ status: 'error', message: error instanceof Error ? error.message : 'Submission failed.' }); }
  }
  if (state.status === 'success') return <section className="submission-receipt"><p className="eyebrow">APPLICATION RECEIVED</p><h2>{state.duplicate ? 'Your pending application is already in review.' : 'Your provider is now in the review queue.'}</h2><p>Keep this receipt to reference the application:</p><code>{state.receipt}</code><p>Submission does not guarantee listing or ranking. Published claims remain source-labelled until independently tested.</p></section>;
  return <form className="submission-form" onSubmit={submit}>
    <div className="submission-form__intro"><p className="eyebrow">APPLICATION / PUBLIC SOURCES</p><h2>Give reviewers enough evidence to verify the provider.</h2><p>Use comma-separated lists for models, tools, protocols and payment methods. Nothing is published automatically.</p></div>
    <div className="submission-form__grid">
      <label><span>Site name *</span><input name="siteName" required maxLength={160}/></label><label><span>Official website *</span><input name="websiteUrl" type="url" placeholder="https://example.com" required/></label>
      <label className="span-2"><span>Base URL</span><input name="baseUrl" type="url" placeholder="https://api.example.com/v1"/></label><label><span>Documentation</span><input name="documentationUrl" type="url"/></label><label><span>Pricing page</span><input name="pricingUrl" type="url"/></label>
      <label><span>Status page</span><input name="statusUrl" type="url"/></label><label><span>Minimum recharge</span><input name="minimumRecharge" placeholder="e.g. ¥10 or $5"/></label>
      <label className="span-2"><span>Supported models</span><input name="supportedModels" placeholder="Claude, GPT, Gemini, DeepSeek"/></label><label className="span-2"><span>Supported tools</span><input name="supportedTools" placeholder="Claude Code, Codex, Cursor, Cherry Studio"/></label>
      <label><span>Protocols</span><input name="protocols" placeholder="Responses API, Messages API"/></label><label><span>Payment methods</span><input name="paymentMethods" placeholder="Alipay, WeChat Pay"/></label>
      <label className="span-2"><span>Contact email / Telegram *</span><input name="contact" required maxLength={320}/></label><label className="span-2"><span>Review notes</span><textarea name="notes" rows={6} maxLength={5000} placeholder="Add model list, pricing context, coding-agent setup links, invoice support and retest contact."/></label>
    </div>
    <label className="submission-confirm"><input name="operatorConfirmed" type="checkbox" required/><span>I am the provider operator or an authorized team member, and the submitted information can be independently reviewed.</span></label>
    {state.status === 'error' && <p className="form-error" role="alert">{state.message}</p>}
    <button className="button submission-form__submit" type="submit" disabled={state.status === 'saving'}>{state.status === 'saving' ? 'Submitting for review…' : 'Submit provider application'}</button>
  </form>;
}
