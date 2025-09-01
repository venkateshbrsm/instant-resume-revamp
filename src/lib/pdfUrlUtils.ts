export const createPublicPdfUrl = async (file: File | Blob): Promise<string> => {
  // Create a blob URL for the PDF file
  const blobUrl = URL.createObjectURL(file);
  return blobUrl;
};