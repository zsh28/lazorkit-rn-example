import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLazor } from '../providers/LazorProvider';
import { requestAirdrop } from '../services/blockchain/tokens';
import { useToast } from '../providers/ToastProvider';

/**
 * Hook to request SOL airdrop (devnet only)
 */
export function useAirdrop() {
  const queryClient = useQueryClient();
  const { smartWalletPubkey } = useLazor();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: async (amount: number = 1) => {
      if (!smartWalletPubkey) {
        throw new Error('Wallet not connected');
      }
      
      const address = smartWalletPubkey.toString();
      return requestAirdrop(address, amount);
    },
    onSuccess: (signature) => {
      // Invalidate token balances to refetch
      queryClient.invalidateQueries({ queryKey: ['all-tokens'] });
      showToast(`Airdrop successful!`, 'success');
      console.log('Airdrop signature:', signature);
    },
    onError: (error: any) => {
      console.error('Airdrop error:', error);
      
      const errorMessage = error?.message || '';
      
      // Handle specific error types
      if (errorMessage.includes('RATE_LIMIT')) {
        showToast('Rate limit reached. Wait a few minutes or use faucet.solana.com', 'error');
      } else if (errorMessage.includes('INTERNAL_ERROR')) {
        showToast('Devnet airdrop unavailable. Try faucet.solana.com instead', 'error');
      } else if (errorMessage.includes('NETWORK_ERROR')) {
        showToast('Network error. Check your connection and try again.', 'error');
      } else if (errorMessage.includes('AIRDROP_FAILED')) {
        showToast('Airdrop failed. Try using faucet.solana.com', 'error');
      } else {
        showToast('Airdrop failed. Try again or use faucet.solana.com', 'error');
      }
    },
  });

  return {
    requestAirdrop: mutation.mutate,
    isRequesting: mutation.isPending,
    error: mutation.error,
    signature: mutation.data,
  };
}

/**
 * Hook to check if airdrop should be shown
 * Shows when SOL balance < 0.01
 */
export function useShouldShowAirdrop() {
  const { data: tokens } = useAllTokenBalances();
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  
  const solToken = tokens?.find(t => t.mint === SOL_MINT);
  const solBalance = solToken ? solToken.balance / 1e9 : 0; // Convert lamports to SOL
  
  return solBalance < 0.01;
}

// Import to avoid circular dependency error
import { useAllTokenBalances } from './useTokenBalances';
