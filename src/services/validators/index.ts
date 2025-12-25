/**
 * Validation Services
 * 
 * Centralized validation logic for addresses, amounts, and transactions.
 * 
 * @example
 * ```typescript
 * import { validateSolanaAddress, validateTokenAmount } from '@/services/validators';
 * 
 * const addressResult = validateSolanaAddress(userInput);
 * if (!addressResult.valid) {
 *   showError(addressResult.error);
 * }
 * ```
 */

export * from './types';
export * from './address';
export * from './amount';
