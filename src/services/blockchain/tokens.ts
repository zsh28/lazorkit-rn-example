import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getSolanaRpcUrl, TOKEN_REGISTRY_URL } from '../../constants/config';
import { TokenMetadata, TokenAccount, TokenRegistryResponse } from '../../types/tokens';
import { getCachedTokenMetadata, cacheTokenMetadata } from '../storage/tokens';
import { formatTokenAmount } from '../formatters/amount';

/**
 * Create Solana connection with custom RPC URL support
 */
export async function createConnection(): Promise<Connection> {
  const rpcUrl = await getSolanaRpcUrl();
  return new Connection(rpcUrl, 'confirmed');
}

/**
 * Get SOL balance for an address
 */
export async function getSOLBalance(address: string): Promise<number> {
  try {
    const connection = await createConnection();
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance; // Returns lamports
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    throw error;
  }
}

/**
 * Get all SPL token accounts for an address
 */
export async function getTokenAccounts(address: string): Promise<TokenAccount[]> {
  try {
    const connection = await createConnection();
    const publicKey = new PublicKey(address);
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    return tokenAccounts.value as unknown as TokenAccount[];
  } catch (error) {
    console.error('Error getting token accounts:', error);
    throw error;
  }
}

/**
 * Fetch token metadata from Solana Token Registry
 */
let tokenRegistryCache: TokenRegistryResponse | null = null;

export async function fetchTokenRegistry(): Promise<TokenRegistryResponse> {
  // Return cached registry if available
  if (tokenRegistryCache) {
    return tokenRegistryCache;
  }
  
  try {
    const response = await fetch(TOKEN_REGISTRY_URL);
    const data: TokenRegistryResponse = await response.json();
    tokenRegistryCache = data;
    return data;
  } catch (error) {
    console.error('Error fetching token registry:', error);
    return { tokens: [] };
  }
}

/**
 * Get token metadata by mint address
 */
export async function getTokenMetadata(mint: string): Promise<{
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}> {
  // Check cache first
  const cached = await getCachedTokenMetadata(mint);
  if (cached) {
    return cached;
  }
  
  // Fetch from token registry
  const registry = await fetchTokenRegistry();
  const tokenInfo = registry.tokens.find(t => t.address === mint);
  
  if (tokenInfo) {
    const metadata = {
      symbol: tokenInfo.symbol,
      name: tokenInfo.name,
      decimals: tokenInfo.decimals,
      logoURI: tokenInfo.logoURI,
    };
    
    // Cache the result
    await cacheTokenMetadata(mint, metadata);
    return metadata;
  }
  
  // Fallback: fetch on-chain metadata (basic info)
  try {
    const connection = await createConnection();
    const mintPubkey = new PublicKey(mint);
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
    
    if (mintInfo.value?.data && typeof mintInfo.value.data === 'object' && 'parsed' in mintInfo.value.data) {
      const parsed = mintInfo.value.data.parsed;
      const decimals = parsed.info?.decimals || 9;
      
      const metadata = {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals,
      };
      
      await cacheTokenMetadata(mint, metadata);
      return metadata;
    }
  } catch (error) {
    console.error('Error fetching on-chain metadata:', error);
  }
  
  // Ultimate fallback
  return {
    symbol: 'UNKNOWN',
    name: 'Unknown Token',
    decimals: 9,
  };
}

/**
 * Get all token balances (SOL + SPL tokens) for an address
 */
export async function getAllTokenBalances(address: string): Promise<TokenMetadata[]> {
  try {
    const tokens: TokenMetadata[] = [];
    
    // Get SOL balance
    const solBalance = await getSOLBalance(address);
    tokens.push({
      mint: 'So11111111111111111111111111111111111111112', // Native SOL mint
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      balance: solBalance,
      uiBalance: formatTokenAmount(solBalance, 9),
    });
    
    // Get SPL token balances
    const tokenAccounts = await getTokenAccounts(address);
    
    // Fetch metadata for each token in parallel
    const tokenPromises = tokenAccounts.map(async (account) => {
      const info = account.account.data.parsed.info;
      const mint = info.mint;
      const balance = parseInt(info.tokenAmount.amount);
      
      // Skip tokens with zero balance
      if (balance === 0) return null;
      
      const metadata = await getTokenMetadata(mint);
      
      return {
        mint,
        ...metadata,
        balance,
        uiBalance: formatTokenAmount(balance, metadata.decimals),
      };
    });
    
    const tokenResults = await Promise.all(tokenPromises);
    const validTokens = tokenResults.filter((t): t is TokenMetadata => t !== null);
    
    tokens.push(...validTokens);
    
    // Sort by balance (non-zero first, then by amount)
    return tokens.sort((a, b) => {
      if (a.balance === 0 && b.balance === 0) return 0;
      if (a.balance === 0) return 1;
      if (b.balance === 0) return -1;
      return b.balance - a.balance;
    });
  } catch (error) {
    console.error('Error getting all token balances:', error);
    throw error;
  }
}

/**
 * Request airdrop (devnet only)
 * Note: Solana devnet airdrops are rate-limited and often fail during high usage
 */
export async function requestAirdrop(address: string, amount: number = 1): Promise<string> {
  try {
    const connection = await createConnection();
    const publicKey = new PublicKey(address);
    const lamports = amount * LAMPORTS_PER_SOL;
    
    console.log(`Requesting airdrop of ${amount} SOL to ${address}...`);
    
    const signature = await connection.requestAirdrop(publicKey, lamports);
    
    console.log('Airdrop signature received:', signature);
    console.log('Waiting for confirmation...');
    
    // Wait for confirmation with timeout
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Airdrop confirmation failed: ${JSON.stringify(confirmation.value.err)}`);
    }
    
    console.log('Airdrop confirmed successfully!');
    return signature;
  } catch (error: any) {
    console.error('Error requesting airdrop:', error);
    
    // Provide more specific error messages
    if (error?.message?.includes('rate limit') || error?.message?.includes('429')) {
      throw new Error('RATE_LIMIT: Solana devnet airdrop is rate-limited. Please wait a few minutes and try again, or get testnet SOL from https://faucet.solana.com');
    }
    
    if (error?.message?.includes('Internal error')) {
      throw new Error('INTERNAL_ERROR: Solana devnet airdrop service is currently unavailable. Try again later or use an alternative faucet at https://faucet.solana.com');
    }
    
    if (error?.message?.includes('blockhash')) {
      throw new Error('NETWORK_ERROR: Unable to connect to Solana devnet. Check your internet connection.');
    }
    
    // Generic error
    throw new Error(`AIRDROP_FAILED: ${error?.message || 'Unknown error occurred. Try using https://faucet.solana.com instead.'}`);
  }
}
