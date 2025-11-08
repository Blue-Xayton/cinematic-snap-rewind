import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const formData = await req.formData()
    const mood = formData.get('mood') as string
    const track = formData.get('track') as string
    const target_duration = parseInt(formData.get('target_duration') as string)

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        mood,
        track,
        target_duration,
        status: 'queued',
      })
      .select()
      .single()

    if (jobError) throw jobError

    // Handle file uploads
    const files = formData.getAll('files')
    for (const file of files) {
      if (file instanceof File) {
        const fileName = `${user.id}/${job.id}/${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Store file reference
        const fileType = file.type.startsWith('image/') ? 'image' : 'video'
        await supabase.from('media_files').insert({
          job_id: job.id,
          file_path: fileName,
          file_type: fileType,
        })
      }
    }

    // Add initial log
    await supabase.from('job_logs').insert({
      job_id: job.id,
      message: 'Job created and files uploaded',
      level: 'info',
    })

    // TODO: Trigger background processing
    // For now, we'll just return the job
    
    return new Response(
      JSON.stringify({ job_id: job.id, status: 'queued' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
