import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Python OCR service URL - update this after deployment
const PYTHON_OCR_SERVICE_URL = Deno.env.get('PYTHON_OCR_SERVICE_URL') || 'http://localhost:5000';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const SERVICE_TIMEOUT = 45000; // 45 seconds
const HEALTH_CHECK_TIMEOUT = 10000; // 10 seconds

// Health check function
async function checkServiceHealth(url: string): Promise<boolean> {
  try {
    console.log(`Health checking service at: ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const isHealthy = response.ok;
    console.log(`Service health check: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'} (${response.status})`);
    return isHealthy;
  } catch (error) {
    console.log(`Service health check failed: ${error.message}`);
    return false;
  }
}

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt + 1} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }
  
  throw lastError!;
}

// Warm up service if it's sleeping
async function warmUpService(url: string): Promise<void> {
  try {
    console.log(`Warming up service at: ${url}`);
    await fetch(`${url}/health`, { method: 'GET' });
    // Give the service a moment to fully wake up
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.log(`Service warm-up failed: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PDF text extraction request received');

    const formData = await req.formData();
    const pdfFile = formData.get('file') as File;

    if (!pdfFile) {
      throw new Error('No PDF file provided');
    }

    console.log(`Processing PDF: ${pdfFile.name}, Size: ${pdfFile.size} bytes`);

    // Check service health and warm up if needed
    const isHealthy = await checkServiceHealth(PYTHON_OCR_SERVICE_URL);
    if (!isHealthy) {
      console.log('Service appears to be sleeping, attempting to warm up...');
      await warmUpService(PYTHON_OCR_SERVICE_URL);
      
      // Wait a bit more and check again
      await new Promise(resolve => setTimeout(resolve, 2000));
      const isHealthyAfterWarmup = await checkServiceHealth(PYTHON_OCR_SERVICE_URL);
      
      if (!isHealthyAfterWarmup) {
        throw new Error('OCR service is currently unavailable. It may be starting up - please try again in a moment.');
      }
    }

    // Forward the PDF to the Python OCR service with retry logic
    const ocrFormData = new FormData();
    ocrFormData.append('file', pdfFile);

    console.log(`Calling Python OCR service at: ${PYTHON_OCR_SERVICE_URL}`);

    const ocrResult = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SERVICE_TIMEOUT);
      
      try {
        const response = await fetch(`${PYTHON_OCR_SERVICE_URL}/extract-pdf-text`, {
          method: 'POST',
          body: ocrFormData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Python OCR service error (${response.status}): ${errorText}`);
        }
        
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    });

    if (!ocrResult.success) {
      throw new Error(`OCR processing failed: ${ocrResult.error}`);
    }

    console.log(`✅ OCR extraction successful using ${ocrResult.method}`);
    console.log(`Pages processed: ${ocrResult.pages_processed}/${ocrResult.total_pages}`);
    console.log(`Text length: ${ocrResult.text_length} characters`);

    // Format the response for the frontend
    let finalContent = '';
    
    if (ocrResult.extracted_text && ocrResult.extracted_text.length > 50) {
      finalContent = `📄 ${pdfFile.name}

EXTRACTED CONTENT:
${ocrResult.extracted_text}

---
📊 Extraction Summary:
• File Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Method: ${ocrResult.method}
• Pages Processed: ${ocrResult.pages_processed}/${ocrResult.total_pages}
• Text Length: ${ocrResult.text_length} characters
• Status: ✅ Successfully extracted using Python OCR service`;
    } else {
      finalContent = `📄 ${pdfFile.name}

⚠️ Limited text extraction results.

Processing Details:
• File Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Method: ${ocrResult.method}
• Pages Processed: ${ocrResult.pages_processed}/${ocrResult.total_pages}

Extracted content (if any):
${ocrResult.extracted_text || '[No readable text found]'}

Possible reasons for limited results:
• Very low quality scan/image
• Handwritten content (not machine readable)
• Heavily compressed or corrupted PDF
• Non-standard fonts or languages

💡 Recommendations:
• Try uploading a higher quality PDF
• Convert to Word (.docx) format if possible
• Ensure the document has clear, readable text`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedText: finalContent,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        extractionMethod: ocrResult.method,
        pagesProcessed: ocrResult.pages_processed,
        totalPages: ocrResult.total_pages
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('PDF extraction error:', error);
    
    const isServiceUnavailable = error.message.includes('OCR service is currently unavailable') || 
                                 error.message.includes('Failed to fetch') ||
                                 error.message.includes('timeout') ||
                                 error.message.includes('AbortError');
    
    let errorContent = '';
    let fileName = 'PDF Processing';
    
    // Try to get filename if formData was parsed
    try {
      const requestFormData = await req.clone().formData();
      const file = requestFormData.get('file') as File;
      if (file) fileName = file.name;
    } catch {
      // Ignore error, use default filename
    }
    
    if (isServiceUnavailable) {
      errorContent = `📄 ${fileName}

🔄 OCR Service Temporarily Unavailable

The enhanced PDF processing service is currently starting up (this takes 30-60 seconds on the free tier).

📋 What happened:
• The OCR service went to sleep due to inactivity
• It's now waking up automatically
• This is normal for free hosting services

⏱️ What to do:
• Wait 1-2 minutes and try uploading again
• The service will stay active once warmed up
• Consider converting to .docx format for immediate processing

🔄 The service should be ready shortly. Please try again in a moment.`;
    } else {
      errorContent = `📄 PDF Processing Error

Error Details: ${error.message}

This could be due to:
• PDF file corruption or unusual format
• Very large file size (>10MB)
• Unsupported PDF encryption
• Network connectivity issues

Please try:
• Re-uploading the PDF file
• Converting to .docx or .txt format
• Checking if the PDF is password protected
• Reducing file size if very large

💡 Tip: .docx files process instantly without needing the OCR service!`;
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        extractedText: errorContent,
        extractionMethod: 'failed',
        isServiceUnavailable: isServiceUnavailable,
        recommendRetry: isServiceUnavailable
      }),
      {
        status: 200, // Return 200 to not break the UI flow
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});