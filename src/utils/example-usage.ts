/**
 * Example usage of base64 utility functions
 * This file demonstrates how to use the base64 encoding/decoding utilities
 */

import { 
  encodeToBase64, 
  decodeFromBase64, 
  safeEncodeToBase64, 
  safeDecodeFromBase64,
  encodeToUrlSafeBase64,
  decodeFromUrlSafeBase64,
  isValidBase64
} from './base64.js'
import { type Trip } from '../App.js'

// Example 1: Basic encoding and decoding
export function basicExample() {
  const data = { message: "Hello, World!", number: 42, array: [1, 2, 3] }
  
  // Encode to base64
  const encoded = encodeToBase64(data)
  console.log('Encoded:', encoded)
  
  // Decode from base64
  const decoded = decodeFromBase64<typeof data>(encoded)
  console.log('Decoded:', decoded)
  
  return { encoded, decoded }
}

// Example 2: Trip data serialization
export function tripDataExample() {
  const trip: Trip = {
    id: '1',
    title: 'Beach Vacation',
    destination: 'Hawaii',
    startDate: '2024-07-01',
    endDate: '2024-07-07',
    description: 'Relaxing beach vacation with family',
    image: 'https://example.com/hawaii.jpg'
  }
  
  // Encode trip data
  const encodedTrip = encodeToBase64(trip)
  console.log('Encoded trip:', encodedTrip)
  
  // Decode trip data
  const decodedTrip = decodeFromBase64<Trip>(encodedTrip)
  console.log('Decoded trip:', decodedTrip)
  
  return { encodedTrip, decodedTrip }
}

// Example 3: Safe encoding (won't throw errors)
export function safeEncodingExample() {
  const validData = { name: "John", age: 30 }
  const invalidData = { circular: {} }
  // Create circular reference (will cause JSON.stringify to fail)
  invalidData.circular = invalidData
  
  // Safe encoding - returns null for invalid data
  const validEncoded = safeEncodeToBase64(validData)
  const invalidEncoded = safeEncodeToBase64(invalidData)
  
  console.log('Valid encoded:', validEncoded)
  console.log('Invalid encoded (should be null):', invalidEncoded)
  
  return { validEncoded, invalidEncoded }
}

// Example 4: URL-safe encoding for query parameters
export function urlSafeExample() {
  const data = { query: "search term", filters: { type: "beach", rating: 5 } }
  
  // Regular base64 (may contain +, /, =)
  const regularBase64 = encodeToBase64(data)
  
  // URL-safe base64 (safe for URLs)
  const urlSafeBase64 = encodeToUrlSafeBase64(data)
  
  console.log('Regular base64:', regularBase64)
  console.log('URL-safe base64:', urlSafeBase64)
  
  // Decode URL-safe base64
  const decoded = decodeFromUrlSafeBase64<typeof data>(urlSafeBase64)
  console.log('Decoded from URL-safe:', decoded)
  
  return { regularBase64, urlSafeBase64, decoded }
}

// Example 5: Validation
export function validationExample() {
  const validBase64 = encodeToBase64({ test: true })
  const invalidBase64 = "not-valid-base64!"
  
  console.log('Is valid base64 (valid):', isValidBase64(validBase64))
  console.log('Is valid base64 (invalid):', isValidBase64(invalidBase64))
  
  return { validBase64, invalidBase64 }
}

// Example 6: Local storage integration
export function localStorageExample() {
  const trips: Trip[] = [
    {
      id: '1',
      title: 'Mountain Hike',
      destination: 'Colorado',
      startDate: '2024-08-01',
      endDate: '2024-08-05',
      description: 'Hiking in the Rocky Mountains'
    }
  ]
  
  // Save to localStorage as base64
  const encoded = encodeToBase64(trips)
  localStorage.setItem('trips_backup', encoded)
  console.log('Saved to localStorage as base64')
  
  // Load from localStorage
  const storedData = localStorage.getItem('trips_backup')
  if (storedData) {
    const decodedTrips = safeDecodeFromBase64<Trip[]>(storedData)
    console.log('Loaded from localStorage:', decodedTrips)
    return decodedTrips
  }
  
  return null
}

// Run all examples (you can call this in console)
export function runAllExamples() {
  console.group('Base64 Utility Examples')
  
  console.group('1. Basic Example')
  basicExample()
  console.groupEnd()
  
  console.group('2. Trip Data Example')
  tripDataExample()
  console.groupEnd()
  
  console.group('3. Safe Encoding Example')
  safeEncodingExample()
  console.groupEnd()
  
  console.group('4. URL-Safe Example')
  urlSafeExample()
  console.groupEnd()
  
  console.group('5. Validation Example')
  validationExample()
  console.groupEnd()
  
  console.group('6. Local Storage Example')
  localStorageExample()
  console.groupEnd()
  
  console.groupEnd()
}
