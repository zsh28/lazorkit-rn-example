/**
 * Truncate Solana address for display
 * Example: "ABC...XYZ" (show first 4 and last 4 characters)
 */
export function truncateAddress(address: string, startChars: number = 4, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Validate Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    // Basic validation: 32-44 characters, base58 format
    if (!address || typeof address !== 'string') return false;
    if (address.length < 32 || address.length > 44) return false;
    
    // Check if it contains only valid base58 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(address);
  } catch (error) {
    return false;
  }
}

/**
 * Format address for display with optional label
 */
export function formatAddressDisplay(address: string, label?: string): string {
  if (label) {
    return `${label} (${truncateAddress(address)})`;
  }
  return truncateAddress(address);
}
