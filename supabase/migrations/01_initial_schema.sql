-- ========================================================
-- JMC Blood Bond (যশোর মেডিকেল কলেজ রক্তদান কেন্দ্র)
-- Migration 01: Initial Schema, Security Definer Functions,
-- Triggers, and Strict Row Level Security (RLS) Policies
-- ========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- 1. PROFILES TABLE (Admins, Donors, Members)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_hidden BOOLEAN NOT NULL DEFAULT false,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    district TEXT NOT NULL DEFAULT 'Jashore',
    upazila TEXT NOT NULL DEFAULT 'Jashore Sadar',
    medical_college_unit TEXT DEFAULT 'General Donor',
    last_donation_date DATE,
    total_donations INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT true,
    weight_kg NUMERIC(4,1),
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    notes TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- 2. SITE SETTINGS TABLE (Configurable Donation Gap Days, etc.)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    donation_gap_days INTEGER NOT NULL DEFAULT 90 CHECK (donation_gap_days > 0),
    organization_name TEXT NOT NULL DEFAULT 'JMC Blood Bond',
    organization_name_bn TEXT NOT NULL DEFAULT 'যশোর মেডিকেল কলেজ রক্তদান ফোরাম',
    tagline TEXT DEFAULT 'Run by Jashore Medical College Students',
    tagline_bn TEXT DEFAULT 'যশোর মেডিকেল কলেজের শিক্ষার্থীদের পরিচালিত সেবামূলক রক্তদান প্ল্যাটফর্ম',
    emergency_hotline TEXT NOT NULL DEFAULT '+8801712345678',
    emergency_hotline_alt TEXT DEFAULT '+8801912345678',
    notification_email TEXT DEFAULT 'blood@jmc.edu.bd',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- 3. DONATION CAMPS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.donation_camps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_bn TEXT,
    description TEXT,
    organizer TEXT NOT NULL DEFAULT 'JMC Students Blood Forum',
    venue TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT 'Jashore',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    target_units INTEGER NOT NULL DEFAULT 100,
    collected_units INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    contact_person TEXT,
    contact_phone TEXT,
    banner_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- 4. BLOOD REQUESTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INTEGER NOT NULL DEFAULT 1 CHECK (units > 0),
    hospital TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT 'Jashore',
    location_details TEXT,
    needed_date DATE NOT NULL,
    needed_time TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_alt_phone TEXT,
    urgency TEXT NOT NULL DEFAULT 'urgent' CHECK (urgency IN ('critical', 'urgent', 'standard')),
    medical_reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'donor_found', 'fulfilled', 'cancelled')),
    turnstile_verified BOOLEAN NOT NULL DEFAULT false,
    assigned_donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- 5. DONATIONS HISTORY LOG TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    donation_date DATE NOT NULL,
    patient_name TEXT,
    hospital TEXT NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INTEGER NOT NULL DEFAULT 1,
    certificate_id TEXT UNIQUE,
    verified_by_admin BOOLEAN NOT NULL DEFAULT true,
    request_id UUID REFERENCES public.blood_requests(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- 6. BADGES & MILESTONES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    description TEXT NOT NULL,
    description_bn TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    min_donations INTEGER NOT NULL DEFAULT 1,
    badge_color TEXT NOT NULL DEFAULT '#e11d48',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.donor_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(donor_id, badge_id)
);

-- ========================================================
-- 7. AUDIT LOGS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- 8. SCHEDULED NOTIFICATION QUEUE (For Cloudflare Cron Worker)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL DEFAULT 'eligible_again' CHECK (notification_type IN ('eligible_again', 'urgent_request_alert', 'camp_reminder')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    scheduled_for DATE NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ
);

-- ========================================================
-- SECURITY DEFINER FUNCTIONS & HELPERS
-- ========================================================

-- 1. Helper function: Is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Helper function: Get donation gap setting
CREATE OR REPLACE FUNCTION public.get_donation_gap_days()
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT donation_gap_days FROM public.site_settings WHERE id = 'global'),
    90
  );
$$;

-- 3. Calculate donor eligibility
CREATE OR REPLACE FUNCTION public.is_donor_eligible(last_date DATE, gap_days INTEGER DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  gap INT;
BEGIN
  IF last_date IS NULL THEN
    RETURN true;
  END IF;
  gap := COALESCE(gap_days, 90);
  RETURN (CURRENT_DATE - last_date) >= gap;
END;
$$;

-- 4. Calculate days until eligible
CREATE OR REPLACE FUNCTION public.days_until_eligible(last_date DATE, gap_days INTEGER DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  gap INT;
  days_diff INT;
BEGIN
  IF last_date IS NULL THEN
    RETURN 0;
  END IF;
  gap := COALESCE(gap_days, 90);
  days_diff := gap - (CURRENT_DATE - last_date);
  IF days_diff < 0 THEN
    RETURN 0;
  END IF;
  RETURN days_diff;
END;
$$;

-- ========================================================
-- TRIGGERS
-- ========================================================

-- Trigger 1: Auto create profile when user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    blood_group,
    district,
    upazila,
    medical_college_unit,
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'JMC Member'),
    COALESCE(NEW.raw_user_meta_data->>'phone', 'Pending'),
    COALESCE(NEW.raw_user_meta_data->>'blood_group', 'O+'),
    COALESCE(NEW.raw_user_meta_data->>'district', 'Jashore'),
    COALESCE(NEW.raw_user_meta_data->>'upazila', 'Jashore Sadar'),
    COALESCE(NEW.raw_user_meta_data->>'medical_college_unit', 'General Donor'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2: Update donor statistics & auto-award badges on donation insert
CREATE OR REPLACE FUNCTION public.handle_donation_inserted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Update donor profile last donation date and total donation count
  UPDATE public.profiles
  SET 
    last_donation_date = NEW.donation_date,
    total_donations = (SELECT COUNT(*) FROM public.donations WHERE donor_id = NEW.donor_id),
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.donor_id;

  -- Count total donations for badge checks
  SELECT COUNT(*) INTO v_count FROM public.donations WHERE donor_id = NEW.donor_id;

  -- Check & Award Milestones
  IF v_count >= 1 THEN
    INSERT INTO public.donor_badges (donor_id, badge_id)
    VALUES (NEW.donor_id, 'first_donation')
    ON CONFLICT (donor_id, badge_id) DO NOTHING;
  END IF;

  IF v_count >= 3 THEN
    INSERT INTO public.donor_badges (donor_id, badge_id)
    VALUES (NEW.donor_id, 'life_saver_bronze')
    ON CONFLICT (donor_id, badge_id) DO NOTHING;
  END IF;

  IF v_count >= 5 THEN
    INSERT INTO public.donor_badges (donor_id, badge_id)
    VALUES (NEW.donor_id, 'guardian_silver')
    ON CONFLICT (donor_id, badge_id) DO NOTHING;
  END IF;

  IF v_count >= 10 THEN
    INSERT INTO public.donor_badges (donor_id, badge_id)
    VALUES (NEW.donor_id, 'hero_gold')
    ON CONFLICT (donor_id, badge_id) DO NOTHING;
  END IF;

  IF v_count >= 25 THEN
    INSERT INTO public.donor_badges (donor_id, badge_id)
    VALUES (NEW.donor_id, 'legend_platinum')
    ON CONFLICT (donor_id, badge_id) DO NOTHING;
  END IF;

  -- Auto generate certificate ID if null
  IF NEW.certificate_id IS NULL THEN
    UPDATE public.donations
    SET certificate_id = 'JMC-CERT-' || TO_CHAR(NEW.donation_date, 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 6)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_donation_inserted ON public.donations;
CREATE TRIGGER on_donation_inserted
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_donation_inserted();

-- Trigger 3: Prevent regular users from self-promoting to admin
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If role is changing, ensure caller is admin
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an administrator can change user roles.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();


-- ========================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- Every table has RLS enabled and explicit policies
-- ========================================================

-- 1. PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can search active available donors (phone may be masked at app level if phone_hidden)
CREATE POLICY "Public can view donors"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Authenticated user can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can do anything with profiles
CREATE POLICY "Admins full access to profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 2. SITE SETTINGS RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update site settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 3. DONATION CAMPS RLS
ALTER TABLE public.donation_camps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donation camps"
  ON public.donation_camps
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage camps"
  ON public.donation_camps
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 4. BLOOD REQUESTS RLS
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved or fulfilled requests, or authenticated user can view their own
CREATE POLICY "Public can view approved or active requests"
  ON public.blood_requests
  FOR SELECT
  USING (status IN ('approved', 'donor_found', 'fulfilled') OR requested_by = auth.uid() OR public.is_admin());

-- Anyone can create a blood request (pending approval or with turnstile)
CREATE POLICY "Anyone can create blood request"
  ON public.blood_requests
  FOR INSERT
  WITH CHECK (true);

-- Creator can update their own request if not yet fulfilled
CREATE POLICY "Creator can update own pending request"
  ON public.blood_requests
  FOR UPDATE
  TO authenticated
  USING (requested_by = auth.uid())
  WITH CHECK (requested_by = auth.uid());

-- Admins have full access to blood requests
CREATE POLICY "Admins manage all blood requests"
  ON public.blood_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 5. DONATIONS RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Anyone can view verified donations for certificate verification and counters
CREATE POLICY "Public view donations"
  ON public.donations
  FOR SELECT
  USING (true);

-- Donors can view their own donations
CREATE POLICY "Donors view own donations"
  ON public.donations
  FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

-- Admins manage all donations
CREATE POLICY "Admins manage all donations"
  ON public.donations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 6. BADGES & DONOR BADGES RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view badges"
  ON public.badges
  FOR SELECT
  USING (true);

CREATE POLICY "Admins manage badges"
  ON public.badges
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public can view donor badges"
  ON public.donor_badges
  FOR SELECT
  USING (true);

CREATE POLICY "Admins manage donor badges"
  ON public.donor_badges
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 7. AUDIT LOGS RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- System or authenticated can insert audit logs
CREATE POLICY "Allow insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);


-- 8. NOTIFICATION QUEUE RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Only Admins or service role can access notification queue
CREATE POLICY "Admins view notification queue"
  ON public.notification_queue
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

