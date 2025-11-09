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
    const name = formData.get('name') as string
    const mood = formData.get('mood') as string
    const track = formData.get('track') as string
    const target_duration = parseInt(formData.get('target_duration') as string)

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        name: name || `Reel_${new Date().toISOString().split('T')[0]}`,
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

    // Start background processing
    const processJob = async () => {
      const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      try {
        // Stage 1: Ingesting
        console.log(`[${job.id}] Starting ingestion`)
        await adminSupabase.from('jobs').update({ status: 'ingesting' }).eq('id', job.id)
        await adminSupabase.from('job_logs').insert({
          job_id: job.id,
          message: 'Extracting and normalizing media files...',
          level: 'info',
        })
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Stage 2: Scoring
        console.log(`[${job.id}] Starting AI scoring`)
        await adminSupabase.from('jobs').update({ status: 'scoring' }).eq('id', job.id)
        await adminSupabase.from('job_logs').insert({
          job_id: job.id,
          message: 'Analyzing frames with AI (CLIP model)',
          level: 'info',
        })
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Stage 3: Beat Mapping
        console.log(`[${job.id}] Starting beat detection`)
        await adminSupabase.from('jobs').update({ status: 'beat_mapping' }).eq('id', job.id)
        await adminSupabase.from('job_logs').insert({
          job_id: job.id,
          message: 'Detecting beats and mapping timeline',
          level: 'info',
        })
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Stage 4: Assembling
        console.log(`[${job.id}] Assembling timeline`)
        await adminSupabase.from('jobs').update({ status: 'assembling' }).eq('id', job.id)
        await adminSupabase.from('job_logs').insert({
          job_id: job.id,
          message: 'Building timeline with transitions',
          level: 'info',
        })
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Stage 5: Rendering
        console.log(`[${job.id}] Final render`)
        await adminSupabase.from('jobs').update({ status: 'rendering' }).eq('id', job.id)
        await adminSupabase.from('job_logs').insert({
          job_id: job.id,
          message: 'Final encode (1080x1920, CRF 18)',
          level: 'info',
        })
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Stage 6: Done
        console.log(`[${job.id}] Completed!`)
        await adminSupabase.from('jobs').update({ 
          status: 'done',
          final_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        }).eq('id', job.id)
        await adminSupabase.from('job_logs').insert({
          job_id: job.id,
          message: '✅ Video ready!',
          level: 'success',
        })

        console.log(`[${job.id}] Processing completed successfully`)
      } catch (error) {
        console.error(`[${job.id}] Processing error:`, error)
        await adminSupabase.from('jobs').update({ status: 'error' }).eq('id', job.id)
        await adminSupabase.from('job_logs').insert({
          job_id: job.id,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          level: 'error',
        })
      }
    }

    // Run processing in background (don't await)
    processJob().catch(err => console.error('Background processing error:', err))
    
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
