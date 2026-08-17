import type { DiagnosticInput } from './diagnostic';

const PATHS: Record<DiagnosticInput['protocol'], string> = {
  openai_responses: '/v1/responses',
  openai_chat: '/v1/chat/completions',
  anthropic_messages: '/v1/messages',
};

export function normalizeEndpoint(input: string, protocol: DiagnosticInput['protocol']): string {
  const raw = input.trim();
  const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (url.protocol !== 'https:') throw new Error('HTTPS_REQUIRED');
  if (url.username || url.password) throw new Error('CREDENTIALS_NOT_ALLOWED');
  const target = PATHS[protocol];
  const path = url.pathname.replace(/\/+$/, '');
  if (!path.endsWith(target) && !path.endsWith(target.replace(/^\/v1/, ''))) {
    url.pathname = path === '/v1' || path === '' || path === '/' ? target : `${path}${target}`;
  }
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}
