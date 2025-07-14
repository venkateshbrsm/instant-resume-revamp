#!/bin/bash

# Script to extract Python OCR service to separate repository

echo "Creating separate repository for Python OCR service..."

# Create new directory for the service
mkdir -p ../pdf-ocr-service
cd ../pdf-ocr-service

# Initialize git repository
git init

# Copy service files
cp ../your-lovable-project/python-ocr-service/* .

# Create initial commit
git add .
git commit -m "Initial commit: Python OCR service with PyMuPDF + pytesseract"

echo "Repository created! Now push to GitHub:"
echo "1. Create new repository on GitHub"
echo "2. git remote add origin <your-github-url>"
echo "3. git push -u origin main"