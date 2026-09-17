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

    const { data: profile } = await supabaseClient.from('profiles').select('role, name').eq('id', user.id).single()
    if (profile?.role !== 'lmd') {
      return new Response(JSON.stringify({ error: 'Unauthorized. Only LMD can generate certificates.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    const { applicationId } = await req.json()

    // Verify application passed
    const { data: app } = await supabaseAdmin.from('applications')
      .select('*, instruments(*), profiles(*), officers(*, profiles(*))')
      .eq('id', applicationId)
      .single()

    if (!app || app.status !== 'passed') {
      throw new Error('Application must be in passed status to generate a certificate.')
    }

    const appType = String(app.application_type || '').toLowerCase()
    if (appType.includes('in-service') || appType.includes('in_service') || appType.includes('surveillance')) {
      return new Response(JSON.stringify({ error: 'Cannot issue certificate for in-service surveillance inspection applications.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabaseAdmin.from('certificates').select('*').eq('application_id', applicationId).maybeSingle()
    if (existingCert) {
      return new Response(JSON.stringify({
        success: true,
        certificate: existingCert,
        message: 'Certificate already exists for this application.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const certNum = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const verificationDate = new Date()
    const expiryDate = new Date(verificationDate)
    expiryDate.setFullYear(expiryDate.getFullYear() + 1) // 1 year validity

    const newCertPayload = {
      application_id: applicationId,
      instrument_id: app.instrument_id,
      certificate_number: certNum,
      instrument_type: app.instruments.category,
      serial_number: app.instruments.serial_number,
      manufacturer: app.instruments.manufacturer,
      model: app.instruments.model_number,
      capacity: app.instruments.max_capacity,
      accuracy_class: app.instruments.accuracy_class,
      owner_name: app.profiles.name,
      owner_address: app.instruments.premises_name + ', ' + app.instruments.district,
      verification_authority: profile.name, // LMD admin
      verification_officer: app.officers?.profiles?.name || 'Assigned Officer',
      verification_date: verificationDate.toISOString().split('T')[0],
      expiry_date: expiryDate.toISOString().split('T')[0],
      status: 'VERIFIED',
      seal_number: `SEAL-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: 'Standard Reverification'
    }

    const { data: cert, error: certError } = await supabaseAdmin.from('certificates').insert([newCertPayload]).select().single()
    if (certError) throw certError

    // Update Instrument Status
    await supabaseAdmin.from('instruments').update({
      status: 'active',
      last_verification_date: newCertPayload.verification_date,
      next_reverification_due: newCertPayload.expiry_date
    }).eq('id', app.instrument_id)

    // Timeline event
    await supabaseAdmin.from('app_timeline').insert({
      application_id: applicationId,
      event_type: 'CERTIFICATE_GENERATED',
      step: 'Certificate Issued',
      old_status: 'passed',
      new_status: 'passed',
      actor_user_id: user.id,
      actor_role: 'lmd',
      message: `Certificate ${certNum} generated successfully`
    })

    return new Response(JSON.stringify({ success: true, certificate: cert }), {
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
