import * as mammoth from 'mammoth';
import { supabase } from "@/integrations/supabase/client";
// AI dependencies removed to optimize build

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

// Face detection using heuristic approach only (AI detection removed for optimization)
const detectFaces = async (imageBlob: Blob): Promise<number> => {
  // Use heuristic detection only
  return await detectFacesHeuristic(imageBlob);
};

// Heuristic face detection based on image properties
const detectFacesHeuristic = async (imageBlob: Blob): Promise<number> => {
  try {
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageBlob);
    
    return new Promise((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(imageUrl);
        
        const { width, height } = img;
        const aspectRatio = width / height;
        const size = imageBlob.size;
        
        // Heuristic: likely a profile photo if:
        // - Square-ish aspect ratio (0.7 to 1.4)
        // - Reasonable file size (10KB to 2MB)
        // - Not too small or too large
        const isLikelyProfile = 
          aspectRatio > 0.7 && aspectRatio < 1.4 &&
          size > 10000 && size < 2000000 &&
          width > 100 && width < 2000 &&
          height > 100 && height < 2000;
        
        console.log(`Heuristic analysis: ${width}x${height}, ratio: ${aspectRatio.toFixed(2)}, size: ${size}, likely profile: ${isLikelyProfile}`);
        resolve(isLikelyProfile ? 1 : 0);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(0);
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.warn('Heuristic face detection failed:', error);
    return 0;
  }
};

// Extract images from PDF - simplified approach due to pdf-lib limitations
export const extractImagesFromPDF = async (file: File): Promise<PhotoExtractionResult> => {
  try {
    console.log('Extracting images from PDF - using external service...');
    
    // PDF image extraction is complex with pdf-lib alone
    // For now, we'll use a simplified approach that relies on the backend
    // In a production system, you'd use pdf.js or a dedicated service
    
    const photos: ExtractedPhoto[] = [];
    
    // Try to call the backend PDF processing service for image extraction
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/extract-pdf-images', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.images && result.images.length > 0) {
          for (const imageData of result.images) {
            // Convert base64 to blob
            const blob = await fetch(imageData.dataUrl).then(r => r.blob());
            const url = URL.createObjectURL(blob);
            
            photos.push({
              blob,
              url,
              type: 'other',
              confidence: 0.5
            });
          }
        }
      }
    } catch (serviceError) {
      console.log('PDF image service not available, skipping image extraction:', serviceError);
    }
    
    console.log(`Found ${photos.length} images in PDF`);
    return await processExtractedPhotos(photos);
  } catch (error) {
    console.error('PDF image extraction failed:', error);
    return { photos: [] };
  }
};

// Process extracted photos to identify profile photos
const processExtractedPhotos = async (photos: ExtractedPhoto[]): Promise<PhotoExtractionResult> => {
  console.log(`Processing ${photos.length} extracted photos...`);
  
  if (photos.length === 0) {
    console.log('No photos found to process');
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
      // For DOCX files, use the same extraction logic via edge function
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

// Extract images from DOCX files using edge function
const extractImagesFromDOCX = async (file: File): Promise<PhotoExtractionResult> => {
  console.log('Extracting images from DOCX file:', file.name);
  
  try {
    // Use the process-resume-photos edge function which handles both PDF and DOCX
    const formData = new FormData();
    formData.append('file', file);
    
    const { data, error } = await supabase.functions.invoke('process-resume-photos', {
      body: formData,
    });
    
    if (error) {
      console.error('DOCX photo extraction failed:', error);
      return { photos: [] };
    }
    
    if (data && data.photos && data.photos.length > 0) {
      console.log(`Successfully extracted ${data.photos.length} photos from DOCX`);
      
      // Convert base64 data URLs to ExtractedPhoto objects
      const photos = await Promise.all(
        data.photos.map(async (photoData: any, index: number): Promise<ExtractedPhoto | null> => {
          try {
            const response = await fetch(photoData.data_url);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            return {
              blob,
              url,
              type: index === 0 ? 'profile' : 'other',
              confidence: 0.8
            };
          } catch (error) {
            console.warn('Failed to convert photo data URL to blob:', error);
            return null;
          }
        })
      );
      
      const validPhotos = photos.filter(photo => photo !== null) as ExtractedPhoto[];
      
      return {
        photos: validPhotos,
        profilePhoto: validPhotos.length > 0 ? validPhotos[0] : undefined
      };
    }
    
    return { photos: [] };
    
  } catch (error) {
    console.error('DOCX photo extraction error:', error);
    return { photos: [] };
  }
};