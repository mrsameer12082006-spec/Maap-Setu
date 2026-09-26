-- ==============================================================================
-- MIGRATION: 20260926000021_certificate_issuance_log.sql
-- PURPOSE: Create tamper-evident certificate issuance log and atomic issuance RPC
-- ==============================================================================

-- 1. Add signature columns to certificates table to allow explicit cross-checks
ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS signature TEXT;

-- 2. Create the certificate_issuance_log table
CREATE TABLE IF NOT EXISTS public.certificate_issuance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id UUID NOT NULL REFERENCES public.certificates(id),
    application_id UUID NOT NULL REFERENCES public.applications(id),
    content_hash TEXT NOT NULL,
    signature TEXT NOT NULL,
    issued_by UUID NOT NULL REFERENCES public.profiles(id),
    signed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT certificate_issuance_log_certificate_id_key UNIQUE (certificate_id)
);

-- 3. Implement Defense in Depth for Immutability
ALTER TABLE public.certificate_issuance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read issuance log for verification"
    ON public.certificate_issuance_log
    FOR SELECT
    TO public
    USING (true);

-- Revoke privileges completely for mutations
REVOKE UPDATE, DELETE ON public.certificate_issuance_log FROM authenticated;
REVOKE UPDATE, DELETE ON public.certificate_issuance_log FROM anon;
REVOKE UPDATE, DELETE ON public.certificate_issuance_log FROM service_role;

-- BEFORE UPDATE OR DELETE trigger to completely lock the table
CREATE OR REPLACE FUNCTION public.reject_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'TAMPER-EVIDENT LOG: Updates and deletes are permanently disabled for %', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_issuance_log_mutation
BEFORE UPDATE OR DELETE ON public.certificate_issuance_log
FOR EACH ROW EXECUTE FUNCTION public.reject_mutation();


-- 4. Atomic Issuance RPC
-- Ensures no arbitrary parameters bypass relationship integrity
CREATE OR REPLACE FUNCTION public.atomic_issue_certificate(
    p_cert_id UUID,
    p_application_id UUID,
    p_instrument_id UUID,
    p_certificate_number TEXT,
    p_instrument_type TEXT,
    p_serial_number TEXT,
    p_manufacturer TEXT,
    p_model TEXT,
    p_capacity TEXT,
    p_accuracy_class TEXT,
    p_owner_name TEXT,
    p_owner_address TEXT,
    p_verification_authority TEXT,
    p_verification_officer TEXT,
    p_verification_date DATE,
    p_expiry_date DATE,
    p_seal_number TEXT,
    p_qr_code_token UUID,
    p_remarks TEXT,
    p_issued_at TIMESTAMPTZ,
    p_content_hash TEXT,
    p_signature TEXT,
    p_issued_by UUID,
    p_timeline_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_app_status TEXT;
    v_app_type TEXT;
    v_app_instrument_id UUID;
    v_issuer_role TEXT;
    v_existing_cert UUID;
BEGIN
    -- 1. Validate the application exists, lock it, and get core relationship
    SELECT status, application_type, instrument_id INTO v_app_status, v_app_type, v_app_instrument_id
    FROM public.applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found: %', p_application_id;
    END IF;

    -- 2. Validate instrument relationship integrity (Cannot forge relation)
    IF v_app_instrument_id != p_instrument_id THEN
        RAISE EXCEPTION 'Instrument relationship forgery detected. Expected %, got %', v_app_instrument_id, p_instrument_id;
    END IF;

    -- 3. Ensure application is in passed status
    IF v_app_status != 'passed' THEN
        RAISE EXCEPTION 'Application must be in passed status to issue a certificate.';
    END IF;

    -- 4. Ensure not IN_SERVICE_INSPECTION
    IF lower(v_app_type) LIKE '%in-service%' OR lower(v_app_type) LIKE '%in_service%' OR lower(v_app_type) LIKE '%surveillance%' THEN
        RAISE EXCEPTION 'Cannot issue certificate for in-service surveillance inspection applications.';
    END IF;

    -- 5. Ensure issuance principal is valid
    SELECT role INTO v_issuer_role FROM public.profiles WHERE id = p_issued_by;
    IF v_issuer_role NOT IN ('lmd', 'officer') THEN
        RAISE EXCEPTION 'Unauthorized issuance principal. User role is %', v_issuer_role;
    END IF;

    -- 6. Ensure no existing certificate (Duplicate Protection)
    SELECT id INTO v_existing_cert
    FROM public.certificates
    WHERE application_id = p_application_id;

    IF FOUND THEN
        RAISE EXCEPTION 'DUPLICATE_CERTIFICATE: Certificate already exists for application %', p_application_id;
    END IF;

    -- 7. Insert certificate
    INSERT INTO public.certificates (
        id, application_id, instrument_id, certificate_number, instrument_type, serial_number,
        manufacturer, model, capacity, accuracy_class, owner_name, owner_address,
        verification_authority, verification_officer, verification_date, expiry_date,
        status, seal_number, qr_code_token, remarks, issued_at, content_hash, signature
    ) VALUES (
        p_cert_id, p_application_id, p_instrument_id, p_certificate_number, p_instrument_type, p_serial_number,
        p_manufacturer, p_model, p_capacity, p_accuracy_class, p_owner_name, p_owner_address,
        p_verification_authority, p_verification_officer, p_verification_date, p_expiry_date,
        'VERIFIED', p_seal_number, p_qr_code_token, p_remarks, p_issued_at, p_content_hash, p_signature
    );

    -- 8. Update instrument state
    UPDATE public.instruments
    SET 
        status = 'active',
        last_verification_date = p_verification_date,
        next_reverification_due = p_expiry_date
    WHERE id = p_instrument_id;

    -- 9. Insert certificate_issuance_log
    INSERT INTO public.certificate_issuance_log (
        certificate_id, application_id, content_hash, signature, issued_by, signed_at
    ) VALUES (
        p_cert_id, p_application_id, p_content_hash, p_signature, p_issued_by, p_issued_at
    );

    -- 10. Atomically Record Timeline Event
    INSERT INTO public.app_timeline (
        application_id, event_type, step, old_status, new_status, actor_user_id, actor_role, message
    ) VALUES (
        p_application_id, 'CERTIFICATE_GENERATED', 'Certificate Issued', 'passed', 'passed', p_issued_by, v_issuer_role, p_timeline_message
    );

    RETURN p_cert_id;
END;
$$;

-- 5. RPC Security Constraints
REVOKE EXECUTE ON FUNCTION public.atomic_issue_certificate FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.atomic_issue_certificate FROM anon;
REVOKE EXECUTE ON FUNCTION public.atomic_issue_certificate FROM authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_issue_certificate TO service_role;
