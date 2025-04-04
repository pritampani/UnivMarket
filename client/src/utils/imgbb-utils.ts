/**
 * Utility functions for handling ImgBB image uploads
 * Enhanced to use server-side API when available
 */

const DIRECT_IMGBB_API_URL = 'https://api.imgbb.com/1/upload';
const SERVER_IMGBB_API_URL = '/api/imgbb/upload';
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

/**
 * Uploads an image to ImgBB
 * Uses the server API endpoint first, then falls back to direct API call
 * @param file The image file to upload
 * @returns Promise with the uploaded image URL
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  try {
    // First try to upload via our server endpoint
    try {
      return await uploadViaServerAPI(file);
    } catch (serverError) {
      console.warn('Server-side ImgBB upload failed, falling back to direct upload:', serverError);
      // If server upload fails, fall back to direct API
      return await uploadViaDirectAPI(file);
    }
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error);
    throw error;
  }
}

/**
 * Uploads an image to ImgBB using the server API endpoint
 * @param file The image file to upload
 * @returns Promise with the uploaded image URL
 */
async function uploadViaServerAPI(file: File): Promise<string> {
  // Create FormData object to send the image
  const formData = new FormData();
  formData.append('image', file);
  
  // Call server API to upload the image
  const response = await fetch(SERVER_IMGBB_API_URL, {
    method: 'POST',
    body: formData,
  });
  
  // Parse the response
  const data = await response.json();
  
  // Check for errors
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload image via server API');
  }
  
  // Return the URL of the uploaded image
  return data.data.url;
}

/**
 * Uploads an image directly to ImgBB API
 * @param file The image file to upload
 * @returns Promise with the uploaded image URL
 */
async function uploadViaDirectAPI(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API key is not configured');
  }
  
  // Create FormData object to send the image
  const formData = new FormData();
  formData.append('key', IMGBB_API_KEY);
  formData.append('image', file);
  
  // Call ImgBB API directly to upload the image
  const response = await fetch(DIRECT_IMGBB_API_URL, {
    method: 'POST',
    body: formData,
  });
  
  // Parse the response
  const data = await response.json();
  
  // Check for errors
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
  }
  
  // Return the URL of the uploaded image
  return data.data.url;
}

/**
 * Uploads multiple images to ImgBB
 * @param files The image files to upload
 * @returns Promise with an array of uploaded image URLs
 */
export async function uploadMultipleImagesToImgBB(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }
  
  try {
    // Upload all images in parallel
    const uploadPromises = Array.from(files).map(file => uploadImageToImgBB(file));
    
    // Wait for all uploads to complete
    const imageUrls = await Promise.all(uploadPromises);
    
    return imageUrls;
  } catch (error) {
    console.error('Error uploading multiple images to ImgBB:', error);
    throw error;
  }
}