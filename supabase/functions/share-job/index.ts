import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const shareSchema = z.object({
  job_id: z.string().uuid({ message: "Invalid job ID format" }),
  email: z.string().email({ message: "Invalid email address" }).max(255),
  role: z.enum(['viewer', 'editor'])
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Share job function called');

    // Get authenticated user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse and validate request body
    const body = await req.json();
    const validatedData = shareSchema.parse(body);
    console.log('Request validated:', validatedData);

    // Verify user owns the job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', validatedData.job_id)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (job.user_id !== user.id) {
      console.error('User does not own job');
      return new Response(
        JSON.stringify({ error: 'Not authorized to share this job' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Job ownership verified');

    // Use admin client to look up user by email
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: targetUserData, error: userLookupError } = await adminClient.auth.admin.listUsers();
    
    if (userLookupError) {
      console.error('User lookup error:', userLookupError);
      return new Response(
        JSON.stringify({ error: 'Failed to lookup user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetUser = targetUserData.users.find(u => u.email === validatedData.email);

    if (!targetUser) {
      console.log('Target user not found:', validatedData.email);
      return new Response(
        JSON.stringify({ error: 'User not found with that email address' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Target user found:', targetUser.id);

    // Check if already shared
    const { data: existingShare } = await supabase
      .from('shared_jobs')
      .select('id')
      .eq('job_id', validatedData.job_id)
      .eq('shared_with_user_id', targetUser.id)
      .single();

    if (existingShare) {
      return new Response(
        JSON.stringify({ error: 'Job already shared with this user' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create share record
    const { error: shareError } = await supabase
      .from('shared_jobs')
      .insert({
        job_id: validatedData.job_id,
        shared_with_user_id: targetUser.id,
        role: validatedData.role,
        created_by: user.id
      });

    if (shareError) {
      console.error('Share creation error:', shareError);
      return new Response(
        JSON.stringify({ error: 'Failed to share job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Job shared successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Job shared successfully',
        shared_with: targetUser.email 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in share-job function:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
