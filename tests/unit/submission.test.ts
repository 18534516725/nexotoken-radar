import { describe, expect, it } from 'vitest';
import { providerSubmissionSchema } from '@/lib/validation/submission';

const valid = {
  siteName: 'Example API', websiteUrl: 'https://example.com', baseUrl: 'https://api.example.com/v1',
  documentationUrl: 'https://example.com/docs', pricingUrl: 'https://example.com/pricing', statusUrl: '',
  supportedModels: ['Claude', 'GPT'], supportedTools: ['Claude Code', 'Codex'],
  protocols: ['OpenAI Responses API'], paymentMethods: ['Alipay'], minimumRecharge: '¥10',
  contact: 'operator@example.com', notes: 'Public pricing and documentation are available.', operatorConfirmed: true,
};

describe('provider submission validation', () => {
  it('accepts the complete reviewable form', () => {
    expect(providerSubmissionSchema.parse(valid).siteName).toBe('Example API');
  });

  it('requires operator confirmation and a public HTTPS website', () => {
    expect(() => providerSubmissionSchema.parse({ ...valid, operatorConfirmed: false })).toThrow();
    expect(() => providerSubmissionSchema.parse({ ...valid, websiteUrl: 'http://example.com' })).toThrow();
  });

  it('limits list and free-text payloads', () => {
    expect(() => providerSubmissionSchema.parse({ ...valid, supportedModels: Array.from({ length: 31 }, (_, index) => `m${index}`) })).toThrow();
    expect(() => providerSubmissionSchema.parse({ ...valid, notes: 'x'.repeat(5001) })).toThrow();
  });
});
