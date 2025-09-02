/**
 * Utility functions for encoding and decoding JSON data to/from base64 strings
 */

/**
 * Encodes a JavaScript object/value to a base64 string
 * @param data - The data to encode (any JSON-serializable value)
 * @returns Base64 encoded string
 * @throws Error if the data cannot be JSON stringified
 */
export function encodeToBase64<T>(data: T): string {
  try {
    const jsonString = JSON.stringify(data)
    // Convert to base64 using btoa (browser) or Buffer (Node.js)
    if (typeof btoa !== 'undefined') {
      return btoa(jsonString)
    } else {
      // Fallback for Node.js environment
      return Buffer.from(jsonString, 'utf-8').toString('base64')
    }
  } catch (error) {
    throw new Error(`Failed to encode data to base64: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Decodes a base64 string back to a JavaScript object/value
 * @param base64String - The base64 encoded string to decode
 * @returns The decoded data
 * @throws Error if the string cannot be decoded or parsed
 */
export function decodeFromBase64<T = unknown>(base64String: string): T {
  try {
    // Decode from base64 using atob (browser) or Buffer (Node.js)
    let jsonString: string
    if (typeof atob !== 'undefined') {
      jsonString = atob(base64String)
    } else {
      // Fallback for Node.js environment
      jsonString = Buffer.from(base64String, 'base64').toString('utf-8')
    }
    
    return JSON.parse(jsonString) as T
  } catch (error) {
    throw new Error(`Failed to decode base64 string: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Safely encodes data to base64, returning null if encoding fails
 * @param data - The data to encode
 * @returns Base64 string or null if encoding fails
 */
export function safeEncodeToBase64<T>(data: T): string | null {
  try {
    return encodeToBase64(data)
  } catch {
    return null
  }
}

/**
 * Safely decodes a base64 string, returning null if decoding fails
 * @param base64String - The base64 string to decode
 * @returns Decoded data or null if decoding fails
 */
export function safeDecodeFromBase64<T = unknown>(base64String: string): T | null {
  try {
    return decodeFromBase64<T>(base64String)
  } catch {
    return null
  }
}

/**
 * Checks if a string is valid base64
 * @param str - String to validate
 * @returns True if the string is valid base64
 */
export function isValidBase64(str: string): boolean {
  try {
    // Basic base64 pattern check
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
    if (!base64Pattern.test(str)) {
      return false
    }
    
    // Try to decode and re-encode to verify
    const decoded = decodeFromBase64(str)
    const reencoded = encodeToBase64(decoded)
    return reencoded === str
  } catch {
    return false
  }
}

/**
 * URL-safe base64 encoding (replaces + with -, / with _, and removes padding)
 * @param data - The data to encode
 * @returns URL-safe base64 string
 */
export function encodeToUrlSafeBase64<T>(data: T): string {
  const base64 = encodeToBase64(data)
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Decodes a URL-safe base64 string
 * @param urlSafeBase64 - URL-safe base64 string to decode
 * @returns Decoded data
 */
export function decodeFromUrlSafeBase64<T = unknown>(urlSafeBase64: string): T {
  // Restore standard base64 format
  let base64 = urlSafeBase64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  
  // Add padding if needed
  const padding = 4 - (base64.length % 4)
  if (padding !== 4) {
    base64 += '='.repeat(padding)
  }
  
  return decodeFromBase64<T>(base64)
}
