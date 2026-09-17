-- 20260829000002_rls.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Utility Functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_officer_id()
RETURNS UUID AS $$
  SELECT id FROM officers WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. PROFILES Policies
CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "LMD admins can read all profiles"
ON profiles FOR SELECT TO authenticated USING (get_user_role() = 'lmd');

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow insert during signup"
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 2. INSTRUMENTS Policies
CREATE POLICY "Business can read their own instruments"
ON instruments FOR SELECT TO authenticated 
USING (owner_id = auth.uid() OR get_user_role() = 'lmd' OR get_user_role() = 'officer');

CREATE POLICY "Business can insert their own instruments"
ON instruments FOR INSERT TO authenticated 
WITH CHECK (owner_id = auth.uid() AND get_user_role() = 'business');

CREATE POLICY "Business can update their own instruments"
ON instruments FOR UPDATE TO authenticated 
USING (owner_id = auth.uid() AND get_user_role() = 'business');

-- 3. OFFICERS Policies
CREATE POLICY "Anyone can view officers"
ON officers FOR SELECT TO authenticated USING (true);

-- 4. APPLICATIONS Policies
CREATE POLICY "Business can view their own applications"
ON applications FOR SELECT TO authenticated 
USING (applicant_id = auth.uid());

CREATE POLICY "LMD can view all applications"
ON applications FOR SELECT TO authenticated 
USING (get_user_role() = 'lmd');

CREATE POLICY "Officer can view assigned applications"
ON applications FOR SELECT TO authenticated 
USING (assigned_officer_id = get_officer_id());

CREATE POLICY "Business can insert applications"
ON applications FOR INSERT TO authenticated 
WITH CHECK (applicant_id = auth.uid() AND get_user_role() = 'business');

CREATE POLICY "LMD can update applications (assign officers)"
ON applications FOR UPDATE TO authenticated 
USING (get_user_role() = 'lmd');

CREATE POLICY "Officer can update assigned applications"
ON applications FOR UPDATE TO authenticated 
USING (assigned_officer_id = get_officer_id());

-- 5. VERIFICATION_RESULTS Policies
CREATE POLICY "LMD can read all verification results"
ON verification_results FOR SELECT TO authenticated 
USING (get_user_role() = 'lmd');

CREATE POLICY "Officer can read their own submissions"
ON verification_results FOR SELECT TO authenticated 
USING (officer_id = get_officer_id());

CREATE POLICY "Business can read verification results for their apps"
ON verification_results FOR SELECT TO authenticated 
USING (
  EXISTS (SELECT 1 FROM applications WHERE applications.id = verification_results.application_id AND applications.applicant_id = auth.uid())
);

CREATE POLICY "Officer can insert verification result"
ON verification_results FOR INSERT TO authenticated 
WITH CHECK (officer_id = get_officer_id());

-- 6. CERTIFICATES Policies
CREATE POLICY "Anyone can view certificates (Public Verification)"
ON certificates FOR SELECT USING (true);

-- 7. APP_TIMELINE Policies
CREATE POLICY "LMD can read all timeline events"
ON app_timeline FOR SELECT TO authenticated USING (get_user_role() = 'lmd');

CREATE POLICY "Business can read their own timeline events"
ON app_timeline FOR SELECT TO authenticated 
USING (
  EXISTS (SELECT 1 FROM applications WHERE applications.id = app_timeline.application_id AND applications.applicant_id = auth.uid())
);

CREATE POLICY "Officer can read timeline events for assigned apps"
ON app_timeline FOR SELECT TO authenticated 
USING (
  EXISTS (SELECT 1 FROM applications WHERE applications.id = app_timeline.application_id AND applications.assigned_officer_id = get_officer_id())
);

-- 8. ACTIVITY_LOGS Policies
CREATE POLICY "Users can read own activity logs"
ON activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "LMD can read all activity logs"
ON activity_logs FOR SELECT TO authenticated USING (get_user_role() = 'lmd');

CREATE POLICY "Users can insert own activity logs"
ON activity_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
