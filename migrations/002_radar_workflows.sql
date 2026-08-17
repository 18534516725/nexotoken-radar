-- NexoToken Radar review, claim, alert and governance workflows.
CREATE TABLE IF NOT EXISTS radar_provider_submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_receipt CHAR(36) NOT NULL,
  site_name VARCHAR(160) NOT NULL,
  website_url VARCHAR(2048) NOT NULL,
  base_url VARCHAR(2048) NULL,
  documentation_url VARCHAR(2048) NULL,
  pricing_url VARCHAR(2048) NULL,
  status_url VARCHAR(2048) NULL,
  supported_models JSON NULL,
  supported_tools JSON NULL,
  protocols JSON NULL,
  payment_methods JSON NULL,
  minimum_recharge VARCHAR(80) NULL,
  contact VARCHAR(320) NOT NULL,
  notes TEXT NULL,
  operator_confirmed TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('pending','reviewing','approved','rejected','withdrawn') NOT NULL DEFAULT 'pending',
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME(3) NULL,
  review_note TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_radar_submission_receipt (public_receipt),
  KEY idx_radar_submissions_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_provider_claims (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id BIGINT UNSIGNED NOT NULL,
  method ENUM('dns_txt','well_known_file','domain_email') NOT NULL,
  contact_email VARCHAR(320) NOT NULL,
  verification_token_hash CHAR(64) NOT NULL,
  status ENUM('pending','verified','rejected','expired','revoked') NOT NULL DEFAULT 'pending',
  expires_at DATETIME(3) NOT NULL,
  verified_at DATETIME(3) NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_radar_claims_provider_status (provider_id, status),
  KEY idx_radar_claims_expiry (status, expires_at),
  CONSTRAINT fk_radar_claims_provider FOREIGN KEY (provider_id) REFERENCES radar_providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_correction_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_receipt CHAR(36) NOT NULL,
  provider_id BIGINT UNSIGNED NULL,
  request_type ENUM('profile','price','benchmark','retest','appeal') NOT NULL,
  contact VARCHAR(320) NOT NULL,
  evidence_url VARCHAR(2048) NULL,
  explanation TEXT NOT NULL,
  status ENUM('pending','reviewing','accepted','rejected','closed') NOT NULL DEFAULT 'pending',
  resolution TEXT NULL,
  reviewed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_radar_correction_receipt (public_receipt),
  KEY idx_radar_corrections_status_created (status, created_at),
  CONSTRAINT fk_radar_corrections_provider FOREIGN KEY (provider_id) REFERENCES radar_providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_alert_subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email_hash CHAR(64) NOT NULL,
  encrypted_email VARBINARY(1024) NOT NULL,
  provider_id BIGINT UNSIGNED NULL,
  alert_types JSON NOT NULL,
  threshold_data JSON NULL,
  status ENUM('pending','active','unsubscribed','bounced') NOT NULL DEFAULT 'pending',
  confirmation_token_hash CHAR(64) NULL,
  unsubscribe_token_hash CHAR(64) NOT NULL,
  confirmed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_radar_alerts_hash_status (email_hash, status),
  KEY idx_radar_alerts_provider_status (provider_id, status),
  CONSTRAINT fk_radar_alerts_provider FOREIGN KEY (provider_id) REFERENCES radar_providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_sponsorships (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id BIGINT UNSIGNED NOT NULL,
  placement VARCHAR(80) NOT NULL,
  disclosure_label VARCHAR(40) NOT NULL DEFAULT 'Sponsored',
  destination_url VARCHAR(2048) NOT NULL,
  starts_at DATETIME(3) NOT NULL,
  ends_at DATETIME(3) NOT NULL,
  status ENUM('draft','active','paused','ended') NOT NULL DEFAULT 'draft',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_radar_sponsorships_placement_time (placement, status, starts_at, ends_at),
  CONSTRAINT fk_radar_sponsorships_provider FOREIGN KEY (provider_id) REFERENCES radar_providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_audit_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_type ENUM('admin','provider','system') NOT NULL,
  actor_reference VARCHAR(160) NOT NULL,
  action VARCHAR(120) NOT NULL,
  subject_type VARCHAR(80) NOT NULL,
  subject_id BIGINT UNSIGNED NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  ip_hash CHAR(64) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_radar_audit_subject (subject_type, subject_id, created_at),
  KEY idx_radar_audit_actor (actor_type, actor_reference, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
