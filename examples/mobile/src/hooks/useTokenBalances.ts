import { useQuery } from '@tanstack/react-query';
import { useLazor } from '../providers/LazorProvider';
import { getAllTokenBalances } from '../services/blockchain/tokens';
import { getHiddenTokens } from '../services/storage/tokens';
import { TokenMetadata } from '../types/tokens';
import { APP_CONFIG } from '../constants/config';

/**
 * Hook to fetch all token balances (SOL + SPL tokens)
 * Automatically filters out hidden tokens
 * Refetches every 10 seconds
 */
export function useAllTokenBalances() {
  const { smartWalletPubkey, isConnected } = useLazor();
  const walletAddress = smartWalletPubkey?.toString();

  return useQuery({
    queryKey: ['all-tokens', walletAddress],
    queryFn: async (): Promise<TokenMetadata[]> => {
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Fetch all tokens
      const allTokens = await getAllTokenBalances(walletAddress);
      
      // Get hidden tokens list
      const hiddenMints = await getHiddenTokens();
      
      // Filter out hidden tokens
      const visibleTokens = allTokens.filter(
        token => !hiddenMints.includes(token.mint)
      );
      
      return visibleTokens;
    },
    enabled: !!walletAddress,
    refetchInterval: APP_CONFIG.tokenRefreshInterval, // 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch a specific token balance
 */
export function useTokenBalance(mint: string) {
  const { data: allTokens, ...rest } = useAllTokenBalances();
  
  const token = allTokens?.find(t => t.mint === mint);
  
  return {
    data: token,
    ...rest,
  };
}

/**
 * Hook to get SOL balance specifically
 */
export function useSOLBalance() {
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  return useTokenBalance(SOL_MINT);
}
