# PDF OCR Service

A Python service for extracting text from PDF files using PyMuPDF and pytesseract.

## Features

- **PyMuPDF (fitz)**: Fast PDF rendering and direct text extraction
- **pytesseract OCR**: Advanced optical character recognition for scanned documents
- **Hybrid approach**: Uses direct extraction for text PDFs, OCR for scanned pages
- **High-resolution processing**: 3x zoom for better OCR accuracy
- **Production ready**: Includes health checks, error handling, and logging

## Local Development

### Prerequisites

1. Install Tesseract OCR:
   - **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr tesseract-ocr-eng`
   - **macOS**: `brew install tesseract`
   - **Windows**: Download from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)

### Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the service:
   ```bash
   python app.py
   ```

The service will be available at `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Extract PDF Text
```
POST /extract-pdf-text
Content-Type: multipart/form-data

Form data:
- file: PDF file (max 16MB)
```

**Response:**
```json
{
  "success": true,
  "extracted_text": "...",
  "method": "PyMuPDF + pytesseract",
  "pages_processed": 5,
  "total_pages": 10,
  "text_length": 1234
}
```

## Deployment Options

### Option 1: Railway (Recommended)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`

### Option 2: Render

1. Connect your GitHub repository to Render
2. Choose "Web Service"
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn --bind 0.0.0.0:$PORT app:app`

### Option 3: Google Cloud Run

1. Build and push Docker image:
   ```bash
   docker build -t pdf-ocr-service .
   docker tag pdf-ocr-service gcr.io/YOUR_PROJECT/pdf-ocr-service
   docker push gcr.io/YOUR_PROJECT/pdf-ocr-service
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy pdf-ocr-service --image gcr.io/YOUR_PROJECT/pdf-ocr-service
   ```

## Testing

Test the service with curl:
```bash
curl -X POST \
  http://localhost:5000/extract-pdf-text \
  -F "file=@/path/to/your/document.pdf"
```