import { initializeApiFootball } from './client'

export async function initializeApi() {
  const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY

  if (!apiKey) {
    throw new Error('API Football key not found in environment variables')
  }

  // Add a small delay to ensure client is properly initialized
  await new Promise(resolve => setTimeout(resolve, 100))

  return initializeApiFootball(apiKey)
} 