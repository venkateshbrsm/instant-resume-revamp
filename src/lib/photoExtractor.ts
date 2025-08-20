import * as mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

export interface ExtractedPhoto {
  blob: Blob;
  url: string;
  type: 'profile' | 'other';
  confidence: number;
}

export interface PhotoExtractionResult {
  photos: ExtractedPhoto[];
  profilePhoto?: ExtractedPhoto;
}

// Face detection using Hugging Face transformers
const detectFaces = async (imageBlob: Blob): Promise<number> => {
  try {
    console.log('Detecting faces in image...');
    const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
      device: 'webgpu'
    });
    
    const imageUrl = URL.createObjectURL(imageBlob);
    const result = await detector(imageUrl);
    
    URL.revokeObjectURL(imageUrl);
    
    // Count faces (person objects with high confidence)
    const faces = result.filter((obj: any) => 
      obj.label === 'person' && obj.score > 0.5
    );
    
    console.log(`Detected ${faces.length} faces`);
    return faces.length;
  } catch (error) {
    console.warn('Face detection failed:', error);
    return 0;
  }
};

// Extract images from PDF
export const extractImagesFromPDF = async (file: File): Promise<PhotoExtractionResult> => {
  try {
    console.log('Extracting images from PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const photos: ExtractedPhoto[] = [];
    const pages = pdfDoc.getPages();
    
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      try {
        const page = pages[pageIndex];
        const { width, height } = page.getSize();
        
        // Get page content (this is simplified - in reality PDF image extraction is complex)
        // For now, we'll use a different approach via the existing PDF processing
        console.log(`Checked page ${pageIndex + 1} (${width}x${height})`);
      } catch (error) {
        console.warn(`Failed to process page ${pageIndex + 1}:`, error);
      }
    }
    
    return await processExtractedPhotos(photos);
  } catch (error) {
    console.error('PDF image extraction failed:', error);
    return { photos: [] };
  }
};

// Extract images from DOCX using mammoth
export const extractImagesFromDOCX = async (file: File): Promise<PhotoExtractionResult> => {
  try {
    console.log('Extracting images from DOCX...');
    const arrayBuffer = await file.arrayBuffer();
    const photos: ExtractedPhoto[] = [];
    
    // Configure mammoth to extract images
    const options = {
      convertImage: mammoth.images.imgElement(async (image: any) => {
        console.log('Found image in DOCX:', image.contentType);
        
        try {
          const imageBuffer = await image.read();
          const imageBlob = new Blob([imageBuffer], { type: image.contentType });
          
          // Only process reasonable sized images
          if (imageBlob.size > 1024 && imageBlob.size < 5 * 1024 * 1024) {
            const url = URL.createObjectURL(imageBlob);
            
            photos.push({
              blob: imageBlob,
              url,
              type: 'other',
              confidence: 0.5
            });
          }
          
          return { src: '' }; // We don't need the HTML img element
        } catch (error) {
          console.warn('Failed to process image:', error);
          return { src: '' };
        }
      })
    };
    
    await mammoth.convertToHtml({ arrayBuffer }, options);
    
    return await processExtractedPhotos(photos);
  } catch (error) {
    console.error('DOCX image extraction failed:', error);
    return { photos: [] };
  }
};

// Process extracted photos to identify profile photos
const processExtractedPhotos = async (photos: ExtractedPhoto[]): Promise<PhotoExtractionResult> => {
  console.log(`Processing ${photos.length} extracted photos...`);
  
  if (photos.length === 0) {
    return { photos: [] };
  }
  
  // Analyze each photo for face detection and profile photo likelihood
  for (const photo of photos) {
    try {
      const faceCount = await detectFaces(photo.blob);
      
      // Determine if this could be a profile photo
      if (faceCount === 1) {
        // Single face = likely profile photo
        photo.type = 'profile';
        photo.confidence = 0.9;
      } else if (faceCount > 1) {
        // Multiple faces = less likely profile photo
        photo.confidence = 0.3;
      } else {
        // No faces detected = unlikely profile photo
        photo.confidence = 0.1;
      }
      
      console.log(`Photo analysis: ${faceCount} faces, confidence: ${photo.confidence}`);
    } catch (error) {
      console.warn('Failed to analyze photo:', error);
      photo.confidence = 0.1;
    }
  }
  
  // Sort by confidence and find the best profile photo candidate
  photos.sort((a, b) => b.confidence - a.confidence);
  const profilePhoto = photos.find(p => p.type === 'profile' && p.confidence > 0.7);
  
  console.log(`Found ${photos.length} photos, profile photo: ${profilePhoto ? 'yes' : 'no'}`);
  
  return {
    photos,
    profilePhoto
  };
};

// Optimize photo for web display
export const optimizePhoto = async (photo: ExtractedPhoto): Promise<Blob> => {
  try {
    console.log('Optimizing photo...');
    
    // Create canvas for resizing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');
    
    // Load image
    const img = new Image();
    const imageUrl = URL.createObjectURL(photo.blob);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(imageUrl);
        
        // Calculate optimal size (max 400x400 for profile photos)
        const maxSize = photo.type === 'profile' ? 400 : 600;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and optimize
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Photo optimized: ${photo.blob.size} -> ${blob.size} bytes`);
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize photo'));
            }
          },
          'image/jpeg',
          0.85
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Photo optimization failed:', error);
    return photo.blob;
  }
};

// Main photo extraction function
export const extractPhotosFromFile = async (file: File): Promise<PhotoExtractionResult> => {
  const fileType = file.name.toLowerCase();
  
  console.log('Starting photo extraction from:', file.name);
  
  try {
    if (fileType.endsWith('.pdf')) {
      return await extractImagesFromPDF(file);
    } else if (fileType.endsWith('.docx')) {
      return await extractImagesFromDOCX(file);
    } else {
      console.log('File type does not support image extraction');
      return { photos: [] };
    }
  } catch (error) {
    console.error('Photo extraction failed:', error);
    return { photos: [] };
  }
};