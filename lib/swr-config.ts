import { SWRConfiguration } from 'swr'

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't revalidate on window focus
  revalidateOnReconnect: true, // Revalidate when browser regains connection
  refreshInterval: 30000, // Refresh every 30 seconds
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  shouldRetryOnError: true, // Retry on error
  errorRetryCount: 3, // Maximum retry count
  errorRetryInterval: 5000, // Retry interval in milliseconds
  keepPreviousData: true, // Keep previous data while revalidating
} 