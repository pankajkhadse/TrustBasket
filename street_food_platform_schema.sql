-- ============================================================
--  STREET FOOD PLATFORM — COMPLETE FUTURE-PROOF SCHEMA
--  PostgreSQL 15+  |  PostGIS 3+  |  uuid-ossp  |  pgcrypto
--  All domains covered. No ALTER TABLE ever needed.
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS pg_trgm;        -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent";     -- accent-insensitive search
CREATE EXTENSION IF NOT EXISTS btree_gist;     -- range exclusion constraints


-- ============================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================

-- Auth & identity
CREATE TYPE user_role AS ENUM (
  'customer', 'vendor', 'supplier', 'driver',
  'admin', 'moderator', 'support_agent', 'analyst'
);
CREATE TYPE account_status AS ENUM (
  'pending_verification', 'active', 'suspended',
  'deactivated', 'banned', 'under_review'
);
CREATE TYPE gender AS ENUM ('male','female','non_binary','prefer_not_to_say');
CREATE TYPE id_doc_type AS ENUM (
  'national_id','passport','driving_license','voter_card','aadhaar','other'
);

-- Vendor / supplier
CREATE TYPE verification_status AS ENUM (
  'not_submitted','pending','in_review','verified',
  'rejected','expired','suspended'
);
CREATE TYPE license_type AS ENUM (
  'food_safety','business_registration','health_certificate',
  'fire_safety','environmental','trade_license',
  'fssai','halal_cert','organic_cert','export_import','other'
);
CREATE TYPE business_type AS ENUM (
  'sole_proprietor','partnership','llp','private_limited',
  'public_limited','cooperative','ngo','other'
);

-- Orders & fulfilment
CREATE TYPE order_status AS ENUM (
  'draft','pending','payment_pending','confirmed',
  'preparing','ready_for_pickup','out_for_delivery',
  'delivered','completed','cancellation_requested',
  'cancelled','refund_initiated','refunded','disputed'
);
CREATE TYPE order_type AS ENUM (
  'dine_in','pickup','delivery','scheduled'
);
CREATE TYPE cancellation_reason AS ENUM (
  'customer_request','vendor_unavailable','item_unavailable',
  'payment_failed','delivery_failed','fraud_suspected',
  'duplicate_order','other'
);

-- Payments
CREATE TYPE payment_method AS ENUM (
  'cash','credit_card','debit_card','upi','net_banking',
  'mobile_wallet','crypto','bnpl','gift_card','loyalty_points'
);
CREATE TYPE payment_status AS ENUM (
  'initiated','pending','authorised','captured',
  'failed','voided','refund_pending','partially_refunded',
  'fully_refunded','disputed','chargeback'
);
CREATE TYPE currency_code AS ENUM (
  'INR','USD','EUR','GBP','AED','SGD','MYR','THB','IDR','PHP'
);

-- Delivery
CREATE TYPE delivery_status AS ENUM (
  'pending_assignment','assigned','en_route_to_vendor',
  'at_vendor','picked_up','en_route_to_customer',
  'nearby','arrived','delivered','failed','returned'
);
CREATE TYPE vehicle_type AS ENUM (
  'bicycle','motorcycle','scooter','car','van','cargo_bike','on_foot'
);

-- Inventory & supply chain
CREATE TYPE po_status AS ENUM (
  'draft','submitted','acknowledged','partially_fulfilled',
  'fulfilled','cancelled','disputed'
);
CREATE TYPE inventory_txn_type AS ENUM (
  'purchase','sale','adjustment','waste','return',
  'transfer_in','transfer_out','opening_stock','expired'
);
CREATE TYPE material_category AS ENUM (
  'grain','protein','vegetable','fruit','dairy','spice',
  'oil','condiment','packaging','fuel','cleaning','other'
);

-- Ratings & reviews
CREATE TYPE rating_target AS ENUM (
  'vendor','menu_item','driver','supplier'
);
CREATE TYPE review_status AS ENUM (
  'pending_moderation','approved','rejected','flagged','removed'
);

-- Promotions
CREATE TYPE promo_type AS ENUM (
  'percentage_discount','fixed_discount','free_item',
  'bogo','free_delivery','combo_deal','cashback','referral'
);
CREATE TYPE promo_applies_to AS ENUM (
  'all','specific_vendors','specific_categories',
  'specific_items','first_order','nth_order'
);

-- Notifications
CREATE TYPE notification_channel AS ENUM (
  'push','sms','email','in_app','whatsapp'
);
CREATE TYPE notification_status AS ENUM (
  'queued','sent','delivered','read','failed'
);
CREATE TYPE notification_type AS ENUM (
  'order_update','payment_update','promo','hygiene_alert',
  'license_expiry','low_inventory','new_review',
  'kyc_status','system','delivery_update','support_reply'
);

-- Support
CREATE TYPE ticket_status AS ENUM (
  'open','in_progress','waiting_on_customer',
  'escalated','resolved','closed','reopened'
);
CREATE TYPE ticket_priority AS ENUM (
  'low','medium','high','critical'
);
CREATE TYPE ticket_category AS ENUM (
  'order_issue','payment_issue','delivery_issue',
  'account_issue','vendor_complaint','food_safety',
  'app_bug','refund_request','legal','other'
);

-- Audit & misc
CREATE TYPE audit_action AS ENUM (
  'insert','update','delete','login','logout',
  'password_change','role_change','status_change',
  'export','bulk_action','api_call'
);
CREATE TYPE media_type AS ENUM (
  'image','video','document','audio'
);
CREATE TYPE address_type AS ENUM (
  'home','work','vendor_location','warehouse','other'
);


-- ============================================================
-- 2. UTILITY — reusable composite types & domains
-- ============================================================

-- Money domain: never use FLOAT for currency
CREATE DOMAIN money_amount AS NUMERIC(14,2)
  CHECK (VALUE >= 0);

-- Phone domain
CREATE DOMAIN phone_number AS VARCHAR(25)
  CHECK (VALUE ~ '^[+]?[0-9\s\-\(\)]{7,25}$');

-- Email domain
CREATE DOMAIN email_address AS VARCHAR(320)
  CHECK (VALUE ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Rating domain
CREATE DOMAIN rating_value AS NUMERIC(3,2)
  CHECK (VALUE BETWEEN 0.00 AND 5.00);

-- Percentage domain (0.00–100.00)
CREATE DOMAIN percentage AS NUMERIC(5,2)
  CHECK (VALUE BETWEEN 0.00 AND 100.00);

-- Positive quantity
CREATE DOMAIN positive_qty AS NUMERIC(14,3)
  CHECK (VALUE > 0);

-- Non-negative quantity
CREATE DOMAIN non_neg_qty AS NUMERIC(14,3)
  CHECK (VALUE >= 0);


-- ============================================================
-- 3. SHARED LOOKUP TABLES
-- ============================================================

CREATE TABLE countries (
  country_code  CHAR(2)       PRIMARY KEY,             -- ISO 3166-1 alpha-2
  country_name  VARCHAR(100)  NOT NULL UNIQUE,
  dial_code     VARCHAR(10)   NOT NULL,
  currency_code currency_code NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE TABLE states (
  state_id     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code CHAR(2)      NOT NULL REFERENCES countries(country_code),
  state_code   VARCHAR(10)  NOT NULL,
  state_name   VARCHAR(150) NOT NULL,
  UNIQUE(country_code, state_code)
);

CREATE TABLE cities (
  city_id    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id   UUID         NOT NULL REFERENCES states(state_id),
  city_name  VARCHAR(150) NOT NULL,
  latitude   DOUBLE PRECISION,
  longitude  DOUBLE PRECISION,
  timezone   VARCHAR(60)  NOT NULL DEFAULT 'UTC',
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  UNIQUE(state_id, city_name)
);

CREATE TABLE allergens (
  allergen_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(80) NOT NULL UNIQUE,
  code          VARCHAR(20) NOT NULL UNIQUE,  -- e.g. 'GLUTEN', 'NUTS'
  description   TEXT,
  icon_url      TEXT,
  is_major      BOOLEAN     NOT NULL DEFAULT FALSE  -- EU/FDA major 14
);

CREATE TABLE dietary_tags (
  tag_id      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(60) NOT NULL UNIQUE,   -- 'vegan','halal','keto'…
  code        VARCHAR(30) NOT NULL UNIQUE,
  description TEXT,
  icon_url    TEXT
);

CREATE TABLE food_categories (
  category_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_category_id UUID         REFERENCES food_categories(category_id) ON DELETE SET NULL,
  name               VARCHAR(100) NOT NULL,
  slug               VARCHAR(120) NOT NULL UNIQUE,
  description        TEXT,
  icon_url           TEXT,
  display_order      INT          NOT NULL DEFAULT 0,
  is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(parent_category_id, name)
);

CREATE TABLE measurement_units (
  unit_id     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(40) NOT NULL UNIQUE,   -- 'kilogram'
  symbol      VARCHAR(15) NOT NULL UNIQUE,   -- 'kg'
  unit_type   VARCHAR(30) NOT NULL,          -- 'weight','volume','count','length'
  base_factor NUMERIC(20,10) NOT NULL DEFAULT 1, -- factor to convert to SI base
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE tax_rates (
  tax_rate_id  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(80)  NOT NULL,
  country_code CHAR(2)      NOT NULL REFERENCES countries(country_code),
  state_id     UUID         REFERENCES states(state_id),
  category     VARCHAR(80),                   -- food, beverage, packaged…
  rate         percentage   NOT NULL,
  hsn_code     VARCHAR(20),                   -- India HSN / EU commodity code
  effective_from DATE       NOT NULL,
  effective_to   DATE,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_tax_dates CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE TABLE feature_flags (
  flag_id      UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key     VARCHAR(100) NOT NULL UNIQUE,
  description  TEXT,
  is_enabled   BOOLEAN      NOT NULL DEFAULT FALSE,
  rollout_pct  percentage   NOT NULL DEFAULT 0,   -- 0=off, 100=all
  config_json  JSONB,
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE system_config (
  config_key   VARCHAR(150) PRIMARY KEY,
  config_value TEXT         NOT NULL,
  value_type   VARCHAR(20)  NOT NULL DEFAULT 'string', -- string,integer,boolean,json
  description  TEXT,
  is_secret    BOOLEAN      NOT NULL DEFAULT FALSE,
  updated_by   UUID,
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE translations (
  translation_id UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type    VARCHAR(80)  NOT NULL,    -- 'menu_item','food_category'…
  entity_id      UUID         NOT NULL,
  locale         VARCHAR(10)  NOT NULL,    -- 'en','hi','ta','ar'…
  field_name     VARCHAR(80)  NOT NULL,
  translated_text TEXT        NOT NULL,
  is_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
  translated_by  UUID,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, locale, field_name)
);


-- ============================================================
-- 4. AUTH & IDENTITY
-- ============================================================

CREATE TABLE users (
  user_id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  email              email_address NOT NULL UNIQUE,
  phone              phone_number  UNIQUE,
  password_hash      TEXT          NOT NULL,
  role               user_role     NOT NULL,
  status             account_status NOT NULL DEFAULT 'pending_verification',
  country_code       CHAR(2)       NOT NULL REFERENCES countries(country_code),
  preferred_locale   VARCHAR(10)   NOT NULL DEFAULT 'en',
  preferred_currency currency_code NOT NULL DEFAULT 'INR',
  timezone           VARCHAR(60)   NOT NULL DEFAULT 'UTC',
  email_verified_at  TIMESTAMPTZ,
  phone_verified_at  TIMESTAMPTZ,
  last_login_at      TIMESTAMPTZ,
  last_login_ip      INET,
  failed_login_count SMALLINT      NOT NULL DEFAULT 0
                       CHECK (failed_login_count >= 0),
  locked_until       TIMESTAMPTZ,
  mfa_enabled        BOOLEAN       NOT NULL DEFAULT FALSE,
  mfa_secret         TEXT,                              -- encrypted TOTP secret
  referral_code      VARCHAR(30)   UNIQUE,
  referred_by        UUID          REFERENCES users(user_id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ,                       -- soft delete
  CONSTRAINT chk_no_self_referral CHECK (referred_by <> user_id)
);
CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_phone   ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_role    ON users(role, status);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE user_sessions (
  session_id     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash     TEXT         NOT NULL UNIQUE,    -- SHA-256 of JWT
  device_type    VARCHAR(30),                     -- 'ios','android','web'
  device_id      VARCHAR(200),
  device_name    VARCHAR(200),
  ip_address     INET,
  user_agent     TEXT,
  location_city  VARCHAR(100),
  country_code   CHAR(2),
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ  NOT NULL,
  last_used_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT chk_session_expiry CHECK (expires_at > created_at)
);
CREATE INDEX idx_sessions_user    ON user_sessions(user_id, is_active);
CREATE INDEX idx_sessions_expiry  ON user_sessions(expires_at) WHERE is_active = TRUE;

CREATE TABLE oauth_identities (
  identity_id    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  provider       VARCHAR(30)  NOT NULL,   -- 'google','facebook','apple','twitter'
  provider_uid   VARCHAR(200) NOT NULL,
  access_token   TEXT,
  refresh_token  TEXT,
  token_expiry   TIMESTAMPTZ,
  profile_data   JSONB,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_uid)
);

CREATE TABLE mfa_backup_codes (
  code_id     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  code_hash   TEXT        NOT NULL,
  is_used     BOOLEAN     NOT NULL DEFAULT FALSE,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE password_reset_tokens (
  token_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  is_used     BOOLEAN     NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_reset_expiry CHECK (expires_at > created_at)
);

CREATE TABLE kyc_documents (
  kyc_id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  doc_type       id_doc_type NOT NULL,
  doc_number     VARCHAR(100) NOT NULL,
  doc_front_url  TEXT        NOT NULL,
  doc_back_url   TEXT,
  selfie_url     TEXT,
  status         verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by    UUID        REFERENCES users(user_id) ON DELETE SET NULL,
  verified_at    TIMESTAMPTZ,
  expires_at     DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, doc_type)
);

CREATE TABLE api_keys (
  key_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  key_prefix    VARCHAR(10)  NOT NULL,     -- first 8 chars shown in UI
  key_hash      TEXT         NOT NULL UNIQUE,
  scopes        TEXT[]       NOT NULL DEFAULT '{}',
  allowed_ips   INET[],
  rate_limit    INT          NOT NULL DEFAULT 1000, -- requests/hour
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  last_used_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- ============================================================
-- 5. ADDRESSES & GEOLOCATION
-- ============================================================

CREATE TABLE addresses (
  address_id     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  address_type   address_type NOT NULL DEFAULT 'home',
  label          VARCHAR(80),                  -- 'Office', 'Mom's place'
  line1          TEXT         NOT NULL,
  line2          TEXT,
  landmark       TEXT,
  city_id        UUID         NOT NULL REFERENCES cities(city_id),
  state_id       UUID         NOT NULL REFERENCES states(state_id),
  country_code   CHAR(2)      NOT NULL REFERENCES countries(country_code),
  postal_code    VARCHAR(20)  NOT NULL,
  location       GEOGRAPHY(POINT,4326),        -- lat/lng
  is_default     BOOLEAN      NOT NULL DEFAULT FALSE,
  is_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user     ON addresses(user_id);
CREATE INDEX idx_addresses_location ON addresses USING GIST(location);

CREATE TABLE service_zones (
  zone_id      UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id      UUID         NOT NULL REFERENCES cities(city_id),
  name         VARCHAR(150) NOT NULL,
  boundary     GEOGRAPHY(POLYGON,4326) NOT NULL,  -- deliverable area polygon
  delivery_fee money_amount NOT NULL DEFAULT 0,
  min_order    money_amount NOT NULL DEFAULT 0,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_service_zones_boundary ON service_zones USING GIST(boundary);

CREATE TABLE geofences (
  geofence_id  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  boundary     GEOGRAPHY(POLYGON,4326) NOT NULL,
  purpose      VARCHAR(50)  NOT NULL, -- 'restricted','surge_zone','premium'
  config_json  JSONB,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_geofences_boundary ON geofences USING GIST(boundary);


-- ============================================================
-- 6. MEDIA & FILE MANAGEMENT
-- ============================================================

CREATE TABLE media_files (
  file_id        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by    UUID        NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  entity_type    VARCHAR(80),          -- 'vendor','menu_item','review'…
  entity_id      UUID,
  media_type     media_type  NOT NULL,
  mime_type      VARCHAR(80) NOT NULL,
  original_name  VARCHAR(255),
  storage_key    TEXT        NOT NULL UNIQUE,  -- S3/GCS object key
  cdn_url        TEXT        NOT NULL,
  thumbnail_url  TEXT,
  file_size_bytes BIGINT     NOT NULL CHECK (file_size_bytes > 0),
  width_px       INT,
  height_px      INT,
  duration_secs  INT,
  is_public      BOOLEAN     NOT NULL DEFAULT TRUE,
  is_moderated   BOOLEAN     NOT NULL DEFAULT FALSE,
  moderation_result JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_entity ON media_files(entity_type, entity_id);


-- ============================================================
-- 7. VENDOR DOMAIN
-- ============================================================

CREATE TABLE vendors (
  vendor_id            UUID                NOT NULL DEFAULT uuid_generate_v4(),
  user_id              UUID                NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE RESTRICT,
  business_name        VARCHAR(200)        NOT NULL,
  business_type        business_type       NOT NULL DEFAULT 'sole_proprietor',
  slug                 VARCHAR(220)        NOT NULL UNIQUE,
  description          TEXT,
  tagline              VARCHAR(300),
  cuisine_types        TEXT[]              NOT NULL DEFAULT '{}',
  primary_location     GEOGRAPHY(POINT,4326),
  address_id           UUID                REFERENCES addresses(address_id) ON DELETE SET NULL,
  city_id              UUID                REFERENCES cities(city_id),
  service_zone_id      UUID                REFERENCES service_zones(zone_id),
  operating_hours      JSONB,               -- { mon:[{open:'08:00',close:'22:00'}] }
  holiday_schedule     JSONB,               -- [{ date:'2025-01-26', closed: true }]
  max_concurrent_orders INT                NOT NULL DEFAULT 10
                          CHECK (max_concurrent_orders > 0),
  avg_prep_time_mins   SMALLINT            NOT NULL DEFAULT 20
                          CHECK (avg_prep_time_mins > 0),
  min_order_amount     money_amount        NOT NULL DEFAULT 0,
  commission_rate      percentage          NOT NULL DEFAULT 15.00,
  verification_status  verification_status NOT NULL DEFAULT 'not_submitted',
  is_active            BOOLEAN             NOT NULL DEFAULT FALSE,
  is_featured          BOOLEAN             NOT NULL DEFAULT FALSE,
  hygiene_score        rating_value        NOT NULL DEFAULT 0,
  avg_rating           rating_value        NOT NULL DEFAULT 0,
  total_orders         INT                 NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  total_revenue        money_amount        NOT NULL DEFAULT 0,
  bank_account_id      UUID,               -- FK added after bank_accounts table
  gstin                VARCHAR(20),        -- India GST or local tax ID
  pan_number           VARCHAR(20),
  onboarded_at         TIMESTAMPTZ,
  suspended_at         TIMESTAMPTZ,
  suspension_reason    TEXT,
  created_at           TIMESTAMPTZ         NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ         NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ,
  CONSTRAINT pk_vendors PRIMARY KEY (vendor_id)
);
CREATE INDEX idx_vendors_location   ON vendors USING GIST(primary_location);
CREATE INDEX idx_vendors_city       ON vendors(city_id, is_active);
CREATE INDEX idx_vendors_status     ON vendors(verification_status, is_active);
CREATE INDEX idx_vendors_rating     ON vendors(avg_rating DESC) WHERE is_active = TRUE;
CREATE INDEX idx_vendors_featured   ON vendors(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_vendors_slug       ON vendors(slug);
CREATE INDEX idx_vendors_deleted    ON vendors(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE vendor_licenses (
  license_id       UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id        UUID         NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  license_type     license_type NOT NULL,
  license_number   VARCHAR(150) NOT NULL,
  license_name     VARCHAR(200),
  issued_by        VARCHAR(200) NOT NULL,
  issued_at        DATE         NOT NULL,
  expires_at       DATE         CHECK (expires_at > issued_at),
  is_mandatory     BOOLEAN      NOT NULL DEFAULT TRUE,
  document_file_id UUID         REFERENCES media_files(file_id),
  status           verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by      UUID         REFERENCES users(user_id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, license_type, license_number)
);
CREATE INDEX idx_vlic_vendor   ON vendor_licenses(vendor_id, status);
CREATE INDEX idx_vlic_expiry   ON vendor_licenses(expires_at) WHERE status = 'verified';

CREATE TABLE vendor_hygiene_audits (
  audit_id        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id       UUID        NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  auditor_id      UUID        REFERENCES users(user_id) ON DELETE SET NULL,
  audit_type      VARCHAR(50) NOT NULL, -- 'self','third_party','government'
  score           rating_value NOT NULL,
  checklist_json  JSONB,               -- detailed line-item results
  notes           TEXT,
  report_file_id  UUID        REFERENCES media_files(file_id),
  audit_date      DATE        NOT NULL,
  next_audit_date DATE        CHECK (next_audit_date > audit_date),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vendor_bank_accounts (
  account_id     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id      UUID         NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  account_name   VARCHAR(200) NOT NULL,
  account_number VARCHAR(30)  NOT NULL,     -- stored encrypted in practice
  ifsc_code      VARCHAR(20),               -- India IFSC
  swift_code     VARCHAR(20),
  bank_name      VARCHAR(200) NOT NULL,
  branch_name    VARCHAR(200),
  account_type   VARCHAR(30)  NOT NULL DEFAULT 'current',
  country_code   CHAR(2)      NOT NULL REFERENCES countries(country_code),
  currency_code  currency_code NOT NULL,
  is_primary     BOOLEAN      NOT NULL DEFAULT FALSE,
  is_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
  verified_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Back-fill FK on vendors now that vendor_bank_accounts exists
ALTER TABLE vendors
  ADD CONSTRAINT fk_vendors_bank
  FOREIGN KEY (bank_account_id) REFERENCES vendor_bank_accounts(account_id) ON DELETE SET NULL;

CREATE TABLE vendor_operating_zones (
  zone_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id     UUID        NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  service_zone_id UUID      NOT NULL REFERENCES service_zones(zone_id),
  extra_fee     money_amount NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  UNIQUE(vendor_id, service_zone_id)
);

CREATE TABLE vendor_followers (
  vendor_id    UUID        NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  customer_id  UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  followed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (vendor_id, customer_id)
);


-- ============================================================
-- 8. SUPPLIER DOMAIN
-- ============================================================

CREATE TABLE suppliers (
  supplier_id         UUID                NOT NULL DEFAULT uuid_generate_v4(),
  user_id             UUID                NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE RESTRICT,
  business_name       VARCHAR(200)        NOT NULL,
  business_type       business_type       NOT NULL DEFAULT 'sole_proprietor',
  slug                VARCHAR(220)        NOT NULL UNIQUE,
  description         TEXT,
  primary_location    GEOGRAPHY(POINT,4326),
  address_id          UUID                REFERENCES addresses(address_id),
  city_id             UUID                REFERENCES cities(city_id),
  coverage_radius_km  NUMERIC(8,2)        CHECK (coverage_radius_km > 0),
  coverage_area       GEOGRAPHY(POLYGON,4326),
  verification_status verification_status NOT NULL DEFAULT 'not_submitted',
  avg_rating          rating_value        NOT NULL DEFAULT 0,
  on_time_delivery_pct percentage         NOT NULL DEFAULT 100,
  gstin               VARCHAR(20),
  is_active           BOOLEAN             NOT NULL DEFAULT FALSE,
  bank_account_id     UUID,
  created_at          TIMESTAMPTZ         NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ         NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ,
  CONSTRAINT pk_suppliers PRIMARY KEY (supplier_id)
);
CREATE INDEX idx_suppliers_location ON suppliers USING GIST(primary_location);
CREATE INDEX idx_suppliers_coverage ON suppliers USING GIST(coverage_area);
CREATE INDEX idx_suppliers_city     ON suppliers(city_id, is_active);

CREATE TABLE supplier_licenses (
  license_id       UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id      UUID         NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
  license_type     license_type NOT NULL,
  license_number   VARCHAR(150) NOT NULL,
  issued_by        VARCHAR(200) NOT NULL,
  issued_at        DATE         NOT NULL,
  expires_at       DATE         CHECK (expires_at > issued_at),
  document_file_id UUID         REFERENCES media_files(file_id),
  status           verification_status NOT NULL DEFAULT 'pending',
  verified_by      UUID         REFERENCES users(user_id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, license_type, license_number)
);

CREATE TABLE vendor_supplier_links (
  link_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id     UUID        NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  supplier_id   UUID        NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
  is_preferred  BOOLEAN     NOT NULL DEFAULT FALSE,
  credit_limit  money_amount NOT NULL DEFAULT 0,
  payment_terms VARCHAR(100),      -- 'NET30','COD','advance'
  linked_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, supplier_id)
);


-- ============================================================
-- 9. RAW MATERIALS & INVENTORY
-- ============================================================

CREATE TABLE raw_materials (
  material_id        UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id        UUID              NOT NULL REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
  name               VARCHAR(200)      NOT NULL,
  code               VARCHAR(50)       UNIQUE,
  category           material_category NOT NULL,
  description        TEXT,
  unit_id            UUID              NOT NULL REFERENCES measurement_units(unit_id),
  unit_price         money_amount      NOT NULL CHECK (unit_price > 0),
  tax_rate_id        UUID              REFERENCES tax_rates(tax_rate_id),
  min_order_qty      positive_qty      NOT NULL DEFAULT 1,
  max_order_qty      positive_qty,
  shelf_life_days    INT               CHECK (shelf_life_days > 0),
  storage_conditions TEXT,
  allergen_ids       UUID[]            NOT NULL DEFAULT '{}',
  is_perishable      BOOLEAN           NOT NULL DEFAULT FALSE,
  is_organic         BOOLEAN           NOT NULL DEFAULT FALSE,
  is_active          BOOLEAN           NOT NULL DEFAULT TRUE,
  image_file_id      UUID              REFERENCES media_files(file_id),
  created_at         TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ       NOT NULL DEFAULT now(),
  CONSTRAINT chk_max_order CHECK (max_order_qty IS NULL OR max_order_qty >= min_order_qty)
);
CREATE INDEX idx_rawmat_supplier ON raw_materials(supplier_id, is_active);
CREATE INDEX idx_rawmat_category ON raw_materials(category);

CREATE TABLE inventory (
  inventory_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id           UUID         NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  material_id         UUID         NOT NULL REFERENCES raw_materials(material_id) ON DELETE RESTRICT,
  quantity_on_hand    non_neg_qty  NOT NULL DEFAULT 0,
  reserved_quantity   non_neg_qty  NOT NULL DEFAULT 0,  -- committed to active POs
  reorder_threshold   positive_qty NOT NULL,
  reorder_quantity    positive_qty NOT NULL,
  max_stock_level     positive_qty,
  avg_cost_price      money_amount NOT NULL DEFAULT 0,   -- weighted average
  last_restocked_at   TIMESTAMPTZ,
  last_updated        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, material_id),
  CONSTRAINT chk_reserved CHECK (reserved_quantity <= quantity_on_hand),
  CONSTRAINT chk_max_stock CHECK (max_stock_level IS NULL OR max_stock_level > reorder_threshold)
);
CREATE INDEX idx_inventory_vendor   ON inventory(vendor_id);
CREATE INDEX idx_inventory_low      ON inventory(vendor_id)
  WHERE quantity_on_hand <= reorder_threshold;

CREATE TABLE inventory_transactions (
  txn_id          UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id    UUID                  NOT NULL REFERENCES inventory(inventory_id) ON DELETE RESTRICT,
  vendor_id       UUID                  NOT NULL REFERENCES vendors(vendor_id),
  txn_type        inventory_txn_type    NOT NULL,
  quantity_delta  NUMERIC(14,3)         NOT NULL,  -- positive=in, negative=out
  quantity_before non_neg_qty           NOT NULL,
  quantity_after  non_neg_qty           NOT NULL,
  unit_cost       money_amount,
  reference_type  VARCHAR(60),          -- 'purchase_order','order','adjustment'
  reference_id    UUID,
  notes           TEXT,
  created_by      UUID                  NOT NULL REFERENCES users(user_id),
  created_at      TIMESTAMPTZ           NOT NULL DEFAULT now(),
  CONSTRAINT chk_qty_after
    CHECK (quantity_after = quantity_before + quantity_delta)
);
CREATE INDEX idx_invtxn_inventory ON inventory_transactions(inventory_id, created_at DESC);
CREATE INDEX idx_invtxn_vendor    ON inventory_transactions(vendor_id, created_at DESC);

CREATE TABLE purchase_orders (
  po_id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number          VARCHAR(30) NOT NULL UNIQUE,   -- human-readable 'PO-2025-00001'
  vendor_id          UUID        NOT NULL REFERENCES vendors(vendor_id) ON DELETE RESTRICT,
  supplier_id        UUID        NOT NULL REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
  status             po_status   NOT NULL DEFAULT 'draft',
  currency_code      currency_code NOT NULL DEFAULT 'INR',
  subtotal           money_amount NOT NULL DEFAULT 0,
  tax_amount         money_amount NOT NULL DEFAULT 0,
  shipping_cost      money_amount NOT NULL DEFAULT 0,
  total_amount       money_amount NOT NULL DEFAULT 0,
  notes              TEXT,
  expected_delivery  DATE,
  actual_delivery    DATE,
  delivery_address_id UUID       REFERENCES addresses(address_id),
  approved_by        UUID        REFERENCES users(user_id) ON DELETE SET NULL,
  approved_at        TIMESTAMPTZ,
  submitted_at       TIMESTAMPTZ,
  fulfilled_at       TIMESTAMPTZ,
  created_by         UUID        NOT NULL REFERENCES users(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_po_total
    CHECK (total_amount = subtotal + tax_amount + shipping_cost),
  CONSTRAINT chk_po_delivery
    CHECK (expected_delivery IS NULL OR actual_delivery IS NULL
           OR actual_delivery >= expected_delivery::DATE - 7)
);
CREATE INDEX idx_po_vendor   ON purchase_orders(vendor_id, status);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id, status);

CREATE TABLE purchase_order_items (
  po_item_id     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id          UUID         NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
  material_id    UUID         NOT NULL REFERENCES raw_materials(material_id) ON DELETE RESTRICT,
  quantity       positive_qty NOT NULL,
  unit_id        UUID         NOT NULL REFERENCES measurement_units(unit_id),
  unit_price     money_amount NOT NULL CHECK (unit_price > 0),
  tax_rate_id    UUID         REFERENCES tax_rates(tax_rate_id),
  tax_amount     money_amount NOT NULL DEFAULT 0,
  line_total     money_amount NOT NULL,
  qty_received   non_neg_qty  NOT NULL DEFAULT 0,
  notes          TEXT,
  CONSTRAINT chk_poi_line_total
    CHECK (line_total = quantity * unit_price + tax_amount),
  CONSTRAINT chk_poi_received
    CHECK (qty_received <= quantity)
);


-- ============================================================
-- 10. MENU & FOOD
-- ============================================================

CREATE TABLE menu_items (
  item_id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id         UUID         NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  category_id       UUID         REFERENCES food_categories(category_id) ON DELETE SET NULL,
  name              VARCHAR(200) NOT NULL,
  slug              VARCHAR(220) NOT NULL,
  description       TEXT,
  ingredients_text  TEXT,
  preparation_time_mins SMALLINT CHECK (preparation_time_mins > 0),
  serving_size      VARCHAR(80),
  calories          SMALLINT     CHECK (calories >= 0),
  price             money_amount NOT NULL CHECK (price > 0),
  compare_at_price  money_amount CHECK (compare_at_price > price),  -- for strike-through
  tax_rate_id       UUID         REFERENCES tax_rates(tax_rate_id),
  cover_image_id    UUID         REFERENCES media_files(file_id),
  sort_order        INT          NOT NULL DEFAULT 0,
  is_available      BOOLEAN      NOT NULL DEFAULT TRUE,
  is_featured       BOOLEAN      NOT NULL DEFAULT FALSE,
  available_from    TIME,                    -- daily availability window
  available_until   TIME,
  avg_rating        rating_value NOT NULL DEFAULT 0,
  total_orders      INT          NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(vendor_id, slug),
  CONSTRAINT chk_availability_window
    CHECK (available_from IS NULL OR available_until IS NULL
           OR available_until > available_from)
);
CREATE INDEX idx_menu_vendor   ON menu_items(vendor_id, is_available) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_category ON menu_items(category_id);
CREATE INDEX idx_menu_featured ON menu_items(is_featured) WHERE is_featured = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_menu_search   ON menu_items USING GIN(to_tsvector('english', name || ' ' || COALESCE(description,'')));

CREATE TABLE menu_item_images (
  image_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id     UUID        NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  file_id     UUID        NOT NULL REFERENCES media_files(file_id),
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE menu_item_allergens (
  item_id     UUID NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  allergen_id UUID NOT NULL REFERENCES allergens(allergen_id) ON DELETE CASCADE,
  is_contains BOOLEAN NOT NULL DEFAULT TRUE,  -- FALSE = may_contain (cross-contamination)
  PRIMARY KEY (item_id, allergen_id)
);

CREATE TABLE menu_item_dietary_tags (
  item_id UUID NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES dietary_tags(tag_id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

CREATE TABLE menu_item_ingredients (
  ingredient_id UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id       UUID         NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  material_id   UUID         REFERENCES raw_materials(material_id) ON DELETE SET NULL,
  ingredient_name VARCHAR(200) NOT NULL,    -- denormalised for display
  quantity      positive_qty,
  unit_id       UUID         REFERENCES measurement_units(unit_id),
  is_optional   BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order    INT          NOT NULL DEFAULT 0
);

CREATE TABLE menu_item_variants (
  variant_id    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id       UUID         NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,      -- 'Small','Large','Spicy'
  sku           VARCHAR(80),
  price_delta   NUMERIC(10,2) NOT NULL DEFAULT 0,  -- added to base price
  is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
  is_available  BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order    INT          NOT NULL DEFAULT 0
);

CREATE TABLE menu_item_customizations (
  customization_id UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id          UUID         NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  group_name       VARCHAR(100) NOT NULL,   -- 'Extra toppings', 'Spice level'
  is_required      BOOLEAN      NOT NULL DEFAULT FALSE,
  min_selections   SMALLINT     NOT NULL DEFAULT 0 CHECK (min_selections >= 0),
  max_selections   SMALLINT     NOT NULL DEFAULT 1 CHECK (max_selections >= 1),
  sort_order       INT          NOT NULL DEFAULT 0,
  CONSTRAINT chk_selection_range CHECK (max_selections >= min_selections)
);

CREATE TABLE menu_customization_options (
  option_id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  customization_id   UUID         NOT NULL REFERENCES menu_item_customizations(customization_id) ON DELETE CASCADE,
  name               VARCHAR(100) NOT NULL,
  extra_price        money_amount NOT NULL DEFAULT 0,
  is_available       BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order         INT          NOT NULL DEFAULT 0
);

-- Flat time-based pricing overrides (happy hour, etc.)
CREATE TABLE menu_item_pricing_rules (
  rule_id       UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id       UUID         NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  price         money_amount NOT NULL CHECK (price > 0),
  valid_from    TIMESTAMPTZ  NOT NULL,
  valid_until   TIMESTAMPTZ  NOT NULL,
  days_of_week  SMALLINT[]   NOT NULL DEFAULT '{0,1,2,3,4,5,6}',  -- 0=Sun
  time_from     TIME,
  time_until    TIME,
  priority      INT          NOT NULL DEFAULT 0,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_price_rule_dates CHECK (valid_until > valid_from)
);


-- ============================================================
-- 11. CUSTOMER PROFILES & PREFERENCES
-- ============================================================

CREATE TABLE customer_profiles (
  profile_id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID         NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  full_name           VARCHAR(150) NOT NULL,
  display_name        VARCHAR(80),
  avatar_file_id      UUID         REFERENCES media_files(file_id),
  date_of_birth       DATE         CHECK (date_of_birth < CURRENT_DATE),
  gender              gender,
  default_address_id  UUID         REFERENCES addresses(address_id) ON DELETE SET NULL,
  loyalty_points      INT          NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  lifetime_value      money_amount NOT NULL DEFAULT 0,
  total_orders        INT          NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  tier                VARCHAR(20)  NOT NULL DEFAULT 'bronze',  -- bronze/silver/gold/platinum
  marketing_consent   BOOLEAN      NOT NULL DEFAULT FALSE,
  push_consent        BOOLEAN      NOT NULL DEFAULT TRUE,
  sms_consent         BOOLEAN      NOT NULL DEFAULT TRUE,
  email_consent       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE customer_dietary_preferences (
  preference_id UUID    NOT NULL DEFAULT uuid_generate_v4(),
  user_id       UUID    NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tag_id        UUID    NOT NULL REFERENCES dietary_tags(tag_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, tag_id)
);

CREATE TABLE customer_allergen_alerts (
  user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  allergen_id UUID NOT NULL REFERENCES allergens(allergen_id) ON DELETE CASCADE,
  severity    VARCHAR(20) NOT NULL DEFAULT 'intolerance', -- 'allergy','intolerance'
  PRIMARY KEY (user_id, allergen_id)
);

CREATE TABLE customer_wishlists (
  wishlist_id  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL DEFAULT 'Favourites',
  is_default   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wishlist_items (
  wishlist_item_id UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id      UUID        NOT NULL REFERENCES customer_wishlists(wishlist_id) ON DELETE CASCADE,
  item_id          UUID        NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  added_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, item_id)
);

CREATE TABLE customer_saved_vendors (
  user_id    UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  vendor_id  UUID        NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, vendor_id)
);

CREATE TABLE loyalty_transactions (
  txn_id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  points_delta    INT         NOT NULL,              -- positive=earn, negative=redeem
  points_before   INT         NOT NULL CHECK (points_before >= 0),
  points_after    INT         NOT NULL CHECK (points_after >= 0),
  txn_type        VARCHAR(30) NOT NULL, -- 'earn_order','redeem','expire','bonus','refund'
  reference_type  VARCHAR(60),
  reference_id    UUID,
  description     TEXT,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_loy_after CHECK (points_after = points_before + points_delta)
);
CREATE INDEX idx_loyalty_user ON loyalty_transactions(user_id, created_at DESC);


-- ============================================================
-- 12. PROMOTIONS & COUPONS
-- ============================================================

CREATE TABLE promotions (
  promo_id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(200)  NOT NULL,
  description       TEXT,
  promo_type        promo_type    NOT NULL,
  applies_to        promo_applies_to NOT NULL DEFAULT 'all',
  code              VARCHAR(50)   UNIQUE,              -- NULL = auto-applied
  discount_value    NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  is_percentage     BOOLEAN       NOT NULL DEFAULT TRUE,
  max_discount_cap  money_amount,                      -- cap for % discounts
  min_order_amount  money_amount  NOT NULL DEFAULT 0,
  max_uses_total    INT           CHECK (max_uses_total > 0),
  max_uses_per_user INT           NOT NULL DEFAULT 1 CHECK (max_uses_per_user > 0),
  current_uses      INT           NOT NULL DEFAULT 0 CHECK (current_uses >= 0),
  valid_from        TIMESTAMPTZ   NOT NULL,
  valid_until       TIMESTAMPTZ   NOT NULL,
  target_ids        UUID[]        NOT NULL DEFAULT '{}', -- vendor/category/item IDs
  city_ids          UUID[]        NOT NULL DEFAULT '{}', -- restrict to cities
  user_tiers        TEXT[]        NOT NULL DEFAULT '{}', -- 'gold','platinum'
  is_stackable      BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  created_by        UUID          NOT NULL REFERENCES users(user_id),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_promo_dates CHECK (valid_until > valid_from),
  CONSTRAINT chk_promo_uses CHECK (max_uses_total IS NULL OR current_uses <= max_uses_total)
);
CREATE INDEX idx_promo_code   ON promotions(code) WHERE code IS NOT NULL;
CREATE INDEX idx_promo_active ON promotions(valid_from, valid_until, is_active);

CREATE TABLE promotion_usages (
  usage_id      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_id      UUID        NOT NULL REFERENCES promotions(promo_id) ON DELETE RESTRICT,
  user_id       UUID        NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  order_id      UUID,                                    -- FK added after orders table
  discount_given money_amount NOT NULL,
  used_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(promo_id, user_id, order_id)
);
CREATE INDEX idx_promo_usage_user  ON promotion_usages(user_id);
CREATE INDEX idx_promo_usage_promo ON promotion_usages(promo_id);

CREATE TABLE referral_rewards (
  reward_id      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id    UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  referee_id     UUID        NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  promo_id       UUID        REFERENCES promotions(promo_id),
  referrer_points INT        NOT NULL DEFAULT 0,
  referee_points  INT        NOT NULL DEFAULT 0,
  status         VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending','credited','expired'
  credited_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_no_self_referral CHECK (referrer_id <> referee_id)
);


-- ============================================================
-- 13. ORDERS & FULFILMENT
-- ============================================================

CREATE TABLE carts (
  cart_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  vendor_id     UUID        REFERENCES vendors(vendor_id) ON DELETE SET NULL,
  promo_id      UUID        REFERENCES promotions(promo_id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  cart_item_id       UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id            UUID         NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
  item_id            UUID         NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
  variant_id         UUID         REFERENCES menu_item_variants(variant_id),
  quantity           INT          NOT NULL CHECK (quantity > 0),
  customizations     JSONB,        -- selected options snapshot
  special_instructions TEXT,
  added_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(cart_id, item_id, variant_id)
);

CREATE TABLE orders (
  order_id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        VARCHAR(30)   NOT NULL UNIQUE,     -- 'ORD-2025-000001'
  customer_id         UUID          NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  vendor_id           UUID          NOT NULL REFERENCES vendors(vendor_id) ON DELETE RESTRICT,
  order_type          order_type    NOT NULL DEFAULT 'delivery',
  status              order_status  NOT NULL DEFAULT 'pending',
  delivery_address_id UUID          REFERENCES addresses(address_id) ON DELETE SET NULL,
  delivery_location   GEOGRAPHY(POINT,4326),
  subtotal            money_amount  NOT NULL,
  tax_amount          money_amount  NOT NULL DEFAULT 0,
  delivery_fee        money_amount  NOT NULL DEFAULT 0,
  promo_discount      money_amount  NOT NULL DEFAULT 0,
  loyalty_discount    money_amount  NOT NULL DEFAULT 0,
  total_amount        money_amount  NOT NULL,
  currency_code       currency_code NOT NULL DEFAULT 'INR',
  promo_id            UUID          REFERENCES promotions(promo_id) ON DELETE SET NULL,
  loyalty_points_used INT           NOT NULL DEFAULT 0 CHECK (loyalty_points_used >= 0),
  loyalty_points_earned INT         NOT NULL DEFAULT 0 CHECK (loyalty_points_earned >= 0),
  special_instructions TEXT,
  estimated_ready_at  TIMESTAMPTZ,
  estimated_delivery_at TIMESTAMPTZ,
  placed_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
  confirmed_at        TIMESTAMPTZ,
  ready_at            TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason cancellation_reason,
  cancellation_note   TEXT,
  ip_address          INET,
  platform            VARCHAR(30)   NOT NULL DEFAULT 'app',  -- 'app','web','pos'
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_order_total
    CHECK (total_amount = subtotal + tax_amount + delivery_fee
                        - promo_discount - loyalty_discount),
  CONSTRAINT chk_order_timeline
    CHECK (confirmed_at IS NULL OR confirmed_at >= placed_at),
  CONSTRAINT chk_order_delivered
    CHECK (delivered_at IS NULL OR delivered_at >= placed_at),
  CONSTRAINT chk_order_completed
    CHECK (completed_at IS NULL OR completed_at >= placed_at)
);
CREATE INDEX idx_orders_customer   ON orders(customer_id, placed_at DESC);
CREATE INDEX idx_orders_vendor     ON orders(vendor_id, placed_at DESC);
CREATE INDEX idx_orders_status     ON orders(status, placed_at DESC);
CREATE INDEX idx_orders_location   ON orders USING GIST(delivery_location);
CREATE INDEX idx_orders_platform   ON orders(platform, placed_at DESC);

CREATE TABLE order_items (
  order_item_id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID         NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  item_id               UUID         NOT NULL REFERENCES menu_items(item_id) ON DELETE RESTRICT,
  variant_id            UUID         REFERENCES menu_item_variants(variant_id),
  item_name_snapshot    VARCHAR(200) NOT NULL,       -- denormalised at time of order
  variant_name_snapshot VARCHAR(100),
  quantity              INT          NOT NULL CHECK (quantity > 0),
  unit_price_snapshot   money_amount NOT NULL,
  customizations_snapshot JSONB,
  customization_total   money_amount NOT NULL DEFAULT 0,
  line_total            money_amount NOT NULL,
  special_instructions  TEXT,
  CONSTRAINT chk_oi_line_total
    CHECK (line_total = quantity * (unit_price_snapshot + customization_total))
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_status_history (
  history_id  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID         NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  changed_by  UUID         REFERENCES users(user_id) ON DELETE SET NULL,
  notes       TEXT,
  changed_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_osh_order ON order_status_history(order_id, changed_at DESC);

-- Back-fill FK from promotion_usages to orders
ALTER TABLE promotion_usages
  ADD CONSTRAINT fk_promo_usage_order
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL;


-- ============================================================
-- 14. PAYMENTS & FINANCIALS
-- ============================================================

CREATE TABLE payments (
  payment_id        UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_ref       VARCHAR(30)    NOT NULL UNIQUE,      -- 'PAY-2025-000001'
  order_id          UUID           NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE RESTRICT,
  user_id           UUID           NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  method            payment_method NOT NULL,
  status            payment_status NOT NULL DEFAULT 'initiated',
  amount            money_amount   NOT NULL CHECK (amount > 0),
  currency_code     currency_code  NOT NULL DEFAULT 'INR',
  gateway           VARCHAR(50)    NOT NULL,   -- 'razorpay','stripe','payu'
  gateway_order_id  VARCHAR(200),
  gateway_payment_id VARCHAR(200)  UNIQUE,
  gateway_signature  TEXT,
  gateway_response  JSONB,
  wallet_id         UUID,                      -- FK to wallets if method='wallet'
  initiated_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),
  authorised_at     TIMESTAMPTZ,
  captured_at       TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  failure_code      VARCHAR(100),
  failure_message   TEXT,
  ip_address        INET,
  device_fingerprint TEXT,
  is_flagged        BOOLEAN        NOT NULL DEFAULT FALSE,
  fraud_score       NUMERIC(5,4)   CHECK (fraud_score BETWEEN 0 AND 1),
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order   ON payments(order_id);
CREATE INDEX idx_payments_user    ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_gateway ON payments(gateway, gateway_payment_id);
CREATE INDEX idx_payments_status  ON payments(status, created_at DESC);

CREATE TABLE refunds (
  refund_id         UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  refund_ref        VARCHAR(30)    NOT NULL UNIQUE,
  payment_id        UUID           NOT NULL REFERENCES payments(payment_id) ON DELETE RESTRICT,
  order_id          UUID           NOT NULL REFERENCES orders(order_id) ON DELETE RESTRICT,
  initiated_by      UUID           NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  reason            TEXT           NOT NULL,
  amount            money_amount   NOT NULL CHECK (amount > 0),
  status            payment_status NOT NULL DEFAULT 'refund_pending',
  gateway_refund_id VARCHAR(200)   UNIQUE,
  gateway_response  JSONB,
  notes             TEXT,
  initiated_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),
  processed_at      TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  failure_reason    TEXT
);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_order   ON refunds(order_id);

CREATE TABLE wallets (
  wallet_id     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID         NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  balance       money_amount NOT NULL DEFAULT 0,
  currency_code currency_code NOT NULL DEFAULT 'INR',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Back-fill FK in payments
ALTER TABLE payments
  ADD CONSTRAINT fk_payments_wallet
  FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE SET NULL;

CREATE TABLE wallet_transactions (
  wallet_txn_id   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id       UUID         NOT NULL REFERENCES wallets(wallet_id) ON DELETE RESTRICT,
  amount_delta    NUMERIC(14,2) NOT NULL,             -- positive=credit, negative=debit
  balance_before  money_amount NOT NULL,
  balance_after   money_amount NOT NULL,
  txn_type        VARCHAR(40)  NOT NULL,   -- 'top_up','order_payment','refund','cashback'
  reference_type  VARCHAR(60),
  reference_id    UUID,
  description     TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT chk_wallet_after
    CHECK (balance_after = balance_before + amount_delta),
  CONSTRAINT chk_wallet_balance
    CHECK (balance_after >= 0)
);
CREATE INDEX idx_wallet_txn ON wallet_transactions(wallet_id, created_at DESC);

CREATE TABLE vendor_payouts (
  payout_id      UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  payout_ref     VARCHAR(30)  NOT NULL UNIQUE,
  vendor_id      UUID         NOT NULL REFERENCES vendors(vendor_id) ON DELETE RESTRICT,
  bank_account_id UUID        NOT NULL REFERENCES vendor_bank_accounts(account_id),
  period_from    TIMESTAMPTZ  NOT NULL,
  period_to      TIMESTAMPTZ  NOT NULL,
  gross_amount   money_amount NOT NULL,
  commission_amt money_amount NOT NULL,
  tax_deducted   money_amount NOT NULL DEFAULT 0,
  net_amount     money_amount NOT NULL,
  currency_code  currency_code NOT NULL DEFAULT 'INR',
  status         VARCHAR(30)  NOT NULL DEFAULT 'pending',  -- pending/processing/paid/failed
  gateway_txn_id VARCHAR(200),
  paid_at        TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT chk_payout_period CHECK (period_to > period_from),
  CONSTRAINT chk_payout_net
    CHECK (net_amount = gross_amount - commission_amt - tax_deducted)
);
CREATE INDEX idx_payout_vendor ON vendor_payouts(vendor_id, created_at DESC);

CREATE TABLE payout_order_items (
  payout_id UUID NOT NULL REFERENCES vendor_payouts(payout_id) ON DELETE CASCADE,
  order_id  UUID NOT NULL REFERENCES orders(order_id) ON DELETE RESTRICT,
  order_amount money_amount NOT NULL,
  commission_amount money_amount NOT NULL,
  PRIMARY KEY (payout_id, order_id)
);


-- ============================================================
-- 15. DELIVERY & DRIVER MANAGEMENT
-- ============================================================

CREATE TABLE drivers (
  driver_id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID         NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE RESTRICT,
  full_name          VARCHAR(150) NOT NULL,
  phone              phone_number NOT NULL,
  vehicle_type       vehicle_type NOT NULL,
  vehicle_number     VARCHAR(30)  NOT NULL,
  vehicle_model      VARCHAR(100),
  license_number     VARCHAR(50)  NOT NULL UNIQUE,
  license_expiry     DATE         NOT NULL,
  is_verified        BOOLEAN      NOT NULL DEFAULT FALSE,
  is_online          BOOLEAN      NOT NULL DEFAULT FALSE,
  is_available       BOOLEAN      NOT NULL DEFAULT FALSE,
  current_location   GEOGRAPHY(POINT,4326),
  city_id            UUID         NOT NULL REFERENCES cities(city_id),
  avg_rating         rating_value NOT NULL DEFAULT 0,
  total_deliveries   INT          NOT NULL DEFAULT 0 CHECK (total_deliveries >= 0),
  account_status     account_status NOT NULL DEFAULT 'pending_verification',
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_drivers_location  ON drivers USING GIST(current_location);
CREATE INDEX idx_drivers_available ON drivers(is_online, is_available, city_id);

CREATE TABLE driver_documents (
  doc_id        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id     UUID        NOT NULL REFERENCES drivers(driver_id) ON DELETE CASCADE,
  doc_type      VARCHAR(50) NOT NULL,    -- 'driving_license','rc_book','insurance','puc'
  doc_number    VARCHAR(100),
  file_id       UUID        NOT NULL REFERENCES media_files(file_id),
  expires_at    DATE,
  is_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
  verified_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, doc_type)
);

CREATE TABLE deliveries (
  delivery_id        UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id           UUID            NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE RESTRICT,
  driver_id          UUID            REFERENCES drivers(driver_id) ON DELETE SET NULL,
  status             delivery_status NOT NULL DEFAULT 'pending_assignment',
  pickup_location    GEOGRAPHY(POINT,4326),
  dropoff_location   GEOGRAPHY(POINT,4326),
  pickup_address_snapshot  TEXT,
  dropoff_address_snapshot TEXT,
  assigned_at        TIMESTAMPTZ,
  picked_up_at       TIMESTAMPTZ,
  delivered_at       TIMESTAMPTZ,
  failed_at          TIMESTAMPTZ,
  failure_reason     TEXT,
  distance_km        NUMERIC(8,2),
  estimated_duration_mins SMALLINT,
  actual_duration_mins    SMALLINT,
  route_polyline     TEXT,             -- encoded Google polyline
  delivery_otp       VARCHAR(10),
  delivery_proof_file_id UUID         REFERENCES media_files(file_id),
  driver_rating      rating_value,
  driver_tip         money_amount     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ      NOT NULL DEFAULT now()
);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id, status);
CREATE INDEX idx_deliveries_status ON deliveries(status);

CREATE TABLE driver_location_history (
  location_id  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id    UUID        NOT NULL REFERENCES drivers(driver_id) ON DELETE CASCADE,
  delivery_id  UUID        REFERENCES deliveries(delivery_id) ON DELETE SET NULL,
  location     GEOGRAPHY(POINT,4326) NOT NULL,
  speed_kmh    NUMERIC(6,2),
  heading_deg  NUMERIC(5,2),
  accuracy_m   NUMERIC(6,2),
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dloc_driver  ON driver_location_history(driver_id, recorded_at DESC);
CREATE INDEX idx_dloc_geo     ON driver_location_history USING GIST(location);

CREATE TABLE driver_earnings (
  earning_id    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id     UUID         NOT NULL REFERENCES drivers(driver_id) ON DELETE RESTRICT,
  delivery_id   UUID         NOT NULL UNIQUE REFERENCES deliveries(delivery_id),
  base_pay      money_amount NOT NULL CHECK (base_pay >= 0),
  distance_pay  money_amount NOT NULL DEFAULT 0,
  tip           money_amount NOT NULL DEFAULT 0,
  bonus         money_amount NOT NULL DEFAULT 0,
  deduction     money_amount NOT NULL DEFAULT 0,
  total         money_amount NOT NULL,
  currency_code currency_code NOT NULL DEFAULT 'INR',
  paid_out      BOOLEAN      NOT NULL DEFAULT FALSE,
  payout_id     UUID,                              -- link to batch payout later
  earned_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT chk_driver_total
    CHECK (total = base_pay + distance_pay + tip + bonus - deduction)
);
CREATE INDEX idx_driver_earnings ON driver_earnings(driver_id, earned_at DESC);


-- ============================================================
-- 16. RATINGS & REVIEWS
-- ============================================================

CREATE TABLE ratings (
  rating_id      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id    UUID          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  order_id       UUID          NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  target_type    rating_target NOT NULL,
  target_id      UUID          NOT NULL,
  score          SMALLINT      NOT NULL CHECK (score BETWEEN 1 AND 5),
  food_quality   SMALLINT      CHECK (food_quality BETWEEN 1 AND 5),
  hygiene_score  SMALLINT      CHECK (hygiene_score BETWEEN 1 AND 5),
  packaging      SMALLINT      CHECK (packaging BETWEEN 1 AND 5),
  value_for_money SMALLINT     CHECK (value_for_money BETWEEN 1 AND 5),
  delivery_score SMALLINT      CHECK (delivery_score BETWEEN 1 AND 5),
  review_text    TEXT          CHECK (LENGTH(review_text) <= 2000),
  status         review_status NOT NULL DEFAULT 'pending_moderation',
  is_anonymous   BOOLEAN       NOT NULL DEFAULT FALSE,
  moderated_by   UUID          REFERENCES users(user_id) ON DELETE SET NULL,
  moderated_at   TIMESTAMPTZ,
  moderation_note TEXT,
  helpful_count  INT           NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  reported_count INT           NOT NULL DEFAULT 0 CHECK (reported_count >= 0),
  vendor_reply   TEXT,
  vendor_replied_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(customer_id, order_id, target_type, target_id)
);
CREATE INDEX idx_ratings_target  ON ratings(target_type, target_id, status);
CREATE INDEX idx_ratings_order   ON ratings(order_id);
CREATE INDEX idx_ratings_status  ON ratings(status);

CREATE TABLE rating_media (
  media_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating_id  UUID        NOT NULL REFERENCES ratings(rating_id) ON DELETE CASCADE,
  file_id    UUID        NOT NULL REFERENCES media_files(file_id),
  sort_order INT         NOT NULL DEFAULT 0
);

CREATE TABLE rating_helpfulness (
  rating_id  UUID        NOT NULL REFERENCES ratings(rating_id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  is_helpful BOOLEAN     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (rating_id, user_id)
);

CREATE TABLE rating_reports (
  report_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating_id   UUID        NOT NULL REFERENCES ratings(rating_id) ON DELETE CASCADE,
  reported_by UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reason      VARCHAR(80) NOT NULL,
  details     TEXT,
  status      VARCHAR(30) NOT NULL DEFAULT 'open',
  resolved_by UUID        REFERENCES users(user_id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rating_id, reported_by)
);


-- ============================================================
-- 17. NOTIFICATIONS
-- ============================================================

CREATE TABLE notification_templates (
  template_id   UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)          NOT NULL UNIQUE,
  type          notification_type     NOT NULL,
  channel       notification_channel  NOT NULL,
  locale        VARCHAR(10)           NOT NULL DEFAULT 'en',
  subject       VARCHAR(300),
  body_template TEXT                  NOT NULL,   -- Mustache/Jinja placeholders
  is_active     BOOLEAN               NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ           NOT NULL DEFAULT now(),
  UNIQUE(name, channel, locale)
);

CREATE TABLE notifications (
  notification_id UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID                  NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  template_id     UUID                  REFERENCES notification_templates(template_id),
  type            notification_type     NOT NULL,
  channel         notification_channel  NOT NULL,
  status          notification_status   NOT NULL DEFAULT 'queued',
  title           VARCHAR(300),
  body            TEXT                  NOT NULL,
  data_json       JSONB,               -- deep-link, metadata
  reference_type  VARCHAR(60),
  reference_id    UUID,
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  failure_reason  TEXT,
  retry_count     SMALLINT             NOT NULL DEFAULT 0,
  scheduled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ          NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user    ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notif_status  ON notifications(status, scheduled_at);
CREATE INDEX idx_notif_unread  ON notifications(user_id, read_at)
  WHERE read_at IS NULL AND status = 'delivered';

CREATE TABLE push_tokens (
  token_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  platform    VARCHAR(20) NOT NULL,    -- 'ios','android','web'
  device_id   VARCHAR(200),
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_push_user ON push_tokens(user_id, is_active);


-- ============================================================
-- 18. SUPPORT & TICKETING
-- ============================================================

CREATE TABLE support_tickets (
  ticket_id      UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number  VARCHAR(30)      NOT NULL UNIQUE,
  raised_by      UUID             NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  assigned_to    UUID             REFERENCES users(user_id) ON DELETE SET NULL,
  category       ticket_category  NOT NULL,
  priority       ticket_priority  NOT NULL DEFAULT 'medium',
  status         ticket_status    NOT NULL DEFAULT 'open',
  subject        VARCHAR(500)     NOT NULL,
  description    TEXT             NOT NULL,
  reference_type VARCHAR(60),
  reference_id   UUID,
  sla_due_at     TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at    TIMESTAMPTZ,
  closed_at      TIMESTAMPTZ,
  csat_score     SMALLINT         CHECK (csat_score BETWEEN 1 AND 5),
  csat_comment   TEXT,
  created_at     TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ      NOT NULL DEFAULT now()
);
CREATE INDEX idx_ticket_user     ON support_tickets(raised_by, created_at DESC);
CREATE INDEX idx_ticket_agent    ON support_tickets(assigned_to, status);
CREATE INDEX idx_ticket_status   ON support_tickets(status, priority, created_at);

CREATE TABLE ticket_messages (
  message_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id    UUID        NOT NULL REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
  sender_id    UUID        NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  body         TEXT        NOT NULL,
  is_internal  BOOLEAN     NOT NULL DEFAULT FALSE,  -- agent-only note
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ticket_attachments (
  attachment_id UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id     UUID        NOT NULL REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
  message_id    UUID        REFERENCES ticket_messages(message_id) ON DELETE SET NULL,
  file_id       UUID        NOT NULL REFERENCES media_files(file_id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 19. ANALYTICS & EVENTS
-- ============================================================

CREATE TABLE analytics_events (
  event_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        REFERENCES users(user_id) ON DELETE SET NULL,
  session_id     UUID        REFERENCES user_sessions(session_id) ON DELETE SET NULL,
  event_name     VARCHAR(100) NOT NULL,
  event_category VARCHAR(60) NOT NULL,
  entity_type    VARCHAR(60),
  entity_id      UUID,
  properties     JSONB       NOT NULL DEFAULT '{}',
  device_type    VARCHAR(30),
  platform       VARCHAR(30),
  app_version    VARCHAR(20),
  ip_address     INET,
  location       GEOGRAPHY(POINT,4326),
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (occurred_at);

-- Create quarterly partitions (extend as needed)
CREATE TABLE analytics_events_2025_q1 PARTITION OF analytics_events
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE analytics_events_2025_q2 PARTITION OF analytics_events
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE analytics_events_2025_q3 PARTITION OF analytics_events
  FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE analytics_events_2025_q4 PARTITION OF analytics_events
  FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE analytics_events_2026_q1 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE analytics_events_2026_q2 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
CREATE TABLE analytics_events_2026_q3 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE analytics_events_2026_q4 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

CREATE INDEX idx_ae_user     ON analytics_events(user_id, occurred_at DESC);
CREATE INDEX idx_ae_event    ON analytics_events(event_name, occurred_at DESC);
CREATE INDEX idx_ae_entity   ON analytics_events(entity_type, entity_id);

CREATE TABLE search_queries (
  query_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        REFERENCES users(user_id) ON DELETE SET NULL,
  query_text  TEXT        NOT NULL,
  city_id     UUID        REFERENCES cities(city_id),
  filters     JSONB,
  results_count INT,
  clicked_id  UUID,
  platform    VARCHAR(30),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sq_occurred ON search_queries(occurred_at DESC);
CREATE INDEX idx_sq_text     ON search_queries USING GIN(to_tsvector('english', query_text));


-- ============================================================
-- 20. AI / ML — PREDICTIONS & RECOMMENDATIONS
-- ============================================================

CREATE TABLE demand_forecasts (
  forecast_id    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id      UUID         NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  item_id        UUID         REFERENCES menu_items(item_id) ON DELETE SET NULL,
  material_id    UUID         REFERENCES raw_materials(material_id) ON DELETE SET NULL,
  forecast_date  DATE         NOT NULL,
  predicted_qty  NUMERIC(14,3) NOT NULL CHECK (predicted_qty >= 0),
  confidence_pct percentage   NOT NULL,
  model_version  VARCHAR(40)  NOT NULL,
  features_json  JSONB,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, COALESCE(item_id, '00000000-0000-0000-0000-000000000000'),
         COALESCE(material_id, '00000000-0000-0000-0000-000000000000'), forecast_date)
);
CREATE INDEX idx_forecast_vendor ON demand_forecasts(vendor_id, forecast_date);

CREATE TABLE recommendations (
  rec_id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rec_type       VARCHAR(50) NOT NULL,   -- 'menu_item','vendor','cuisine'
  target_id      UUID        NOT NULL,
  score          NUMERIC(6,5) NOT NULL CHECK (score BETWEEN 0 AND 1),
  reason         VARCHAR(200),
  model_version  VARCHAR(40) NOT NULL,
  is_shown       BOOLEAN     NOT NULL DEFAULT FALSE,
  is_clicked     BOOLEAN     NOT NULL DEFAULT FALSE,
  generated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ
);
CREATE INDEX idx_rec_user ON recommendations(user_id, rec_type, score DESC)
  WHERE expires_at IS NULL OR expires_at > now();

CREATE TABLE ml_model_registry (
  model_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name     VARCHAR(100) NOT NULL,
  model_type     VARCHAR(60) NOT NULL,   -- 'demand_forecast','recommendation'
  version        VARCHAR(40) NOT NULL,
  artifact_url   TEXT        NOT NULL,   -- S3 path to model file
  metrics_json   JSONB,
  hyperparams    JSONB,
  is_production  BOOLEAN     NOT NULL DEFAULT FALSE,
  trained_at     TIMESTAMPTZ,
  deployed_at    TIMESTAMPTZ,
  created_by     UUID        REFERENCES users(user_id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(model_name, version)
);

CREATE TABLE dynamic_pricing_rules (
  rule_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(150) NOT NULL,
  applies_to     VARCHAR(30)  NOT NULL,   -- 'delivery_fee','item_price','commission'
  entity_id      UUID,                    -- NULL = platform-wide
  multiplier_min NUMERIC(4,2) NOT NULL DEFAULT 1.0 CHECK (multiplier_min > 0),
  multiplier_max NUMERIC(4,2) NOT NULL DEFAULT 3.0,
  triggers_json  JSONB        NOT NULL,   -- { demand_threshold, weather, events }
  is_active      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT chk_multiplier CHECK (multiplier_max >= multiplier_min)
);


-- ============================================================
-- 21. IOT & BLOCKCHAIN / TRACEABILITY
-- ============================================================

CREATE TABLE iot_devices (
  device_id      UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id      UUID         REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  supplier_id    UUID         REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
  device_uid     VARCHAR(100) NOT NULL UNIQUE,
  device_type    VARCHAR(60)  NOT NULL,   -- 'temp_sensor','weight_scale','waste_monitor'
  location_desc  VARCHAR(200),
  firmware_ver   VARCHAR(40),
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  last_ping_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT chk_iot_owner
    CHECK ((vendor_id IS NOT NULL AND supplier_id IS NULL)
        OR (supplier_id IS NOT NULL AND vendor_id IS NULL))
);

CREATE TABLE iot_readings (
  reading_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id    UUID        NOT NULL REFERENCES iot_devices(device_id) ON DELETE CASCADE,
  metric_name  VARCHAR(60) NOT NULL,      -- 'temperature_c','humidity_pct','weight_kg'
  metric_value NUMERIC(14,4) NOT NULL,
  unit         VARCHAR(20),
  is_alert     BOOLEAN     NOT NULL DEFAULT FALSE,
  alert_msg    TEXT,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (recorded_at);

CREATE TABLE iot_readings_2025 PARTITION OF iot_readings
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE iot_readings_2026 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE iot_readings_2027 PARTITION OF iot_readings
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

CREATE INDEX idx_iot_readings_device ON iot_readings(device_id, recorded_at DESC);
CREATE INDEX idx_iot_alerts ON iot_readings(device_id, is_alert)
  WHERE is_alert = TRUE;

CREATE TABLE supply_chain_events (
  event_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id     UUID         NOT NULL REFERENCES raw_materials(material_id) ON DELETE RESTRICT,
  po_item_id      UUID         REFERENCES purchase_order_items(po_item_id),
  batch_number    VARCHAR(100),
  event_type      VARCHAR(60)  NOT NULL,  -- 'harvested','processed','shipped','received','used'
  actor_type      VARCHAR(30)  NOT NULL,  -- 'supplier','vendor','driver'
  actor_id        UUID         NOT NULL,
  location        GEOGRAPHY(POINT,4326),
  location_desc   TEXT,
  temperature_c   NUMERIC(6,2),
  humidity_pct    NUMERIC(5,2),
  quantity        NUMERIC(14,3),
  unit_id         UUID         REFERENCES measurement_units(unit_id),
  notes           TEXT,
  blockchain_hash VARCHAR(200) UNIQUE,    -- immutable record hash
  metadata_json   JSONB,
  occurred_at     TIMESTAMPTZ  NOT NULL,
  recorded_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_sce_material ON supply_chain_events(material_id, occurred_at DESC);
CREATE INDEX idx_sce_batch    ON supply_chain_events(batch_number)
  WHERE batch_number IS NOT NULL;

CREATE TABLE food_safety_incidents (
  incident_id     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_by     UUID        NOT NULL REFERENCES users(user_id),
  vendor_id       UUID        REFERENCES vendors(vendor_id),
  supplier_id     UUID        REFERENCES suppliers(supplier_id),
  material_id     UUID        REFERENCES raw_materials(material_id),
  order_id        UUID        REFERENCES orders(order_id),
  incident_type   VARCHAR(80) NOT NULL,
  severity        VARCHAR(20) NOT NULL DEFAULT 'low',  -- low/medium/high/critical
  description     TEXT        NOT NULL,
  action_taken    TEXT,
  status          VARCHAR(30) NOT NULL DEFAULT 'open',
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 22. WASTE MANAGEMENT
-- ============================================================

CREATE TABLE waste_logs (
  waste_id      UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id     UUID         NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  material_id   UUID         REFERENCES raw_materials(material_id) ON DELETE SET NULL,
  item_id       UUID         REFERENCES menu_items(item_id) ON DELETE SET NULL,
  waste_type    VARCHAR(60)  NOT NULL,   -- 'expired','overproduction','spill','other'
  quantity      positive_qty NOT NULL,
  unit_id       UUID         NOT NULL REFERENCES measurement_units(unit_id),
  cost_lost     money_amount NOT NULL DEFAULT 0,
  donated_to    VARCHAR(200),            -- charity name if donated
  notes         TEXT,
  waste_date    DATE         NOT NULL,
  created_by    UUID         NOT NULL REFERENCES users(user_id),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_waste_vendor ON waste_logs(vendor_id, waste_date DESC);


-- ============================================================
-- 23. AUDIT LOG & COMPLIANCE
-- ============================================================

CREATE TABLE audit_logs (
  audit_id      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id      UUID          REFERENCES users(user_id) ON DELETE SET NULL,
  actor_role    user_role,
  action        audit_action  NOT NULL,
  entity_type   VARCHAR(80)   NOT NULL,
  entity_id     UUID,
  old_values    JSONB,
  new_values    JSONB,
  diff          JSONB,
  ip_address    INET,
  user_agent    TEXT,
  session_id    UUID,
  request_id    VARCHAR(100),
  notes         TEXT,
  occurred_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
) PARTITION BY RANGE (occurred_at);

CREATE TABLE audit_logs_2025_q1 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE audit_logs_2025_q2 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE audit_logs_2025_q3 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE audit_logs_2025_q4 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE audit_logs_2026_q1 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE audit_logs_2026_q2 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
CREATE TABLE audit_logs_2026_q3 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE audit_logs_2026_q4 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

CREATE INDEX idx_audit_actor  ON audit_logs(actor_id, occurred_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, occurred_at DESC);

CREATE TABLE data_retention_policies (
  policy_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type  VARCHAR(80) NOT NULL UNIQUE,
  retain_days  INT         NOT NULL CHECK (retain_days > 0),
  archive_days INT         CHECK (archive_days > retain_days),
  anonymise    BOOLEAN     NOT NULL DEFAULT FALSE,
  hard_delete  BOOLEAN     NOT NULL DEFAULT FALSE,
  legal_basis  TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gdpr_requests (
  request_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  request_type  VARCHAR(30) NOT NULL,  -- 'erasure','portability','rectification','objection'
  status        VARCHAR(30) NOT NULL DEFAULT 'pending',
  notes         TEXT,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE consent_records (
  consent_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  consent_type  VARCHAR(80) NOT NULL,  -- 'marketing','location','analytics','terms'
  version       VARCHAR(20) NOT NULL,
  is_granted    BOOLEAN     NOT NULL,
  ip_address    INET,
  user_agent    TEXT,
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_consent_user ON consent_records(user_id, consent_type, granted_at DESC);


-- ============================================================
-- 24. WEBHOOKS & INTEGRATIONS
-- ============================================================

CREATE TABLE webhook_endpoints (
  endpoint_id   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  url           TEXT         NOT NULL CHECK (url ~* '^https://'),
  secret_hash   TEXT         NOT NULL,
  events        TEXT[]       NOT NULL,   -- ['order.placed','payment.success']
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  failure_count SMALLINT     NOT NULL DEFAULT 0,
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE webhook_deliveries (
  delivery_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint_id   UUID        NOT NULL REFERENCES webhook_endpoints(endpoint_id) ON DELETE CASCADE,
  event_type    VARCHAR(80) NOT NULL,
  payload       JSONB       NOT NULL,
  http_status   SMALLINT,
  response_body TEXT,
  duration_ms   INT,
  attempt       SMALLINT    NOT NULL DEFAULT 1,
  is_success    BOOLEAN     NOT NULL DEFAULT FALSE,
  delivered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wd_endpoint ON webhook_deliveries(endpoint_id, created_at DESC);


-- ============================================================
-- 25. REPORTS & EXPORTS
-- ============================================================

CREATE TABLE scheduled_reports (
  report_id    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(200) NOT NULL,
  report_type  VARCHAR(80)  NOT NULL,
  recipient_id UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  parameters   JSONB        NOT NULL DEFAULT '{}',
  schedule     VARCHAR(100) NOT NULL,    -- cron expression
  format       VARCHAR(20)  NOT NULL DEFAULT 'pdf', -- 'pdf','csv','xlsx'
  last_run_at  TIMESTAMPTZ,
  next_run_at  TIMESTAMPTZ,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE report_exports (
  export_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id    UUID        REFERENCES scheduled_reports(report_id) ON DELETE SET NULL,
  requested_by UUID        NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  report_type  VARCHAR(80) NOT NULL,
  parameters   JSONB       NOT NULL DEFAULT '{}',
  format       VARCHAR(20) NOT NULL,
  status       VARCHAR(30) NOT NULL DEFAULT 'queued', -- queued/processing/ready/failed
  file_id      UUID        REFERENCES media_files(file_id),
  row_count    INT,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 26. TRIGGERS — auto-maintenance
-- ============================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users','vendors','suppliers','menu_items','orders',
    'payments','vendor_licenses','supplier_licenses','inventory',
    'purchase_orders','customer_profiles','addresses',
    'wallets','drivers','deliveries','ratings',
    'feature_flags','system_config','oauth_identities','push_tokens'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- Soft-delete: prevent hard DELETE on users, vendors, suppliers
CREATE OR REPLACE FUNCTION fn_soft_delete_guard()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.deleted_at IS NULL THEN
    RAISE EXCEPTION 'Hard delete blocked. Set deleted_at instead.';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_users_no_delete
  BEFORE DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_guard();

CREATE TRIGGER trg_vendors_no_delete
  BEFORE DELETE ON vendors
  FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_guard();

CREATE TRIGGER trg_suppliers_no_delete
  BEFORE DELETE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_guard();

-- Auto-update vendor avg_rating after ratings insert/update
CREATE OR REPLACE FUNCTION fn_refresh_vendor_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE vendors
  SET avg_rating = (
    SELECT COALESCE(AVG(score), 0)
    FROM ratings
    WHERE target_type = 'vendor'
      AND target_id = NEW.target_id
      AND status = 'approved'
  )
  WHERE vendor_id = NEW.target_id
    AND NEW.target_type = 'vendor';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vendor_rating_refresh
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION fn_refresh_vendor_rating();

-- Auto-update menu_item avg_rating
CREATE OR REPLACE FUNCTION fn_refresh_item_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE menu_items
  SET avg_rating = (
    SELECT COALESCE(AVG(score), 0)
    FROM ratings
    WHERE target_type = 'menu_item'
      AND target_id = NEW.target_id
      AND status = 'approved'
  )
  WHERE item_id = NEW.target_id
    AND NEW.target_type = 'menu_item';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_item_rating_refresh
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION fn_refresh_item_rating();

-- Prevent negative wallet balance
CREATE OR REPLACE FUNCTION fn_check_wallet_balance()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'Wallet balance cannot go negative. Wallet: %, Attempted balance: %',
      NEW.wallet_id, NEW.balance;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_wallet_balance_check
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION fn_check_wallet_balance();

-- Prevent inventory going below zero
CREATE OR REPLACE FUNCTION fn_check_inventory_qty()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.quantity_on_hand < 0 THEN
    RAISE EXCEPTION 'Inventory cannot go negative. Inventory ID: %', NEW.inventory_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inventory_qty_check
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION fn_check_inventory_qty();

-- Auto-increment vendor total_orders on order completion
CREATE OR REPLACE FUNCTION fn_vendor_order_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE vendors SET total_orders = total_orders + 1
    WHERE vendor_id = NEW.vendor_id;
    UPDATE customer_profiles SET total_orders = total_orders + 1
    WHERE user_id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_count_update
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_vendor_order_count();

-- Insert order_status_history on every status change
CREATE OR REPLACE FUNCTION fn_log_order_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO order_status_history(order_id, from_status, to_status)
    VALUES (NEW.order_id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_status_log
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_log_order_status();


-- ============================================================
-- 27. VIEWS — convenience read models
-- ============================================================

CREATE VIEW v_active_vendors AS
  SELECT v.*, c.city_name, s.state_name, co.country_name
  FROM vendors v
  JOIN cities c   ON c.city_id    = v.city_id
  JOIN states s   ON s.state_id   = c.state_id
  JOIN countries co ON co.country_code = s.country_code
  WHERE v.is_active = TRUE
    AND v.verification_status = 'verified'
    AND v.deleted_at IS NULL;

CREATE VIEW v_order_summary AS
  SELECT
    o.order_id, o.order_number, o.status, o.order_type,
    o.total_amount, o.currency_code, o.placed_at,
    cp.full_name   AS customer_name,
    u.email        AS customer_email,
    v.business_name AS vendor_name,
    p.status       AS payment_status,
    p.method       AS payment_method,
    d.status       AS delivery_status,
    dr.full_name   AS driver_name
  FROM orders o
  JOIN users u              ON u.user_id       = o.customer_id
  JOIN customer_profiles cp ON cp.user_id      = o.customer_id
  JOIN vendors v            ON v.vendor_id     = o.vendor_id
  LEFT JOIN payments p      ON p.order_id      = o.order_id
  LEFT JOIN deliveries d    ON d.order_id      = o.order_id
  LEFT JOIN drivers dr      ON dr.driver_id    = d.driver_id;

CREATE VIEW v_low_inventory AS
  SELECT
    i.inventory_id, i.vendor_id, v.business_name AS vendor_name,
    rm.name AS material_name, rm.category,
    i.quantity_on_hand, i.reorder_threshold, i.reorder_quantity,
    mu.symbol AS unit,
    (i.reorder_threshold - i.quantity_on_hand) AS deficit
  FROM inventory i
  JOIN vendors v         ON v.vendor_id   = i.vendor_id
  JOIN raw_materials rm  ON rm.material_id = i.material_id
  JOIN measurement_units mu ON mu.unit_id  = rm.unit_id
  WHERE i.quantity_on_hand <= i.reorder_threshold
    AND v.is_active = TRUE;

CREATE VIEW v_vendor_revenue AS
  SELECT
    v.vendor_id, v.business_name,
    COUNT(o.order_id)           AS total_orders,
    SUM(o.subtotal)             AS gross_revenue,
    SUM(o.subtotal * v.commission_rate / 100) AS platform_commission,
    SUM(o.subtotal * (1 - v.commission_rate / 100)) AS net_revenue,
    AVG(o.subtotal)             AS avg_order_value,
    MAX(o.placed_at)            AS last_order_at
  FROM vendors v
  LEFT JOIN orders o ON o.vendor_id = v.vendor_id AND o.status = 'completed'
  WHERE v.deleted_at IS NULL
  GROUP BY v.vendor_id, v.business_name, v.commission_rate;

CREATE VIEW v_expiring_licenses AS
  SELECT
    'vendor'       AS entity_type,
    vl.vendor_id   AS entity_id,
    v.business_name AS entity_name,
    vl.license_type, vl.license_number,
    vl.expires_at,
    (vl.expires_at - CURRENT_DATE) AS days_until_expiry
  FROM vendor_licenses vl
  JOIN vendors v ON v.vendor_id = vl.vendor_id
  WHERE vl.status = 'verified'
    AND vl.expires_at IS NOT NULL
    AND vl.expires_at <= CURRENT_DATE + INTERVAL '60 days'
  UNION ALL
  SELECT
    'supplier'     AS entity_type,
    sl.supplier_id AS entity_id,
    s.business_name AS entity_name,
    sl.license_type, sl.license_number,
    sl.expires_at,
    (sl.expires_at - CURRENT_DATE) AS days_until_expiry
  FROM supplier_licenses sl
  JOIN suppliers s ON s.supplier_id = sl.supplier_id
  WHERE sl.status = 'verified'
    AND sl.expires_at IS NOT NULL
    AND sl.expires_at <= CURRENT_DATE + INTERVAL '60 days';


-- ============================================================
-- 28. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys                 ENABLE ROW LEVEL SECURITY;

-- Example policy: customers see only their own rows
-- (Actual enforcement via application role 'app_user')
CREATE POLICY pol_users_self ON users
  USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY pol_orders_self ON orders
  USING (
    customer_id = current_setting('app.current_user_id', TRUE)::UUID
    OR vendor_id IN (
      SELECT vendor_id FROM vendors
      WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
    )
  );


-- ============================================================
-- 29. ROLES & PERMISSIONS
-- ============================================================

-- Application roles (grant these to your connection pool user)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly') THEN
    CREATE ROLE app_readonly;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readwrite') THEN
    CREATE ROLE app_readwrite;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
    CREATE ROLE app_admin;
  END IF;
END;
$$;

GRANT USAGE ON SCHEMA public TO app_readonly, app_readwrite, app_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readwrite, app_admin;

-- Revoke DELETE from readwrite (soft-delete enforced by triggers)
REVOKE DELETE ON
  users, vendors, suppliers, menu_items, orders, payments
FROM app_readwrite;


-- ============================================================
-- 30. SEED: ESSENTIAL LOOKUP DATA
-- ============================================================

INSERT INTO measurement_units (unit_id, name, symbol, unit_type, base_factor) VALUES
  (uuid_generate_v4(), 'kilogram',   'kg',  'weight', 1),
  (uuid_generate_v4(), 'gram',       'g',   'weight', 0.001),
  (uuid_generate_v4(), 'litre',      'L',   'volume', 1),
  (uuid_generate_v4(), 'millilitre', 'mL',  'volume', 0.001),
  (uuid_generate_v4(), 'piece',      'pcs', 'count',  1),
  (uuid_generate_v4(), 'dozen',      'doz', 'count',  12),
  (uuid_generate_v4(), 'metre',      'm',   'length', 1),
  (uuid_generate_v4(), 'packet',     'pkt', 'count',  1);

INSERT INTO allergens (name, code, is_major) VALUES
  ('Gluten',            'GLUTEN',      TRUE),
  ('Crustaceans',       'CRUSTACEAN',  TRUE),
  ('Eggs',              'EGGS',        TRUE),
  ('Fish',              'FISH',        TRUE),
  ('Peanuts',           'PEANUTS',     TRUE),
  ('Soybeans',          'SOY',         TRUE),
  ('Tree Nuts',         'TREE_NUTS',   TRUE),
  ('Milk/Dairy',        'DAIRY',       TRUE),
  ('Celery',            'CELERY',      TRUE),
  ('Mustard',           'MUSTARD',     TRUE),
  ('Sesame',            'SESAME',      TRUE),
  ('Sulphur Dioxide',   'SULPHITES',   TRUE),
  ('Lupin',             'LUPIN',       TRUE),
  ('Molluscs',          'MOLLUSCS',    TRUE),
  ('Latex',             'LATEX',       FALSE);

INSERT INTO dietary_tags (name, code) VALUES
  ('Vegan',           'VEGAN'),
  ('Vegetarian',      'VEGETARIAN'),
  ('Halal',           'HALAL'),
  ('Kosher',          'KOSHER'),
  ('Gluten-Free',     'GLUTEN_FREE'),
  ('Dairy-Free',      'DAIRY_FREE'),
  ('Keto',            'KETO'),
  ('Paleo',           'PALEO'),
  ('Low-Calorie',     'LOW_CAL'),
  ('High-Protein',    'HIGH_PROTEIN'),
  ('Nut-Free',        'NUT_FREE'),
  ('Organic',         'ORGANIC'),
  ('Raw',             'RAW'),
  ('Jain',            'JAIN'),
  ('Sattvic',         'SATTVIC');

INSERT INTO food_categories (name, slug, display_order) VALUES
  ('Snacks',          'snacks',          1),
  ('Main Course',     'main-course',     2),
  ('Beverages',       'beverages',       3),
  ('Desserts',        'desserts',        4),
  ('Street Food',     'street-food',     5),
  ('Breakfast',       'breakfast',       6),
  ('Salads',          'salads',          7),
  ('Soups',           'soups',           8),
  ('Grills & BBQ',    'grills-bbq',      9),
  ('Bakery',          'bakery',          10),
  ('Healthy',         'healthy',         11),
  ('Fast Food',       'fast-food',       12),
  ('Regional',        'regional',        13),
  ('International',   'international',   14),
  ('Combos',          'combos',          15);

INSERT INTO system_config (config_key, config_value, value_type, description) VALUES
  ('platform.name',               'StreetEats',  'string',  'Platform display name'),
  ('platform.version',            '1.0.0',       'string',  'Current API version'),
  ('order.max_items',             '50',          'integer', 'Max items per order'),
  ('payment.timeout_minutes',     '15',          'integer', 'Payment session timeout'),
  ('delivery.max_radius_km',      '10',          'integer', 'Max delivery radius'),
  ('loyalty.points_per_rupee',    '1',           'integer', 'Loyalty points earned per currency unit'),
  ('loyalty.rupee_per_point',     '0.5',         'string',  'Redemption value per point'),
  ('review.moderation_required',  'true',        'boolean', 'Auto-hold reviews for moderation'),
  ('vendor.trial_commission_pct', '5',           'integer', 'Reduced commission for first 90 days'),
  ('driver.max_active_orders',    '3',           'integer', 'Max concurrent deliveries per driver');

-- ============================================================
-- END OF SCHEMA — all domains complete
-- ============================================================
