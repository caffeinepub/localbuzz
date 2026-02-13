/**
 * Phone number validation and normalization utilities for India (+91)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

/**
 * Normalizes and validates Indian phone numbers to E.164 format (+91XXXXXXXXXX)
 * Accepts:
 * - 10-digit numbers (e.g., 9876543210)
 * - Numbers with +91 prefix (e.g., +919876543210, +91 9876543210)
 * - Numbers with formatting characters (spaces, dashes, parentheses)
 * 
 * Rejects:
 * - Non-India country codes
 * - Invalid lengths
 * - Non-numeric characters (after removing formatting)
 */
export function normalizeIndianPhoneNumber(input: string): PhoneValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a phone number',
    };
  }

  // Remove all formatting characters (spaces, dashes, parentheses, dots)
  const cleaned = input.replace(/[\s\-().]/g, '');

  // Check if it starts with a country code
  if (cleaned.startsWith('+')) {
    // Extract country code
    const countryCodeMatch = cleaned.match(/^\+(\d{1,3})/);
    if (!countryCodeMatch) {
      return {
        isValid: false,
        error: 'Invalid phone number format',
      };
    }

    const countryCode = countryCodeMatch[1];
    
    // Only accept India country code (+91)
    if (countryCode !== '91') {
      return {
        isValid: false,
        error: 'Only Indian phone numbers (+91) are supported',
      };
    }

    // Extract the rest of the number after +91
    const restOfNumber = cleaned.substring(3); // Remove '+91'
    
    // Validate it's exactly 10 digits
    if (!/^\d{10}$/.test(restOfNumber)) {
      return {
        isValid: false,
        error: 'Indian phone numbers must be 10 digits',
      };
    }

    return {
      isValid: true,
      normalized: `+91${restOfNumber}`,
    };
  }

  // If no country code, assume it's an Indian number
  // Check if it's exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    if (cleaned.length < 10) {
      return {
        isValid: false,
        error: 'Phone number must be 10 digits',
      };
    } else {
      return {
        isValid: false,
        error: 'Phone number must be exactly 10 digits',
      };
    }
  }

  // Valid 10-digit Indian number, add +91 prefix
  return {
    isValid: true,
    normalized: `+91${cleaned}`,
  };
}

/**
 * Formats a normalized phone number for display
 * Example: +919876543210 -> +91 98765 43210
 */
export function formatPhoneNumberForDisplay(normalized: string): string {
  if (!normalized.startsWith('+91')) {
    return normalized;
  }

  const digits = normalized.substring(3); // Remove +91
  if (digits.length !== 10) {
    return normalized;
  }

  // Format as +91 XXXXX XXXXX
  return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
}
