#!/bin/bash

# Setup script for MuPDF WebViewer
# This script copies the required library assets to the public folder

echo "Setting up MuPDF WebViewer..."

# Create the lib directory in public if it doesn't exist
mkdir -p public/lib

# Copy MuPDF WebViewer library assets
if [ -d "node_modules/mupdf-webviewer/lib" ]; then
  echo "Copying MuPDF WebViewer assets to public/lib..."
  cp -r node_modules/mupdf-webviewer/lib/* public/lib/
  echo "✅ MuPDF WebViewer assets copied successfully!"
  echo "📁 Assets are now available at: public/lib/"
else
  echo "❌ Error: MuPDF WebViewer not found in node_modules"
  echo "Please run 'npm install' first to install dependencies"
  exit 1
fi

echo ""
echo "🎉 MuPDF WebViewer setup complete!"
echo ""
echo "Next steps:"
echo "1. For development: The viewer will use a TRIAL license key"
echo "2. For production: Get a license key from https://webviewer.mupdf.com/"
echo "3. Update the licenseKey in src/components/MuPDFWebViewer.tsx"
echo ""