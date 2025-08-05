/**
 * Constructs an absolute URL for Netlify functions
 * This handles tunnel environments with embedded credentials
 * @param endpoint - The function endpoint (e.g., 'leads-submit')
 * @returns Absolute URL to the Netlify function
 */
export const getApiUrl = (endpoint: string): string => {
  return `${window.location.origin}/.netlify/functions/${endpoint}`
}
