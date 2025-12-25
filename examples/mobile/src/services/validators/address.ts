import { PublicKey } from '@solana/web3.js';
import { ValidationResult } from './types';

/**
 * Validates a Solana address
 * 
 * @param address - The address string to validate
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result = validateSolanaAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateSolanaAddress(address: string): ValidationResult {
  // Check if address is empty
  if (!address || address.trim().length === 0) {
    return {
      valid: false,
      error: 'Address is required',
    };
  }

  // Trim whitespace
  const trimmedAddress = address.trim();

  // Check if address is valid base58 format
  try {
    new PublicKey(trimmedAddress);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid Solana address format',
    };
  }
}

/**
 * Checks if an address is a system program address (invalid for transfers)
 * 
 * @param address - The address to check
 * @returns ValidationResult
 */
export function validateNotSystemAddress(address: string): ValidationResult {
  const addressResult = validateSolanaAddress(address);
  if (!addressResult.valid) {
    return addressResult;
  }

  const pubkey = new PublicKey(address.trim());
  
  // Check if it's the system program address
  if (pubkey.equals(PublicKey.default)) {
    return {
      valid: false,
      error: 'Cannot send to system program address',
    };
  }

  return { valid: true };
}

/**
 * Validates that the recipient is not the sender
 * 
 * @param recipient - Recipient address
 * @param sender - Sender address
 * @returns ValidationResult
 */
export function validateNotSelfTransfer(
  recipient: string,
  sender: string
): ValidationResult {
  const recipientResult = validateSolanaAddress(recipient);
  if (!recipientResult.valid) {
    return recipientResult;
  }

  const senderResult = validateSolanaAddress(sender);
  if (!senderResult.valid) {
    return senderResult;
  }

  const recipientPubkey = new PublicKey(recipient.trim());
  const senderPubkey = new PublicKey(sender.trim());

  if (recipientPubkey.equals(senderPubkey)) {
    return {
      valid: false,
      error: 'Cannot send to your own address',
    };
  }

  return { valid: true };
}
