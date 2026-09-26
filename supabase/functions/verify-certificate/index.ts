import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { buildCertificatePayload, signPayload, hashPayload, timingSafeEqual } from '../_shared/certificateSigning.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const certId = url.searchParams.get('id')
    const certNum = url.searchParams.get('cert_number')
    const qrToken = url.searchParams.get('qr_token')

    if (!certId && !certNum && !qrToken) {
      return new Response(JSON.stringify({ error: 'Missing certificate identifier' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let query = supabaseAdmin.from('certificates').select('*')
    if (qrToken) {
      query = query.eq('qr_code_token', qrToken)
    } else if (certId) {
      query = query.eq('id', certId)
    } else if (certNum) {
      query = query.eq('certificate_number', certNum)
    }

    // 1. Fetch certificate
    const { data: cert, error: certErr } = await query.maybeSingle()

    if (certErr || !cert) {
      return new Response(JSON.stringify({ verification_status: 'NOT_FOUND' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, 
      })
    }

    // 2. Fetch issuance log (Check for strict cardinality)
    const { data: logs, error: logErr } = await supabaseAdmin
      .from('certificate_issuance_log')
      .select('*')
      .eq('certificate_id', cert.id)

    if (logErr) {
      throw new Error('Database error retrieving issuance logs')
    }

    if (!logs || logs.length === 0) {
      // Certificate exists but has no issuance log (pre-signing legacy cert).
      // Return full cert data so the frontend can still display the certificate document.
      return new Response(JSON.stringify({
        verification_status: 'NOT_VERIFIED',
        certificate_number: cert.certificate_number,
        expiry_date: cert.expiry_date,
        verification_date: cert.verification_date,
        owner_name: cert.owner_name,
        owner_address: cert.owner_address,
        instrument_type: cert.instrument_type,
        manufacturer: cert.manufacturer,
        model: cert.model,
        capacity: cert.capacity,
        accuracy_class: cert.accuracy_class,
        serial_number: cert.serial_number,
        verification_authority: cert.verification_authority,
        seal_number: cert.seal_number,
        qr_code_token: cert.qr_code_token,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (logs.length > 1) {
      return new Response(JSON.stringify({ verification_status: 'MISMATCH' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const log = logs[0]

    // 3. Rebuild canonical payload
    const payload = {
      id: cert.id,
      application_id: cert.application_id,
      instrument_id: cert.instrument_id,
      certificate_number: cert.certificate_number,
      instrument_type: cert.instrument_type,
      serial_number: cert.serial_number,
      manufacturer: cert.manufacturer,
      model: cert.model,
      capacity: cert.capacity,
      accuracy_class: cert.accuracy_class,
      owner_name: cert.owner_name,
      owner_address: cert.owner_address,
      verification_authority: cert.verification_authority,
      verification_officer: cert.verification_officer,
      verification_date: cert.verification_date,
      expiry_date: cert.expiry_date,
      seal_number: cert.seal_number,
      qr_code_token: cert.qr_code_token,
      issued_at: cert.issued_at,
    }

    const canonicalPayload = buildCertificatePayload(payload)
    const signingKey = Deno.env.get('CERT_SIGNING_KEY')
    if (!signingKey) {
      throw new Error('Server configuration error: CERT_SIGNING_KEY missing')
    }

    // 4. Recompute cryptographic values
    const recomputedSignature = await signPayload(canonicalPayload, signingKey)
    const recomputedHash = await hashPayload(canonicalPayload)

    // 5. Strict comparison: Recomputed must match BOTH the certificate row and the locked log row
    const hashMatchCert = cert.content_hash ? timingSafeEqual(recomputedHash, cert.content_hash) : false
    const hashMatchLog = timingSafeEqual(recomputedHash, log.content_hash)
    const sigMatchCert = cert.signature ? timingSafeEqual(recomputedSignature, cert.signature) : false
    const sigMatchLog = timingSafeEqual(recomputedSignature, log.signature)

    if (!hashMatchCert || !hashMatchLog || !sigMatchCert || !sigMatchLog) {
      return new Response(JSON.stringify({ verification_status: 'MISMATCH' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 6. Evaluate state
    let finalStatus = 'VERIFIED'
    if (cert.status === 'REVOKED') {
      finalStatus = 'REVOKED'
    } else {
      const exp = new Date(cert.expiry_date)
      if (exp < new Date()) {
        finalStatus = 'EXPIRED'
      }
    }

    // 7. Safe DTO (Removed internal IDs, officer name, and exact street address to protect PII, preserving only district/state if part of premises)
    // Actually, preserving owner_address as it usually contains the business premises location, which is a matter of public record for legal metrology. We omit internal IDs.
    const safeDTO = {
      certificate_number: cert.certificate_number,
      verification_status: finalStatus,
      expiry_date: cert.expiry_date,
      verification_date: cert.verification_date,
      owner_name: cert.owner_name,
      // owner_address left for premise validation by consumer, but verification_officer removed for privacy.
      owner_address: cert.owner_address,
      instrument_type: cert.instrument_type,
      manufacturer: cert.manufacturer,
      model: cert.model,
      capacity: cert.capacity,
      accuracy_class: cert.accuracy_class,
      serial_number: cert.serial_number,
      verification_authority: cert.verification_authority,
      seal_number: cert.seal_number,
      qr_code_token: cert.qr_code_token,
    }

    return new Response(JSON.stringify(safeDTO), {
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
