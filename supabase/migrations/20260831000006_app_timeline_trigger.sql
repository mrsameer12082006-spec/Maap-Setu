-- 20260831000006_app_timeline_trigger.sql

-- Automatically generate an application timeline event when an application is submitted.
-- This ensures workflow transitions remain authoritative on the server
-- and prevents the frontend from needing direct INSERT access to app_timeline.

CREATE OR REPLACE FUNCTION generate_submission_timeline_event()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO app_timeline (
    application_id, 
    event_type, 
    step, 
    old_status, 
    new_status, 
    actor_user_id, 
    actor_role, 
    message
  )
  VALUES (
    NEW.id, 
    'SUBMISSION', 
    'Application Submitted', 
    NULL, 
    'submitted', 
    NEW.applicant_id, 
    'business', 
    'Application successfully submitted'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to fire after an application is inserted
CREATE TRIGGER on_application_submitted
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION generate_submission_timeline_event();
