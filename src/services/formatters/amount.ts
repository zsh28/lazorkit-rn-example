/**
 * Format token amount with proper decimals
 * Example: 1000000000 (9 decimals) => "1.000000000"
 */
export function formatTokenAmount(amount: number | string, decimals: number): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const result = amountNum / divisor;
  
  // Format with all decimals
  return result.toFixed(decimals);
}

/**
 * Format token amount for display (remove trailing zeros)
 * Example: "1.000000000" => "1"
 */
export function formatTokenAmountDisplay(amount: number | string, decimals: number, maxDecimals: number = 6): string {
  const formatted = formatTokenAmount(amount, decimals);
  const num = parseFloat(formatted);
  
  // Remove trailing zeros but keep at least maxDecimals precision if needed
  if (num === 0) return '0';
  
  // For very small numbers, use scientific notation
  if (num < 0.000001 && num > 0) {
    return num.toExponential(2);
  }
  
  // Otherwise format with sensible decimals
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(maxDecimals, decimals),
  });
}

/**
 * Parse user input to raw amount (with decimals)
 * Example: "1.5" (9 decimals) => 1500000000
 */
export function parseTokenAmount(input: string, decimals: number): number {
  try {
    const num = parseFloat(input);
    if (isNaN(num) || num < 0) {
      throw new Error('Invalid amount');
    }
    
    const multiplier = Math.pow(10, decimals);
    return Math.floor(num * multiplier);
  } catch (error) {
    throw new Error('Invalid amount');
  }
}

/**
 * Validate token amount input
 */
export function isValidTokenAmount(input: string): boolean {
  try {
    const num = parseFloat(input);
    return !isNaN(num) && num > 0 && isFinite(num);
  } catch {
    return false;
  }
}

/**
 * Format balance for display with symbol
 */
export function formatBalanceWithSymbol(
  amount: number | string,
  decimals: number,
  symbol: string
): string {
  const formatted = formatTokenAmountDisplay(amount, decimals);
  return `${formatted} ${symbol}`;
}

/**
 * Format SOL amount (convenience wrapper)
 */
export function formatSOL(lamports: number | string): string {
  return formatTokenAmountDisplay(lamports, 9);
}

/**
 * Parse SOL amount (convenience wrapper)
 */
export function parseSOL(input: string): number {
  return parseTokenAmount(input, 9);
}
