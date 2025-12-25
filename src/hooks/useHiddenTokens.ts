import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHiddenTokens,
  hideToken,
  unhideToken,
} from '../services/storage/tokens';
import { useToast } from '../providers/ToastProvider';

/**
 * Hook to manage hidden tokens
 */
export function useHiddenTokens() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Query to get all hidden tokens
  const query = useQuery({
    queryKey: ['hidden-tokens'],
    queryFn: getHiddenTokens,
    staleTime: 60000, // 1 minute
  });

  // Mutation to hide a token
  const hideMutation = useMutation({
    mutationFn: (mint: string) => hideToken(mint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hidden-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['all-tokens'] });
      showToast('Token hidden', 'success');
    },
    onError: (error) => {
      console.error('Error hiding token:', error);
      showToast('Failed to hide token', 'error');
    },
  });

  // Mutation to unhide a token
  const unhideMutation = useMutation({
    mutationFn: (mint: string) => unhideToken(mint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hidden-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['all-tokens'] });
      showToast('Token unhidden', 'success');
    },
    onError: (error) => {
      console.error('Error unhiding token:', error);
      showToast('Failed to unhide token', 'error');
    },
  });

  return {
    hiddenTokens: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    hideToken: hideMutation.mutate,
    unhideToken: unhideMutation.mutate,
    isHiding: hideMutation.isPending,
    isUnhiding: unhideMutation.isPending,
  };
}

/**
 * Hook to check if a specific token is hidden
 */
export function useIsTokenHidden(mint: string) {
  const { hiddenTokens } = useHiddenTokens();
  return hiddenTokens.includes(mint);
}
