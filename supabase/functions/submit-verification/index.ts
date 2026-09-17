import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check user role securely using explicit JWT
    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Verify Officer role
    const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'officer') {
      throw new Error('Unauthorized. Only Officers can submit verification results.')
    }

    const { applicationId, outcome, checklist_results, technical_test_results, officer_remarks, rejection_reason, photo_evidence_urls } = await req.json()

    // Verify officer is assigned to this application
    const { data: officer } = await supabaseAdmin.from('officers').select('id').eq('user_id', user.id).single()
    if (!officer) throw new Error('Officer profile not found')

    const { data: app } = await supabaseAdmin.from('applications').select('assigned_officer_id, status, application_type').eq('id', applicationId).single()
    
    if (app?.assigned_officer_id !== officer.id) {
      throw new Error('Unauthorized. You are not assigned to this application.')
    }

    if (outcome === 'FAIL') {
      if (!rejection_reason || typeof rejection_reason !== 'string' || !rejection_reason.trim()) {
        throw new Error('Rejection reason is required when outcome is FAIL.')
      }
      if (rejection_reason.trim() === 'Other') {
        throw new Error('Specific rejection explanation must be provided when "Other" failure reason is selected.')
      }
    }

    // Insert verification result
    const { error: vrError } = await supabaseAdmin.from('verification_results').insert({
      application_id: applicationId,
      officer_id: officer.id,
      outcome: outcome,
      checklist_results: checklist_results || {},
      technical_test_results: technical_test_results || {},
      officer_remarks: officer_remarks,
      rejection_reason: outcome === 'FAIL' ? rejection_reason.trim() : null,
      photo_evidence_urls: photo_evidence_urls || [],
      verified_at: new Date().toISOString()
    })

    if (vrError) throw vrError

    const newStatus = outcome === 'PASS' ? 'passed' : 'failed'

    // Update Application Status
    const { error: appError } = await supabaseAdmin.from('applications').update({
      status: newStatus,
      completed_at: new Date().toISOString()
    }).eq('id', applicationId)

    if (appError) throw appError
    
    if (newStatus === 'failed') {
      // Also update instrument status to rejected if failed
      const { data: appData } = await supabaseAdmin.from('applications').select('instrument_id').eq('id', applicationId).single()
      if (appData) {
        await supabaseAdmin.from('instruments').update({ status: 'rejected' }).eq('id', appData.instrument_id)
      }
    }

    // Timeline event
    await supabaseAdmin.from('app_timeline').insert({
      application_id: applicationId,
      event_type: 'VERIFICATION',
      step: `Verification ${outcome}`,
      old_status: app?.status || 'assigned',
      new_status: newStatus,
      actor_user_id: user.id,
      actor_role: 'officer',
      message: officer_remarks || `Verification completed with result: ${outcome}`
    })

    const verificationStage = deriveVerificationStage(
      app?.application_type,
      technical_test_results?.verificationStage
    )

    let certificate = null
    let certificateStatus = null
    let responseMessage = outcome === 'PASS'
      ? 'Verification passed successfully.'
      : 'Verification failed and inspection record logged.'

    // Automatic Certificate Generation ONLY for INITIAL_VERIFICATION and SUBSEQUENT_VERIFICATION
    // IN_SERVICE_INSPECTION does NOT generate a certificate.
    if (newStatus === 'passed') {
      if (verificationStage === 'IN_SERVICE_INSPECTION') {
        certificate = null
        certificateStatus = null
        responseMessage = 'In-service surveillance inspection completed and verified compliant. No certificate generated for in-service inspections.'
      } else {
        try {
          const certResult = await issueCertificateForApplication(
            supabaseAdmin,
            applicationId,
            user.id,
            verificationStage
          )
          certificate = certResult.certificate
          certificateStatus = 'issued'
          responseMessage = `Verification passed. Certificate ${certificate.certificate_number} generated successfully.`
        } catch (certErr) {
          console.error('Automatic certificate generation failed:', certErr)
          certificate = null
          certificateStatus = 'pending'
          responseMessage = 'Verification passed. Certificate issuance is pending administrative finalization.'
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      outcome: outcome,
      applicationStatus: newStatus,
      certificate: certificate ? {
        id: certificate.id,
        certificateNumber: certificate.certificate_number,
        qrToken: certificate.qr_code_token,
        issuedAt: certificate.issued_at,
        validUntil: certificate.expiry_date,
        status: certificate.status
      } : null,
      certificateStatus: certificateStatus,
      message: responseMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

/**
 * Normalizes and validates the statutory verification stage from trusted application data.
 * Adheres strictly to OIML R76-1:
 * - INITIAL_VERIFICATION: First verification / stamping -> Certificate issued
 * - SUBSEQUENT_VERIFICATION: Periodic re-verification / repair re-stamping -> Certificate issued
 * - IN_SERVICE_INSPECTION: Official market/field surveillance inspection -> NO certificate issued
 */
function deriveVerificationStage(
  applicationType?: string,
  clientStage?: string
): 'INITIAL_VERIFICATION' | 'SUBSEQUENT_VERIFICATION' | 'IN_SERVICE_INSPECTION' {
  const dbType = String(applicationType || '').trim().toLowerCase()
  const client = String(clientStage || '').trim().toLowerCase()

  // 1. Check if application itself is an in-service inspection / surveillance
  if (
    dbType.includes('in-service') ||
    dbType.includes('in_service') ||
    dbType.includes('surveillance') ||
    dbType === 'inspection' ||
    dbType === 'in_service_inspection'
  ) {
    return 'IN_SERVICE_INSPECTION'
  }

  // 2. If client explicitly conducted an in-service inspection check
  if (
    client === 'in_service_inspection' ||
    client.includes('in-service') ||
    client.includes('in_service')
  ) {
    return 'IN_SERVICE_INSPECTION'
  }

  // 3. Periodic or Subsequent re-verification
  if (
    dbType.includes('re-verification') ||
    dbType.includes('reverification') ||
    dbType.includes('periodic') ||
    dbType.includes('subsequent') ||
    dbType.includes('repair') ||
    client === 'subsequent_verification'
  ) {
    return 'SUBSEQUENT_VERIFICATION'
  }

  // 4. Default is Initial Verification
  return 'INITIAL_VERIFICATION'
}

/**
 * Internal trusted certificate issuance helper.
 * Only called server-side after verified physical verification PASS.
 * Enforces duplicate protection, idempotency, and stage compliance.
 */
async function issueCertificateForApplication(
  supabaseAdmin: any,
  applicationId: string,
  officerUserId: string,
  verificationStage: 'INITIAL_VERIFICATION' | 'SUBSEQUENT_VERIFICATION' | 'IN_SERVICE_INSPECTION'
) {
  // Defensive guard: refuse to issue certificates for in-service surveillance
  if (verificationStage === 'IN_SERVICE_INSPECTION') {
    throw new Error('In-service surveillance inspections do not generate verification certificates.')
  }
  // 1. Check if certificate already exists (Duplicate Protection / Idempotency)
  const { data: existingCert, error: fetchCertErr } = await supabaseAdmin
    .from('certificates')
    .select('*')
    .eq('application_id', applicationId)
    .maybeSingle()

  if (fetchCertErr) {
    console.error('Error checking existing certificate:', fetchCertErr)
  }

  if (existingCert) {
    return {
      certificate: existingCert,
      isNew: false
    }
  }

  // 2. Fetch full application record with instruments, applicant profile, and assigned officer
  const { data: fullApp, error: appFetchErr } = await supabaseAdmin
    .from('applications')
    .select(`
      *,
      instruments (*),
      profiles (*),
      officers (
        *,
        profiles (*)
      )
    `)
    .eq('id', applicationId)
    .single()

  if (appFetchErr || !fullApp) {
    throw new Error(`Failed to load application details for certificate: ${appFetchErr?.message || 'Not found'}`)
  }

  if (fullApp.status !== 'passed') {
    throw new Error(`Cannot issue certificate for application with status: ${fullApp.status}`)
  }

  // 3. Format certificate dates and numbers
  const currentYear = new Date().getFullYear()
  const certNum = `CERT-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`
  const verificationDate = new Date()
  const expiryDate = new Date(verificationDate)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1) // 1 year regulatory validity

  // Preserve regulatory verification stage semantics
  const officerName = fullApp.officers?.profiles?.name || 'Authorized Verification Officer'
  const authorityName = 'State Legal Metrology Department'

  const premisesPart = fullApp.instruments?.premises_name || fullApp.inspection_location || ''
  const districtPart = fullApp.instruments?.district || ''
  const ownerAddress = `${premisesPart}${premisesPart && districtPart ? ', ' : ''}${districtPart}`.trim() || 'Premises On Record'

  const newCertPayload = {
    application_id: applicationId,
    instrument_id: fullApp.instrument_id,
    certificate_number: certNum,
    instrument_type: fullApp.instruments?.category || 'Weighing & Measuring Instrument',
    serial_number: fullApp.instruments?.serial_number || 'N/A',
    manufacturer: fullApp.instruments?.manufacturer || 'N/A',
    model: fullApp.instruments?.model_number || 'N/A',
    capacity: fullApp.instruments?.max_capacity ? `${fullApp.instruments.max_capacity} ${fullApp.instruments.unit_of_measurement || ''}`.trim() : 'N/A',
    accuracy_class: fullApp.instruments?.accuracy_class || 'Class III',
    owner_name: fullApp.profiles?.name || 'Registered Business',
    owner_address: ownerAddress,
    verification_authority: authorityName,
    verification_officer: officerName,
    verification_date: verificationDate.toISOString().split('T')[0],
    expiry_date: expiryDate.toISOString().split('T')[0],
    status: 'VERIFIED',
    seal_number: `SEAL-${Math.floor(1000 + Math.random() * 9000)}`,
    remarks: `${verificationStage} - Verified compliant under Legal Metrology Act, 2009 & OIML R76`
  }

  // 4. Insert certificate
  const { data: cert, error: certError } = await supabaseAdmin
    .from('certificates')
    .insert([newCertPayload])
    .select()
    .single()

  if (certError) {
    // Graceful race condition check: if another concurrent process inserted it
    if (certError.code === '23505') {
      const { data: racedCert } = await supabaseAdmin
        .from('certificates')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle()
      if (racedCert) {
        return { certificate: racedCert, isNew: false }
      }
    }
    throw certError
  }

  // 5. Update Instrument Status to active with new verification dates
  await supabaseAdmin.from('instruments').update({
    status: 'active',
    last_verification_date: newCertPayload.verification_date,
    next_reverification_due: newCertPayload.expiry_date
  }).eq('id', fullApp.instrument_id)

  // 6. Record truthful timeline event for automatic certificate generation
  await supabaseAdmin.from('app_timeline').insert({
    application_id: applicationId,
    event_type: 'CERTIFICATE_GENERATED',
    step: 'Certificate Issued Automatically',
    old_status: 'passed',
    new_status: 'passed',
    actor_user_id: officerUserId,
    actor_role: 'system',
    message: `Certificate ${cert.certificate_number} automatically issued upon Officer physical verification PASS`
  })

  return { certificate: cert, isNew: true }
}
