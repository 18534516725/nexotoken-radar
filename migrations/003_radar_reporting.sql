-- NexoToken Radar public reports and immutable monthly publications.
CREATE TABLE IF NOT EXISTS radar_public_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(26) NOT NULL,
  revoke_token_hash CHAR(64) NOT NULL,
  provider_domain VARCHAR(255) NOT NULL,
  model_name VARCHAR(255) NOT NULL,
  protocol VARCHAR(40) NOT NULL,
  target_tool VARCHAR(40) NOT NULL,
  summary_data JSON NOT NULL,
  methodology_version VARCHAR(40) NOT NULL,
  tested_at DATETIME(3) NOT NULL,
  expires_at DATETIME(3) NULL,
  revoked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_radar_public_reports_public_id (public_id),
  KEY idx_radar_public_reports_tested (tested_at, revoked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_monthly_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_month CHAR(7) NOT NULL,
  language ENUM('zh-CN','en-US') NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  summary TEXT NOT NULL,
  snapshot_data JSON NOT NULL,
  methodology_version VARCHAR(40) NOT NULL,
  status ENUM('draft','published','superseded') NOT NULL DEFAULT 'draft',
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_radar_monthly_language (report_month, language),
  UNIQUE KEY uq_radar_monthly_slug (slug),
  KEY idx_radar_monthly_status_published (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
