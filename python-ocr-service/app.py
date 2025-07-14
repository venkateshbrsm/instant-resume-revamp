from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import logging
import os
from werkzeug.utils import secure_filename

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configure pytesseract (adjust path if needed)
# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'  # Linux
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Windows

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'service': 'PDF OCR Service v2.0',
            'libraries': {
                'pymupdf': fitz.__version__,
                'pytesseract': 'available'
            },
            'success': True,
            'timestamp': '2025-07-14-v2'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'success': False
        }), 500

@app.route('/debug', methods=['GET'])
def debug_info():
    """Debug endpoint to verify deployment"""
    import sys
    return jsonify({
        'python_version': sys.version,
        'installed_packages': str(sys.modules.keys()),
        'app_version': 'v2.0-2025-07-14',
        'success': True
    })

@app.route('/extract-pdf-text', methods=['POST'])
def extract_pdf_text():
    """Extract text from PDF using PyMuPDF + pytesseract OCR"""
    try:
        logger.info("PDF text extraction request received")
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        pdf_file = request.files['file']
        
        if pdf_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Validate file type
        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({
                'success': False,
                'error': 'File must be a PDF'
            }), 400
        
        logger.info(f"Processing PDF: {pdf_file.filename}")
        
        # Read PDF bytes
        pdf_bytes = pdf_file.read()
        logger.info(f"PDF size: {len(pdf_bytes)} bytes")
        
        # Open PDF with PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        total_pages = len(doc)
        logger.info(f"PDF has {total_pages} pages")
        
        extracted_text = ""
        max_pages = min(total_pages, 10)  # Process up to 10 pages
        
        for page_num in range(max_pages):
            try:
                logger.info(f"Processing page {page_num + 1}/{max_pages}")
                
                page = doc[page_num]
                
                # First try to extract text directly (faster for text PDFs)
                direct_text = page.get_text().strip()
                
                if len(direct_text) > 100:  # Good amount of text found
                    logger.info(f"Page {page_num + 1}: Using direct text extraction")
                    extracted_text += f"\n\n--- Page {page_num + 1} (Direct) ---\n{direct_text}"
                else:
                    # Use OCR for scanned/image pages
                    logger.info(f"Page {page_num + 1}: Using OCR")
                    
                    # Render page as high-resolution image
                    mat = fitz.Matrix(3.0, 3.0)  # 3x zoom for better OCR
                    pix = page.get_pixmap(matrix=mat)
                    img_data = pix.tobytes("png")
                    
                    # Convert to PIL Image
                    image = Image.open(io.BytesIO(img_data))
                    
                    # OCR with pytesseract - optimized settings
                    custom_config = r'--oem 3 --psm 1 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&*()_+-=[]{}|;:\'"<>/\ '
                    
                    ocr_text = pytesseract.image_to_string(
                        image,
                        config=custom_config
                    ).strip()
                    
                    if ocr_text:
                        extracted_text += f"\n\n--- Page {page_num + 1} (OCR) ---\n{ocr_text}"
                    else:
                        extracted_text += f"\n\n--- Page {page_num + 1} (OCR) ---\n[No readable text found on this page]"
                
            except Exception as page_error:
                logger.error(f"Error processing page {page_num + 1}: {str(page_error)}")
                extracted_text += f"\n\n--- Page {page_num + 1} ---\n[Error processing this page: {str(page_error)}]"
        
        # Close the document
        doc.close()
        
        # Add summary if pages were truncated
        if total_pages > max_pages:
            extracted_text += f"\n\n--- Processing Summary ---\nProcessed {max_pages} of {total_pages} total pages."
        
        logger.info(f"Extraction completed. Total text length: {len(extracted_text)} characters")
        
        return jsonify({
            'success': True,
            'extracted_text': extracted_text.strip(),
            'method': 'PyMuPDF + pytesseract',
            'pages_processed': max_pages,
            'total_pages': total_pages,
            'text_length': len(extracted_text)
        })
        
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'PDF processing failed: {str(e)}'
        }), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 16MB.'
    }), 413

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)