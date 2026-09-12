/**
 * FarmOS Validation and Sanitization Utilities
 * Enforces data integrity, Indian postal/phone standards, and XSS defense
 */

export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/[<>]/g, '') // strip raw angle brackets to neutralize HTML/XSS
    .slice(0, 1000) // enforce max length
}

/**
 * Validates 10-digit Indian mobile number
 * Accepts formats like: "9822012345", "+91 98220 12345", "+919822012345", "98220 12345"
 */
export function normalizeAndValidatePhone(phone: string): { valid: boolean; normalized: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, normalized: '', error: 'Phone number is required' }
  }

  // Strip non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If 12 digits and starts with 91, strip the country code
  let cleanNumber = digits
  if (digits.length === 12 && digits.startsWith('91')) {
    cleanNumber = digits.slice(2)
  }

  // Indian mobile numbers must be 10 digits and start with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/
  if (!indianMobileRegex.test(cleanNumber)) {
    return {
      valid: false,
      normalized: cleanNumber,
      error: 'Please enter a valid 10-digit Indian mobile number (e.g. 98220 12345)'
    }
  }

  return { valid: true, normalized: cleanNumber }
}

/**
 * Validates 6-digit Indian PIN Code
 */
export function validatePinCode(pin: string): { valid: boolean; normalized: string; error?: string } {
  if (!pin || typeof pin !== 'string') {
    return { valid: false, normalized: '', error: 'PIN Code is required' }
  }

  const cleanPin = pin.trim().replace(/\D/g, '')
  if (cleanPin.length !== 6 || cleanPin.startsWith('0')) {
    return {
      valid: false,
      normalized: cleanPin,
      error: 'Please enter a valid 6-digit PIN code (cannot start with 0)'
    }
  }

  return { valid: true, normalized: cleanPin }
}

/**
 * Validates order item quantities
 */
export function validateQuantity(quantity: any, maxAllowed = 50): { valid: boolean; quantity: number; error?: string } {
  const num = Number(quantity)
  if (isNaN(num) || !Number.isInteger(num) || num < 1) {
    return { valid: false, quantity: 1, error: 'Quantity must be a positive whole number' }
  }
  if (num > maxAllowed) {
    return { valid: false, quantity: maxAllowed, error: `Maximum allowed quantity per order is ${maxAllowed} units` }
  }
  return { valid: true, quantity: num }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}
