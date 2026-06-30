CREATE TABLE app_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Valeurs par défaut
INSERT INTO app_settings (setting_key, setting_value) VALUES
  ('company_name', 'Bhouri Stock'),
  ('company_email', ''),
  ('company_phone', ''),
  ('company_address', ''),
  ('currency', 'DNT'),
  ('tax_rate', '19'),
  ('invoice_prefix', 'FAC'),
  ('email_notifications_enabled', 'true');
