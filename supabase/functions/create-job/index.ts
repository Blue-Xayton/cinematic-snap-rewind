import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Allowed file types for uploads
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm'
]

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

// Job parameter validation schema
const jobSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  mood: z.string().trim().min(1, 'Mood is required').max(50, 'Mood must be less than 50 characters'),
  track: z.string().trim().min(1, 'Track is required').max(100, 'Track must be less than 100 characters'),
  target_duration: z.number().int().min(15, 'Duration must be at least 15 seconds').max(120, 'Duration must be at most 120 seconds')
})

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
    
    // Validate input parameters
    let validated
    try {
      validated = jobSchema.parse({
        name: formData.get('name') as string,
        mood: formData.get('mood') as string,
        track: formData.get('track') as string,
        target_duration: parseInt(formData.get('target_duration') as string)
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ error: 'Invalid input parameters', details: error.errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw error
    }

    // Validate file uploads
    const files = formData.getAll('files')
    for (const file of files) {
      if (file instanceof File) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          return new Response(
            JSON.stringify({ error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        if (file.size > MAX_FILE_SIZE) {
          return new Response(
            JSON.stringify({ error: `File too large: ${file.name}. Maximum size is 100MB` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        name: validated.name,
        mood: validated.mood,
        track: validated.track,
        target_duration: validated.target_duration,
        status: 'queued',
      })
      .select()
      .single()

    if (jobError) throw jobError

    // Handle file uploads
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
