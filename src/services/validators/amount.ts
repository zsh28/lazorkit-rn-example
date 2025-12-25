import { ValidationResult, TokenMetadata } from './types';

/**
 * Validates a token amount string
 * 
 * @param amount - The amount string to validate
 * @param token - Token metadata including balance and decimals
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result = validateTokenAmount('1.5', {
 *   mint: '...',
 *   symbol: 'SOL',
 *   decimals: 9,
 *   balance: 10
 * });
 * ```
 */
export function validateTokenAmount(
  amount: string,
  token: TokenMetadata
): ValidationResult {
  // Check if amount is empty
  if (!amount || amount.trim().length === 0) {
    return {
      valid: false,
      error: 'Amount is required',
    };
  }

  // Parse amount
  const numAmount = parseFloat(amount);

  // Check if amount is a valid number
  if (isNaN(numAmount)) {
    return {
      valid: false,
      error: 'Invalid amount format',
    };
  }

  // Check if amount is positive
  if (numAmount <= 0) {
    return {
      valid: false,
      error: 'Amount must be greater than 0',
    };
  }

  // Check if amount exceeds balance
  if (numAmount > token.balance) {
    return {
      valid: false,
      error: `Insufficient ${token.symbol} balance`,
    };
  }

  // Check decimal places
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > token.decimals) {
    return {
      valid: false,
      error: `Maximum ${token.decimals} decimal places allowed`,
    };
  }

  return { valid: true };
}

/**
 * Validates that an amount is above a minimum threshold
 * 
 * @param amount - The amount string
 * @param minAmount - Minimum allowed amount
 * @param tokenSymbol - Token symbol for error message
 * @returns ValidationResult
 */
export function validateMinimumAmount(
  amount: string,
  minAmount: number,
  tokenSymbol: string
): ValidationResult {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return {
      valid: false,
      error: 'Invalid amount format',
    };
  }

  if (numAmount < minAmount) {
    return {
      valid: false,
      error: `Minimum amount is ${minAmount} ${tokenSymbol}`,
    };
  }

  return { valid: true };
}

/**
 * Formats and validates an amount string (removes extra decimals, leading zeros, etc.)
 * 
 * @param amount - Raw amount string from user input
 * @param decimals - Maximum decimal places allowed
 * @returns Formatted amount string or empty string if invalid
 * 
 * @example
 * ```typescript
 * formatAmountInput('01.500', 2) // Returns '1.50'
 * formatAmountInput('1.234567', 2) // Returns '1.23'
 * ```
 */
export function formatAmountInput(amount: string, decimals: number): string {
  // Remove non-numeric characters except decimal point
  let formatted = amount.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = formatted.split('.');
  if (parts.length > 2) {
    formatted = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places
  if (parts.length === 2 && parts[1].length > decimals) {
    formatted = parts[0] + '.' + parts[1].slice(0, decimals);
  }

  // Remove leading zeros (except for 0.x)
  if (formatted.length > 1 && formatted[0] === '0' && formatted[1] !== '.') {
    formatted = formatted.slice(1);
  }

  return formatted;
}
