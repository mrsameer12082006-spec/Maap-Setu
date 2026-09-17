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
    
    // Check if LMD
    const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'lmd') {
      throw new Error('Unauthorized. Only LMD can assign officers.')
    }

    const { appId, officerId, scheduledDate, notes } = await req.json()

    // Service role client needed to bypass RLS for some operations if needed, but here LMD has full RLS access to applications.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify officer exists
    const { data: officer } = await supabaseAdmin.from('officers').select('id, user_id').eq('id', officerId).single()
    if (!officer) throw new Error('Officer not found')

    // Update application
    const { data: app, error: appError } = await supabaseClient
      .from('applications')
      .update({
        status: 'assigned',
        assigned_officer_id: officerId,
        assigned_date: new Date().toISOString().split('T')[0],
        scheduled_inspection_date: scheduledDate,
        notes: notes ? notes : null
      })
      .eq('id', appId)
      .select()
      .single()

    if (appError) throw appError

    // Insert timeline event
    await supabaseAdmin.from('app_timeline').insert({
      application_id: appId,
      event_type: 'ASSIGNMENT',
      step: 'Assigned to Officer',
      old_status: 'submitted',
      new_status: 'assigned',
      actor_user_id: user.id,
      actor_role: 'lmd',
      message: notes || 'Officer assignment complete'
    })

    return new Response(JSON.stringify({ success: true, application: app }), {
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
