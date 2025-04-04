/**
 * Utility functions for social media sharing
 */

// Interface for sharing parameters
export interface ShareParams {
  title: string;
  text: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

/**
 * Share to Facebook
 * @param params Share parameters
 */
export function shareToFacebook(params: ShareParams): void {
  // Facebook doesn't support hashtags in the same way
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(params.url)}&quote=${encodeURIComponent(params.text)}`;
  openShareWindow(url, 'Facebook');
}

/**
 * Share to Twitter
 * @param params Share parameters
 */
export function shareToTwitter(params: ShareParams): void {
  const hashtags = params.hashtags?.join(',') || 'UniMarket';
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(params.text)}&url=${encodeURIComponent(params.url)}&hashtags=${encodeURIComponent(hashtags)}`;
  openShareWindow(url, 'Twitter');
}

/**
 * Share to WhatsApp
 * @param params Share parameters
 */
export function shareToWhatsApp(params: ShareParams): void {
  const text = `${params.text} ${params.url}`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  openShareWindow(url, 'WhatsApp');
}

/**
 * Share to LinkedIn
 * @param params Share parameters
 */
export function shareToLinkedIn(params: ShareParams): void {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(params.url)}`;
  openShareWindow(url, 'LinkedIn');
}

/**
 * Share to Pinterest (requires image)
 * @param params Share parameters with image
 */
export function shareToPinterest(params: ShareParams): void {
  if (!params.image) {
    console.error('Pinterest sharing requires an image URL');
    return;
  }
  
  const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(params.url)}&media=${encodeURIComponent(params.image)}&description=${encodeURIComponent(params.text)}`;
  openShareWindow(url, 'Pinterest');
}

/**
 * Share to Reddit
 * @param params Share parameters
 */
export function shareToReddit(params: ShareParams): void {
  const url = `https://www.reddit.com/submit?url=${encodeURIComponent(params.url)}&title=${encodeURIComponent(params.title)}`;
  openShareWindow(url, 'Reddit');
}

/**
 * Share to Telegram
 * @param params Share parameters
 */
export function shareToTelegram(params: ShareParams): void {
  const url = `https://t.me/share/url?url=${encodeURIComponent(params.url)}&text=${encodeURIComponent(params.text)}`;
  openShareWindow(url, 'Telegram');
}

/**
 * Share using the Web Share API (if available)
 * @param params Share parameters
 * @returns Promise that resolves when the share is complete or is rejected if sharing fails
 */
export async function useWebShare(params: ShareParams): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }
  
  try {
    await navigator.share({
      title: params.title,
      text: params.text,
      url: params.url,
    });
  } catch (error) {
    console.error('Error sharing content:', error);
    throw error;
  }
}

/**
 * Check if the Web Share API is available
 * @returns Boolean indicating if Web Share API is available
 */
export function isWebShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Copy the share link to clipboard
 * @param url The URL to copy
 * @returns Promise that resolves when the URL is copied
 */
export async function copyToClipboard(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.error('Failed to copy:', error);
    throw error;
  }
}

/**
 * Generate a unique share URL with tracking parameters
 * @param baseUrl The base URL to share
 * @param source The source of the share (e.g., 'facebook', 'twitter')
 * @param campaign Optional campaign identifier
 * @returns Formatted URL with UTM parameters
 */
export function generateShareUrl(
  baseUrl: string, 
  source: string, 
  campaign = 'social_share'
): string {
  // Add UTM parameters for tracking
  const url = new URL(baseUrl);
  url.searchParams.append('utm_source', source);
  url.searchParams.append('utm_medium', 'social');
  url.searchParams.append('utm_campaign', campaign);
  return url.toString();
}

/**
 * Open a popup window for sharing
 * @param url The URL to open
 * @param windowTitle The title of the popup window
 */
function openShareWindow(url: string, windowTitle: string): void {
  // Standard dimensions for share popups
  const width = 600;
  const height = 400;
  const left = window.innerWidth / 2 - width / 2;
  const top = window.innerHeight / 2 - height / 2;
  
  window.open(
    url,
    windowTitle,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
  );
}