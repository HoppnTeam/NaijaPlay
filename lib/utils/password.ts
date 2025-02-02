interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  // Check minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function getPasswordStrength(password: string): number {
  let score = 0

  // Length
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character types
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

  // Complexity
  const uniqueChars = new Set(password).size
  if (uniqueChars >= 8) score += 1
  if (uniqueChars >= 12) score += 1

  // Normalize score to 0-100
  return Math.min(Math.floor((score / 9) * 100), 100)
} 