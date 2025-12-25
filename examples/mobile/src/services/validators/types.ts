/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Token metadata for validation
 */
export interface TokenMetadata {
  mint: string;
  symbol: string;
  decimals: number;
  balance: number;
}
