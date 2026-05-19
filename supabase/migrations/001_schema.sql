-- ============================================================
-- CA Firms Directory — Full Schema Migration
-- Run this in Supabase SQL Editor in order
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS cities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  firm_count  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    text UNIQUE NOT NULL,
  email       text UNIQUE NOT NULL,
  full_name   text,
  avatar_url  text,
  is_admin    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS firms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id         uuid NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  to_code         text NOT NULL,
  firm_name       text NOT NULL,
  approved_wef    date,
  city_name       text NOT NULL,
  address         text,
  email           text,
  contact_number  text,
  website         text,
  hiring_status   text NOT NULL DEFAULT 'Not Specified',
  mrs_name        text,
  mrs_designation text,
  mrs_number      text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT firms_to_code_city_unique UNIQUE (to_code, city_id),
  CONSTRAINT firms_hiring_status_check
    CHECK (hiring_status IN ('Hiring', 'Not Hiring', 'Not Specified')),
  CONSTRAINT firms_mrs_designation_check
    CHECK (mrs_designation IS NULL OR mrs_designation IN ('FCA', 'ACA'))
);

CREATE TABLE IF NOT EXISTS pending_changes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id       uuid NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  submitted_by  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending',
  field_changes jsonb NOT NULL,
  reviewer_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_note text,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  reviewed_at   timestamptz,
  CONSTRAINT pending_changes_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  change_id    uuid REFERENCES pending_changes(id) ON DELETE SET NULL,
  firm_id      uuid REFERENCES firms(id) ON DELETE SET NULL,
  actor_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action       text NOT NULL,
  before_state jsonb,
  after_state  jsonb,
  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contributor_stats (
  profile_id           uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_submitted      integer NOT NULL DEFAULT 0,
  total_approved       integer NOT NULL DEFAULT 0,
  total_rejected       integer NOT NULL DEFAULT 0,
  last_contribution_at timestamptz,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email    ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_firms_city_id         ON firms(city_id);
CREATE INDEX IF NOT EXISTS idx_firms_to_code         ON firms(to_code);
CREATE INDEX IF NOT EXISTS idx_firms_hiring_status   ON firms(hiring_status);
CREATE INDEX IF NOT EXISTS idx_firms_mrs_designation ON firms(mrs_designation);
CREATE INDEX IF NOT EXISTS idx_firms_city_name_sort  ON firms(city_id, firm_name);
CREATE INDEX IF NOT EXISTS idx_firms_fulltext
  ON firms USING gin(to_tsvector('english', firm_name || ' ' || COALESCE(address, '') || ' ' || COALESCE(mrs_name, '')));

CREATE INDEX IF NOT EXISTS idx_pending_city_id      ON pending_changes(firm_id);
CREATE INDEX IF NOT EXISTS idx_pending_submitted_by ON pending_changes(submitted_by);
CREATE INDEX IF NOT EXISTS idx_pending_status       ON pending_changes(status);
CREATE INDEX IF NOT EXISTS idx_pending_submitted_at ON pending_changes(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_pending_only
  ON pending_changes(submitted_at DESC) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_audit_firm_id   ON audit_logs(firm_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor_id  ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_change_id ON audit_logs(change_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contributor_approved
  ON contributor_stats(total_approved DESC);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE cities            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_changes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributor_stats ENABLE ROW LEVEL SECURITY;

-- cities: public read
CREATE POLICY "cities_public_read"
  ON cities FOR SELECT USING (true);

-- firms: public read
CREATE POLICY "firms_public_read"
  ON firms FOR SELECT USING (true);

-- profiles: users manage their own row
CREATE POLICY "profiles_read_own"
  ON profiles FOR SELECT
  USING (clerk_id = (current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (clerk_id = (current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (clerk_id = (current_setting('request.jwt.claims', true)::json->>'sub'));

-- pending_changes: authenticated users can submit and read their own
CREATE POLICY "pending_changes_read_own"
  ON pending_changes FOR SELECT
  USING (
    submitted_by IN (
      SELECT id FROM profiles
      WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  );

CREATE POLICY "pending_changes_insert_authenticated"
  ON pending_changes FOR INSERT
  WITH CHECK (
    submitted_by IN (
      SELECT id FROM profiles
      WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  );

-- audit_logs: public read for transparency
CREATE POLICY "audit_logs_public_read"
  ON audit_logs FOR SELECT USING (true);

-- contributor_stats: public read
CREATE POLICY "contributor_stats_public_read"
  ON contributor_stats FOR SELECT USING (true);

-- ============================================================
-- 4. STORED PROCEDURES (Atomic Operations)
-- ============================================================

CREATE OR REPLACE FUNCTION approve_change(
  p_change_id   uuid,
  p_reviewer_id uuid,
  p_reviewer_note text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_change      pending_changes%ROWTYPE;
  v_before_state jsonb;
  v_after_state  jsonb;
  v_changes      jsonb;
  v_field        text;
  v_new_val      text;
BEGIN
  -- Lock the row to prevent concurrent approvals
  SELECT * INTO v_change
  FROM pending_changes
  WHERE id = p_change_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Change not found: %', p_change_id;
  END IF;

  IF v_change.status != 'pending' THEN
    RAISE EXCEPTION 'Change is not pending (status: %)', v_change.status;
  END IF;

  -- Snapshot the firm before the change
  SELECT row_to_json(f)::jsonb INTO v_before_state
  FROM firms f WHERE id = v_change.firm_id;

  v_changes := v_change.field_changes;

  -- Apply each field change dynamically
  FOR v_field IN SELECT jsonb_object_keys(v_changes) LOOP
    v_new_val := v_changes->v_field->>'new';

    CASE v_field
      WHEN 'email' THEN
        UPDATE firms SET email = v_new_val, updated_at = now() WHERE id = v_change.firm_id;
      WHEN 'contact_number' THEN
        UPDATE firms SET contact_number = v_new_val, updated_at = now() WHERE id = v_change.firm_id;
      WHEN 'website' THEN
        UPDATE firms SET website = v_new_val, updated_at = now() WHERE id = v_change.firm_id;
      WHEN 'address' THEN
        UPDATE firms SET address = v_new_val, updated_at = now() WHERE id = v_change.firm_id;
      WHEN 'hiring_status' THEN
        UPDATE firms SET hiring_status = COALESCE(v_new_val, 'Not Specified'), updated_at = now() WHERE id = v_change.firm_id;
      ELSE
        NULL; -- Ignore unknown fields
    END CASE;
  END LOOP;

  -- Snapshot after
  SELECT row_to_json(f)::jsonb INTO v_after_state
  FROM firms f WHERE id = v_change.firm_id;

  -- Mark change as approved
  UPDATE pending_changes
  SET
    status       = 'approved',
    reviewer_id  = p_reviewer_id,
    reviewer_note = p_reviewer_note,
    reviewed_at  = now()
  WHERE id = p_change_id;

  -- Write audit log
  INSERT INTO audit_logs (change_id, firm_id, actor_id, action, before_state, after_state)
  VALUES (p_change_id, v_change.firm_id, p_reviewer_id, 'change_approved', v_before_state, v_after_state);

  -- Update contributor stats
  INSERT INTO contributor_stats (profile_id, total_submitted, total_approved, last_contribution_at, updated_at)
  VALUES (v_change.submitted_by, 0, 1, now(), now())
  ON CONFLICT (profile_id) DO UPDATE
  SET
    total_approved       = contributor_stats.total_approved + 1,
    last_contribution_at = now(),
    updated_at           = now();
END;
$$;

CREATE OR REPLACE FUNCTION reject_change(
  p_change_id    uuid,
  p_reviewer_id  uuid,
  p_reviewer_note text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_change pending_changes%ROWTYPE;
BEGIN
  SELECT * INTO v_change
  FROM pending_changes
  WHERE id = p_change_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Change not found: %', p_change_id;
  END IF;

  IF v_change.status != 'pending' THEN
    RAISE EXCEPTION 'Change is not pending (status: %)', v_change.status;
  END IF;

  UPDATE pending_changes
  SET
    status        = 'rejected',
    reviewer_id   = p_reviewer_id,
    reviewer_note = p_reviewer_note,
    reviewed_at   = now()
  WHERE id = p_change_id;

  INSERT INTO audit_logs (change_id, firm_id, actor_id, action)
  VALUES (p_change_id, v_change.firm_id, p_reviewer_id, 'change_rejected');

  INSERT INTO contributor_stats (profile_id, total_submitted, total_rejected, last_contribution_at, updated_at)
  VALUES (v_change.submitted_by, 0, 1, now(), now())
  ON CONFLICT (profile_id) DO UPDATE
  SET
    total_rejected       = contributor_stats.total_rejected + 1,
    last_contribution_at = now(),
    updated_at           = now();
END;
$$;

-- Helper: increment total_submitted safely
CREATE OR REPLACE FUNCTION increment_submitted(p_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO contributor_stats (profile_id, total_submitted, updated_at)
  VALUES (p_profile_id, 1, now())
  ON CONFLICT (profile_id) DO UPDATE
  SET total_submitted = contributor_stats.total_submitted + 1,
      updated_at = now();
END;
$$;

-- ============================================================
-- 5. REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE firms;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_changes;
ALTER PUBLICATION supabase_realtime ADD TABLE contributor_stats;

-- ============================================================
-- 6. SEED CITIES
-- ============================================================

INSERT INTO cities (slug, name) VALUES
  ('islamabad', 'Islamabad'),
  ('lahore', 'Lahore')
ON CONFLICT (slug) DO NOTHING;
