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
      if (!response.ok || !payload.result) throw new Error(payload.error?.message || '提交失败，请稍后重试。');
      setState({ status: 'success', ...payload.result });
    } catch (error) { setState({ status: 'error', message: error instanceof Error ? error.message : '提交失败，请稍后重试。' }); }
  }
  if (state.status === 'success') return <section className="submission-receipt"><p className="eyebrow">已收到申请</p><h2>{state.duplicate ? '你之前的申请已经在审核中。' : '供应商已进入审核队列。'}</h2><p>请保存此回执以便查询：</p><code>{state.receipt}</code><p>提交不保证收录或排名。公开声明在独立测试前会保留来源标注。</p></section>;
  return <form className="submission-form" onSubmit={submit}>
    <div className="submission-form__intro"><p className="eyebrow">申请 / 公开来源</p><h2>提供足够证据，让审核者验证供应商。</h2><p>模型、工具、协议和支付方式请用逗号分隔。任何内容都不会自动公开。</p></div>
    <div className="submission-form__grid">
      <label><span>站点名称 *</span><input name="siteName" required maxLength={160}/></label><label><span>官方网站 *</span><input name="websiteUrl" type="url" placeholder="https://example.com" required/></label>
      <label className="span-2"><span>基础 URL</span><input name="baseUrl" type="url" placeholder="https://api.example.com/v1"/></label><label><span>文档地址</span><input name="documentationUrl" type="url"/></label><label><span>价格页面</span><input name="pricingUrl" type="url"/></label>
      <label><span>状态页面</span><input name="statusUrl" type="url"/></label><label><span>最低充值</span><input name="minimumRecharge" placeholder="例如 ¥10 或 $5"/></label>
      <label className="span-2"><span>支持的模型</span><input name="supportedModels" placeholder="Claude、GPT、Gemini、DeepSeek"/></label><label className="span-2"><span>支持的工具</span><input name="supportedTools" placeholder="Claude Code、Codex、Cursor"/></label>
      <label><span>协议</span><input name="protocols" placeholder="Responses API、Messages API"/></label><label><span>支付方式</span><input name="paymentMethods" placeholder="支付宝、微信支付"/></label>
      <label className="span-2"><span>联系邮箱 / Telegram *</span><input name="contact" required maxLength={320}/></label><label className="span-2"><span>审核备注</span><textarea name="notes" rows={6} maxLength={5000} placeholder="补充模型清单、价格说明、编程工具配置链接、发票支持和重测联系人。"/></label>
    </div>
    <label className="submission-confirm"><input name="operatorConfirmed" type="checkbox" required/><span>我是供应商运营者或授权团队成员，提交的信息可以接受独立审核。</span></label>
    {state.status === 'error' && <p className="form-error" role="alert">{state.message}</p>}
    <button className="button submission-form__submit" type="submit" disabled={state.status === 'saving'}>{state.status === 'saving' ? '正在提交审核…' : '提交供应商申请'}</button>
  </form>;
}
