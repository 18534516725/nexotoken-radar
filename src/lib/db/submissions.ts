import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { withTransaction } from './pool';
import type { ProviderSubmissionInput } from '@/lib/validation/submission';

type DuplicateRow = RowDataPacket & { id: number; public_receipt: string };

export async function createProviderSubmission(input: ProviderSubmissionInput): Promise<{ receipt: string; duplicate: boolean }> {
  return withTransaction(async (connection) => {
    const [existing] = await connection.query<DuplicateRow[]>(
      `SELECT id, public_receipt FROM radar_provider_submissions
       WHERE website_url = ? AND contact = ? AND status IN ('pending','reviewing')
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 7 DAY)
       ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [input.websiteUrl, input.contact],
    );
    if (existing[0]) return { receipt: existing[0].public_receipt, duplicate: true };

    const receipt = randomUUID();
    const [result] = await connection.execute(
      `INSERT INTO radar_provider_submissions
       (public_receipt, site_name, website_url, base_url, documentation_url, pricing_url, status_url,
        supported_models, supported_tools, protocols, payment_methods, minimum_recharge, contact,
        notes, operator_confirmed, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [receipt, input.siteName, input.websiteUrl, input.baseUrl, input.documentationUrl, input.pricingUrl,
        input.statusUrl, JSON.stringify(input.supportedModels), JSON.stringify(input.supportedTools),
        JSON.stringify(input.protocols), JSON.stringify(input.paymentMethods), input.minimumRecharge || null,
        input.contact, input.notes || null, input.operatorConfirmed ? 1 : 0],
    );
    const submissionId = Number((result as { insertId: number }).insertId);
    await connection.execute(
      `INSERT INTO radar_audit_events
       (actor_type, actor_reference, action, subject_type, subject_id, after_data)
       VALUES ('system', 'public-submission', 'submission.created', 'provider_submission', ?, ?)`,
      [submissionId, JSON.stringify({ receipt, siteName: input.siteName, websiteUrl: input.websiteUrl })],
    );
    return { receipt, duplicate: false };
  });
}
