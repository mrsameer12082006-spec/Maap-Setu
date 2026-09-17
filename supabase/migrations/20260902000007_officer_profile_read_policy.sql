
-- Policy to allow officers to read the profiles of applicants whose applications are assigned to them.
CREATE POLICY "Officer can read applicant profiles of assigned applications"
ON profiles FOR SELECT TO authenticated
USING (
  get_user_role() = 'officer' 
  AND EXISTS (
    SELECT 1 
    FROM applications 
    WHERE applications.applicant_id = profiles.id 
    AND applications.assigned_officer_id = get_officer_id()
  )
);
