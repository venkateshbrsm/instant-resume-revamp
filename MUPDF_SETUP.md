# MuPDF WebViewer Setup Instructions

This project now uses **MuPDF WebViewer** for reliable PDF viewing across all devices, including Android and iOS where native browser PDF rendering often fails.

## Quick Setup

### 1. Copy Library Assets

The MuPDF WebViewer requires library assets to be copied to your public folder. Run one of these commands:

**For Linux/macOS:**
```bash
chmod +x setup-mupdf.sh
./setup-mupdf.sh
```

**For Windows:**
```cmd
setup-mupdf.bat
```

**Or manually:**
```bash
cp -r node_modules/mupdf-webviewer/lib/* public/lib/
```

### 2. License Key

- **Development**: The app uses a `TRIAL` license key which works on `localhost`
- **Production**: You'll need a commercial license from [MuPDF WebViewer](https://webviewer.mupdf.com/)

To update the license key for production, edit `src/components/MuPDFWebViewer.tsx`:

```typescript
const mupdf = await initMuPDFWebViewer(`#${viewerId}`, url, {
  libraryPath: '/lib',
  licenseKey: 'YOUR_PRODUCTION_LICENSE_KEY', // Replace with your key
});
```

## Features

✅ **Universal Compatibility**: Works on all devices including Android Chrome and iOS Safari  
✅ **Multi-page Support**: Full PDF navigation with page thumbnails  
✅ **Mobile Optimized**: Touch-friendly interface with responsive design  
✅ **High Performance**: Optimized rendering engine by Artifex (makers of Ghostscript)  
✅ **Advanced Features**: Search, annotations, zoom, and more  
✅ **Reliable**: Commercial-grade PDF viewer used by enterprise applications  

## Device Routing

- **Desktop browsers**: Uses native iframe PDF rendering (fast, works well)
- **Mobile devices** (Android/iOS): Uses MuPDF WebViewer (reliable, feature-rich)

## Troubleshooting

### "Failed to load PDF viewer" Error

1. Ensure library assets are copied: `ls -la public/lib/` should show MuPDF files
2. Run the setup script again: `./setup-mupdf.sh`
3. Check browser console for specific errors
4. For production, verify your license key is valid for the domain

### Library Assets Missing

If you see "MuPDF WebViewer requires library assets in /public/lib/", run:

```bash
./setup-mupdf.sh
```

### License Issues

- Trial license only works on `localhost` and registered domains
- For production deployment, purchase a license from [MuPDF WebViewer](https://webviewer.mupdf.com/)
- Each license is domain-specific

## Benefits Over Previous Solutions

| Issue | Previous Solution | MuPDF WebViewer |
|-------|------------------|-----------------|
| Android Chrome PDF rendering fails | ❌ No preview | ✅ Full PDF viewer |
| iOS Safari shows only first page | ❌ Limited view | ✅ Complete navigation |
| External viewer dependencies | ❌ Google Drive API limits | ✅ Self-hosted solution |
| Blob URL restrictions | ❌ CORS issues | ✅ Full blob support |
| Mobile touch interface | ❌ Poor UX | ✅ Touch-optimized |

## Cost Considerations

- **Trial**: Free for development and testing
- **Commercial**: Pricing available at [MuPDF WebViewer Pricing](https://webviewer.mupdf.com/)
- **ROI**: Eliminates PDF viewing issues, improves user experience, reduces support tickets

## Support

- [MuPDF WebViewer Documentation](https://webviewer-docs.mupdf.com/)
- [Artifex Support](https://artifex.com/support/)
- [Community Discord](https://discord.gg/DQjvZ6ERqH)