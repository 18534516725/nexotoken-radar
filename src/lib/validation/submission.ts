import { z } from 'zod';

const httpsUrl = z.url().max(2048).refine((value) => new URL(value).protocol === 'https:', 'HTTPS is required');
const optionalHttpsUrl = z.union([z.literal(''), httpsUrl]).transform((value) => value || null);
const shortList = z.array(z.string().trim().min(1).max(100)).max(30);

export const providerSubmissionSchema = z.object({
  siteName: z.string().trim().min(2).max(160),
  websiteUrl: httpsUrl,
  baseUrl: optionalHttpsUrl,
  documentationUrl: optionalHttpsUrl,
  pricingUrl: optionalHttpsUrl,
  statusUrl: optionalHttpsUrl,
  supportedModels: shortList,
  supportedTools: shortList,
  protocols: shortList,
  paymentMethods: shortList,
  minimumRecharge: z.string().trim().max(80),
  contact: z.string().trim().min(3).max(320),
  notes: z.string().trim().max(5000),
  operatorConfirmed: z.literal(true),
});

export type ProviderSubmissionInput = z.infer<typeof providerSubmissionSchema>;
