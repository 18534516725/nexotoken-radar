-- NexoToken Radar core directory and benchmark tables.
CREATE TABLE IF NOT EXISTS radar_providers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  website_url VARCHAR(2048) NOT NULL,
  base_url VARCHAR(2048) NULL,
  description TEXT NULL,
  logo_url VARCHAR(2048) NULL,
  region VARCHAR(80) NULL,
  status ENUM('pending','active','paused','removed') NOT NULL DEFAULT 'pending',
  claimed TINYINT(1) NOT NULL DEFAULT 0,
  first_seen_at DATETIME(3) NOT NULL,
  last_seen_at DATETIME(3) NULL,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_radar_providers_slug (slug),
  UNIQUE KEY uq_radar_providers_domain (domain),
  KEY idx_radar_providers_status_published (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_models (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  canonical_name VARCHAR(200) NOT NULL,
  family VARCHAR(100) NOT NULL,
  modality ENUM('text','image','audio','video','multimodal','embedding') NOT NULL DEFAULT 'text',
  context_window BIGINT UNSIGNED NULL,
  status ENUM('active','legacy','unknown') NOT NULL DEFAULT 'unknown',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_radar_models_slug (slug),
  KEY idx_radar_models_family_status (family, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_provider_models (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id BIGINT UNSIGNED NOT NULL,
  model_id BIGINT UNSIGNED NOT NULL,
  provider_model_id VARCHAR(255) NOT NULL,
  protocol ENUM('openai_chat','openai_responses','anthropic_messages','other') NOT NULL,
  declared_capabilities JSON NULL,
  availability ENUM('available','degraded','unavailable','unknown') NOT NULL DEFAULT 'unknown',
  last_checked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_radar_provider_model_protocol (provider_id, provider_model_id, protocol),
  KEY idx_radar_provider_models_model (model_id, availability),
  CONSTRAINT fk_radar_provider_models_provider FOREIGN KEY (provider_id) REFERENCES radar_providers(id),
  CONSTRAINT fk_radar_provider_models_model FOREIGN KEY (model_id) REFERENCES radar_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_price_snapshots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_model_id BIGINT UNSIGNED NOT NULL,
  source_type ENUM('provider_published','public_source','observed_billing') NOT NULL,
  source_url VARCHAR(2048) NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  input_price_per_million DECIMAL(20,8) NULL,
  output_price_per_million DECIMAL(20,8) NULL,
  cache_read_price_per_million DECIMAL(20,8) NULL,
  cache_write_price_per_million DECIMAL(20,8) NULL,
  minimum_purchase_amount DECIMAL(20,8) NULL,
  observed_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_radar_prices_model_time (provider_model_id, observed_at),
  CONSTRAINT fk_radar_prices_provider_model FOREIGN KEY (provider_model_id) REFERENCES radar_provider_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_probe_schedules (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_model_id BIGINT UNSIGNED NOT NULL,
  suite ENUM('connectivity','openai','responses','anthropic','claude_code','codex','cursor','full') NOT NULL,
  cadence_minutes INT UNSIGNED NOT NULL,
  probe_region VARCHAR(80) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  next_run_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_radar_schedule_target_suite_region (provider_model_id, suite, probe_region),
  KEY idx_radar_schedules_due (enabled, next_run_at),
  CONSTRAINT fk_radar_schedules_provider_model FOREIGN KEY (provider_model_id) REFERENCES radar_provider_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_probe_jobs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  schedule_id BIGINT UNSIGNED NULL,
  provider_model_id BIGINT UNSIGNED NOT NULL,
  suite VARCHAR(40) NOT NULL,
  source ENUM('scheduler','admin','community','provider') NOT NULL,
  status ENUM('queued','leased','completed','retry','failed','cancelled') NOT NULL DEFAULT 'queued',
  priority SMALLINT NOT NULL DEFAULT 100,
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  available_at DATETIME(3) NOT NULL,
  lease_token CHAR(36) NULL,
  leased_until DATETIME(3) NULL,
  last_error_category VARCHAR(80) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_radar_jobs_lease (status, available_at, priority),
  KEY idx_radar_jobs_target_created (provider_model_id, created_at),
  CONSTRAINT fk_radar_jobs_schedule FOREIGN KEY (schedule_id) REFERENCES radar_probe_schedules(id),
  CONSTRAINT fk_radar_jobs_provider_model FOREIGN KEY (provider_model_id) REFERENCES radar_provider_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_probe_runs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_id BIGINT UNSIGNED NULL,
  provider_model_id BIGINT UNSIGNED NOT NULL,
  source ENUM('radar_probe','community','provider_retest','private_test') NOT NULL,
  suite VARCHAR(40) NOT NULL,
  probe_region VARCHAR(80) NOT NULL,
  request_profile_version VARCHAR(40) NOT NULL,
  methodology_version VARCHAR(40) NOT NULL,
  started_at DATETIME(3) NOT NULL,
  completed_at DATETIME(3) NULL,
  status ENUM('running','completed','partial','failed','cancelled') NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_radar_runs_target_time (provider_model_id, started_at),
  KEY idx_radar_runs_status_time (status, started_at),
  CONSTRAINT fk_radar_runs_job FOREIGN KEY (job_id) REFERENCES radar_probe_jobs(id),
  CONSTRAINT fk_radar_runs_provider_model FOREIGN KEY (provider_model_id) REFERENCES radar_provider_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_probe_results (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  probe_run_id BIGINT UNSIGNED NOT NULL,
  test_type VARCHAR(80) NOT NULL,
  outcome ENUM('pass','warn','fail','unknown') NOT NULL,
  http_status SMALLINT UNSIGNED NULL,
  error_category VARCHAR(80) NULL,
  ttft_ms INT UNSIGNED NULL,
  total_latency_ms INT UNSIGNED NULL,
  retry_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  capability_data JSON NULL,
  usage_data JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_radar_results_run_type (probe_run_id, test_type),
  KEY idx_radar_results_outcome_created (outcome, created_at),
  CONSTRAINT fk_radar_results_run FOREIGN KEY (probe_run_id) REFERENCES radar_probe_runs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radar_daily_provider_stats (
  stat_date DATE NOT NULL,
  provider_id BIGINT UNSIGNED NOT NULL,
  model_id BIGINT UNSIGNED NOT NULL,
  probe_region VARCHAR(80) NOT NULL,
  methodology_version VARCHAR(40) NOT NULL,
  observations INT UNSIGNED NOT NULL DEFAULT 0,
  independent_sources INT UNSIGNED NOT NULL DEFAULT 0,
  success_rate DECIMAL(8,5) NULL,
  median_ttft_ms INT UNSIGNED NULL,
  p95_ttft_ms INT UNSIGNED NULL,
  p99_ttft_ms INT UNSIGNED NULL,
  rate_429 DECIMAL(8,5) NULL,
  rate_5xx DECIMAL(8,5) NULL,
  compatibility_score DECIMAL(6,3) NULL,
  confidence ENUM('low','medium','high') NOT NULL DEFAULT 'low',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (stat_date, provider_id, model_id, probe_region),
  KEY idx_radar_daily_rank (stat_date, success_rate, compatibility_score),
  CONSTRAINT fk_radar_daily_provider FOREIGN KEY (provider_id) REFERENCES radar_providers(id),
  CONSTRAINT fk_radar_daily_model FOREIGN KEY (model_id) REFERENCES radar_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
