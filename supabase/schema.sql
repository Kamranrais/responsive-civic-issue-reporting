-- ═══════════════════════════════════════════════════════════
-- JanSight Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Custom Types ────────────────────────────────────────────
CREATE TYPE issue_category AS ENUM (
  'pothole', 'garbage', 'waterlogging', 'streetlight', 'infrastructure', 'other'
);

CREATE TYPE issue_severity AS ENUM (
  'low', 'medium', 'high', 'critical'
);

CREATE TYPE report_status AS ENUM (
  'submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'
);

-- ─── Profiles ────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Departments ──────────────────────────────────────────────
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  city          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO departments (name, contact_email, city) VALUES
  ('PWD (Public Works Department)',   'pwd@municipal.gov.in',       NULL),
  ('Sanitation Department',           'sanitation@municipal.gov.in', NULL),
  ('Electricity Department',          'electric@municipal.gov.in',   NULL),
  ('Jal Board / BWSSB',               'water@municipal.gov.in',      NULL),
  ('GHMC',                            'ghmc@hyd.gov.in',             'Hyderabad'),
  ('CMWSSB',                          'cmwssb@chennai.gov.in',       'Chennai'),
  ('Municipal Corporation',           'mc@municipal.gov.in',         NULL),
  ('Emergency Response Unit',         'emergency@municipal.gov.in',  NULL);

-- ─── Reports ──────────────────────────────────────────────────
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id  TEXT UNIQUE NOT NULL,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  title         TEXT NOT NULL,
  description   TEXT,
  category      issue_category NOT NULL,
  severity      issue_severity NOT NULL DEFAULT 'medium',
  status        report_status NOT NULL DEFAULT 'submitted',

  -- Location
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  address       TEXT,

  -- Media
  image_url     TEXT,

  -- AI metadata
  ai_analysis   JSONB,

  -- Assignment
  assigned_to   TEXT,
  department    TEXT,

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ
);

-- Index for geospatial queries
CREATE INDEX reports_latng_idx ON reports (lat, lng);
CREATE INDEX reports_user_idx  ON reports (user_id);
CREATE INDEX reports_status_idx ON reports (status);
CREATE INDEX reports_category_idx ON reports (category);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Report Updates / Activity Log ────────────────────────────
CREATE TABLE report_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status      report_status NOT NULL,
  note        TEXT,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX report_updates_report_idx ON report_updates (report_id);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments    ENABLE ROW LEVEL SECURITY;

-- ─── profiles ─────────────────────────────────────────────────
-- Users can read/update their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── reports ──────────────────────────────────────────────────
-- Citizens: can INSERT their own reports
CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Citizens: can SELECT their own reports
CREATE POLICY "reports_select_own"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

-- Everyone (incl. anon for map view): can SELECT basic map fields
-- (Restrict sensitive data via views if needed)
CREATE POLICY "reports_select_public"
  ON reports FOR SELECT
  USING (status != 'closed');

-- Admins: can SELECT, UPDATE all reports
CREATE POLICY "reports_admin_all"
  ON reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── report_updates ───────────────────────────────────────────
CREATE POLICY "updates_select_own_report"
  ON report_updates FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM reports WHERE id = report_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "updates_insert_admin"
  ON report_updates FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── departments ──────────────────────────────────────────────
CREATE POLICY "departments_select_all"
  ON departments FOR SELECT
  TO authenticated
  USING (TRUE);

-- ═══════════════════════════════════════════════════════════
-- STORAGE
-- ═══════════════════════════════════════════════════════════
-- Run these in Supabase Dashboard → Storage, or via SQL:
-- 1. Create bucket 'report-images' with public = true
-- 2. Add policies:

-- INSERT: authenticated users can upload to their own folder
-- CREATE POLICY "storage_insert_own"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'report-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- SELECT: anyone can read (public bucket)
-- CREATE POLICY "storage_select_public"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'report-images');
