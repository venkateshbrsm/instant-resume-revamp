export const createPublicPdfUrl = async (file: File | Blob): Promise<string> => {
  // Create a blob URL for the PDF file
  const blobUrl = URL.createObjectURL(file);
  return blobUrl;
};

export const createGoogleDriveViewerUrl = (pdfUrl: string): string => {
  // Encode the PDF URL for Google Drive viewer
  const encodedUrl = encodeURIComponent(pdfUrl);
  return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodedUrl}`;
};

export const createOffice365ViewerUrl = (pdfUrl: string): string => {
  // Encode the PDF URL for Office 365 viewer
  const encodedUrl = encodeURIComponent(pdfUrl);
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
};

export const isPdfUrl = (url: string): boolean => {
  return url.toLowerCase().includes('.pdf') || url.includes('pdf');
};