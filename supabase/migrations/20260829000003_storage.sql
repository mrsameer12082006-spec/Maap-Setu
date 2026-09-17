-- 20260829000003_storage.sql

-- Set up Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-evidence', 'verification-evidence', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);

-- RLS for application-documents
CREATE POLICY "Authenticated users can upload application documents"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'application-documents');

CREATE POLICY "Authenticated users can read application documents"
ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'application-documents');

-- RLS for verification-evidence
CREATE POLICY "Officers can upload evidence"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'verification-evidence');

CREATE POLICY "Authenticated users can read verification evidence"
ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'verification-evidence');

-- RLS for certificates
CREATE POLICY "LMD can upload certificates"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'lmd');

CREATE POLICY "Public can read certificates"
ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
