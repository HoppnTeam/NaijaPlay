import { toast } from "@/components/ui/use-toast"

interface ErrorOptions {
  title?: string;
  context?: string;
  shouldLog?: boolean;
}

export function handleError(error: unknown, options: ErrorOptions = {}) {
  const { title = "Error", context = "", shouldLog = true } = options
  
  // Format error message
  let description = "An unexpected error occurred."
  if (error instanceof Error) {
    description = error.message
  } else if (typeof error === 'string') {
    description = error
  } else if (error && typeof error === 'object' && 'message' in error) {
    description = String((error as { message: unknown }).message)
  }

  // Add context if provided
  if (context) {
    description = `${context}: ${description}`
  }

  // Show toast notification
  toast({
    title,
    description,
    variant: "destructive",
  })

  // Log error for debugging if enabled
  if (shouldLog) {
    console.error(`[${context || 'Error'}]:`, {
      error,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    })
  }

  return { error, description }
}

// Common error messages
export const ErrorMessages = {
  AUTH: {
    NOT_LOGGED_IN: "You must be logged in to perform this action",
    INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action",
    INVALID_CREDENTIALS: "Invalid email or password",
  },
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
    PASSWORD_MISMATCH: "Passwords do not match",
  },
  DATA: {
    FETCH_ERROR: "Failed to fetch data",
    UPDATE_ERROR: "Failed to update data",
    DELETE_ERROR: "Failed to delete data",
    CREATE_ERROR: "Failed to create data",
  },
  NETWORK: {
    CONNECTION_ERROR: "Network connection error",
    TIMEOUT: "Request timed out",
  }
} as const 