import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Checks if a URL is from ImgBB
 * @param url The URL to check
 * @returns boolean indicating if the URL is from ImgBB
 */
export function isImgBBUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('i.ibb.co') || url.includes('ibb.co/');
}

/**
 * Function to get a secure URL with a token to avoid CORS issues
 * Modified to handle ImgBB and Firebase Storage URLs
 */
export async function getSecureImageUrl(path: string): Promise<string> {
  try {
    if (!path) return '';
    
    // If the path is already a full URL (e.g., https://...) and it's from ImgBB
    if (path.startsWith('http')) {
      // ImgBB URLs don't need any special handling for CORS
      return path;
    }
    
    // For Firebase Storage paths, get the download URL with token
    const storageRef = ref(storage, path);
    // This generates a URL with an authentication token that bypasses CORS
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting secure image URL:", error);
    return ''; // Or a placeholder image URL
  }
}

/**
 * Function to get secure URLs for an array of image paths
 * Works with both ImgBB and Firebase Storage
 */
export async function getSecureImageUrls(paths: string[]): Promise<string[]> {
  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    return [];
  }
  
  try {
    const urlPromises = paths.map(path => getSecureImageUrl(path));
    return await Promise.all(urlPromises);
  } catch (error) {
    console.error("Error getting secure image URLs:", error);
    return [];
  }
}