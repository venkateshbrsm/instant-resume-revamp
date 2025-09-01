@echo off
REM Setup script for MuPDF WebViewer (Windows)
REM This script copies the required library assets to the public folder

echo Setting up MuPDF WebViewer...

REM Create the lib directory in public if it doesn't exist
if not exist "public\lib" mkdir "public\lib"

REM Copy MuPDF WebViewer library assets
if exist "node_modules\mupdf-webviewer\lib" (
  echo Copying MuPDF WebViewer assets to public\lib...
  xcopy "node_modules\mupdf-webviewer\lib\*" "public\lib\" /E /I /Y
  echo ✅ MuPDF WebViewer assets copied successfully!
  echo 📁 Assets are now available at: public\lib\
) else (
  echo ❌ Error: MuPDF WebViewer not found in node_modules
  echo Please run 'npm install' first to install dependencies
  exit /b 1
)

echo.
echo 🎉 MuPDF WebViewer setup complete!
echo.
echo Next steps:
echo 1. For development: The viewer will use a TRIAL license key
echo 2. For production: Get a license key from https://webviewer.mupdf.com/
echo 3. Update the licenseKey in src/components/MuPDFWebViewer.tsx
echo.