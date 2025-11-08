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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { job_id } = await req.json()

    // Get media files for this job
    const { data: files, error: filesError } = await supabase
      .from('media_files')
      .select('*')
      .eq('job_id', job_id)

    if (filesError) throw filesError

    await supabase.from('job_logs').insert({
      job_id,
      message: `Analyzing ${files.length} media files...`,
      level: 'info',
    })

    // Update job status
    await supabase
      .from('jobs')
      .update({ status: 'processing', progress: 10 })
      .eq('id', job_id)

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // Score each media file using Lovable AI
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        // Get the file URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(file.file_path)

        // Use Lovable AI to score the image/video
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Analyze this image/video frame and rate it from 0-10 based on: emotional impact, composition, faces/people, action/energy, color vibrancy, and storytelling potential. Return only a number between 0 and 10.',
                  },
                  {
                    type: 'image_url',
                    image_url: { url: publicUrl },
                  },
                ],
              },
            ],
          }),
        })

        if (response.ok) {
          const result = await response.json()
          const scoreText = result.choices?.[0]?.message?.content || '5'
          const score = Math.min(10, Math.max(0, parseFloat(scoreText) || 5))

          await supabase
            .from('media_files')
            .update({ score })
            .eq('id', file.id)

          await supabase.from('job_logs').insert({
            job_id,
            message: `Scored ${file.file_type} ${i + 1}/${files.length}: ${score.toFixed(1)}/10`,
            level: 'info',
          })
        }
      } catch (error) {
        console.error(`Error scoring file ${file.id}:`, error)
        await supabase.from('job_logs').insert({
          job_id,
          message: `Failed to score file ${i + 1}/${files.length}`,
          level: 'warn',
        })
      }

      // Update progress
      const progress = Math.floor(10 + (i / files.length) * 40)
      await supabase.from('jobs').update({ progress }).eq('id', job_id)
    }

    await supabase.from('job_logs').insert({
      job_id,
      message: 'Media analysis complete',
      level: 'info',
    })

    return new Response(
      JSON.stringify({ success: true }),
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
