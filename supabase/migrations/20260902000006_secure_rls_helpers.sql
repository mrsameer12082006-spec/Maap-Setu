
-- Hardening get_user_role() with search_path constraint and schema qualification
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- Hardening get_officer_id() with search_path constraint and schema qualification
CREATE OR REPLACE FUNCTION public.get_officer_id()
RETURNS UUID AS $$
  SELECT id FROM public.officers WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

