import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CloudConvertJob {
  id: string;
  status: string;
  files?: Array<{
    filename: string;
    url: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    const cloudConvertApiKey = Deno.env.get('CLOUDCONVERT_API_KEY')
    if (!cloudConvertApiKey) {
      throw new Error('CloudConvert API key not configured')
    }

    console.log(`Converting DOCX to PDF: ${file.name}`)

    // Step 1: Create a job
    const jobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cloudConvertApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'upload-file': {
            operation: 'upload'
          },
          'convert-file': {
            operation: 'convert',
            input: 'upload-file',
            output_format: 'pdf',
            engine: 'office'
          },
          'export-file': {
            operation: 'export/url',
            input: 'convert-file'
          }
        }
      })
    })

    if (!jobResponse.ok) {
      throw new Error(`Failed to create conversion job: ${jobResponse.statusText}`)
    }

    const job: CloudConvertJob = await jobResponse.json()
    const uploadTask = job.data.tasks.find((task: any) => task.name === 'upload-file')
    
    if (!uploadTask?.result?.form) {
      throw new Error('Failed to get upload form')
    }

    // Step 2: Upload the file
    const uploadFormData = new FormData()
    Object.entries(uploadTask.result.form.parameters).forEach(([key, value]) => {
      uploadFormData.append(key, value as string)
    })
    uploadFormData.append('file', file)

    const uploadResponse = await fetch(uploadTask.result.form.url, {
      method: 'POST',
      body: uploadFormData
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`)
    }

    console.log('File uploaded successfully, waiting for conversion...')

    // Step 3: Wait for job completion
    let jobStatus = 'processing'
    let attempts = 0
    const maxAttempts = 30

    while (jobStatus === 'processing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      
      const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${job.data.id}`, {
        headers: {
          'Authorization': `Bearer ${cloudConvertApiKey}`,
        }
      })

      if (!statusResponse.ok) {
        throw new Error(`Failed to check job status: ${statusResponse.statusText}`)
      }

      const statusData = await statusResponse.json()
      jobStatus = statusData.data.status
      attempts++

      console.log(`Job status: ${jobStatus}, attempt: ${attempts}`)
    }

    if (jobStatus !== 'finished') {
      throw new Error(`Conversion failed or timed out. Status: ${jobStatus}`)
    }

    // Step 4: Get the download URL
    const finalJobResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${job.data.id}`, {
      headers: {
        'Authorization': `Bearer ${cloudConvertApiKey}`,
      }
    })

    const finalJob = await finalJobResponse.json()
    const exportTask = finalJob.data.tasks.find((task: any) => task.name === 'export-file')
    
    if (!exportTask?.result?.files?.[0]?.url) {
      throw new Error('Failed to get download URL')
    }

    const downloadUrl = exportTask.result.files[0].url

    // Step 5: Download the converted PDF
    const pdfResponse = await fetch(downloadUrl)
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download converted PDF: ${pdfResponse.statusText}`)
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)))

    console.log('PDF conversion completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        pdfData: pdfBase64,
        originalFileName: file.name,
        convertedFileName: file.name.replace(/\.[^/.]+$/, '.pdf')
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in DOCX to PDF conversion:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})