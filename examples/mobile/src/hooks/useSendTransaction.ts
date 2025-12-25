import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useLazor } from '../providers/LazorProvider';
import { useToast } from '../providers/ToastProvider';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';
import { createConnection } from '../services/blockchain/tokens';
import { parseTokenAmount } from '../services/formatters/amount';
import { APP_CONFIG } from '../constants/config';

/**
 * Hook to send SOL or SPL tokens
 */
export function useSendTransaction() {
  const queryClient = useQueryClient();
  const { smartWalletPubkey, signAndSendTransaction } = useLazor();
  const { showToast } = useToast();
  
  // Store callbacks in ref so they can be accessed in mutation handlers
  const callbacksRef = useRef<{ onSuccess?: () => void; onError?: (error: any) => void }>({});

  const mutation = useMutation({
    mutationFn: async ({
      recipient,
      amount,
      mint,
      decimals,
    }: {
      recipient: string;
      amount: string;
      mint: string;
      decimals: number;
    }) => {
      if (!smartWalletPubkey) {
        throw new Error('Wallet not connected');
      }

      if (!signAndSendTransaction) {
        throw new Error('Sign and send transaction not available');
      }

      console.log('=== SEND TRANSACTION START ===');
      console.log('Recipient:', recipient);
      console.log('Amount:', amount);
      console.log('Mint:', mint);
      console.log('Decimals:', decimals);
      console.log('Wallet:', smartWalletPubkey.toString());

      const connection = await createConnection();
      const recipientPubkey = new PublicKey(recipient);
      const rawAmount = parseTokenAmount(amount, decimals);

      console.log('Raw amount (lamports):', rawAmount);

      const instructions: TransactionInstruction[] = [];

      // Native SOL transfer
      if (mint === 'So11111111111111111111111111111111111111112') {
        console.log('Creating SOL transfer instruction...');
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: smartWalletPubkey,
            toPubkey: recipientPubkey,
            lamports: rawAmount,
          })
        );
        console.log('SOL transfer instruction created');
      } else {
        // SPL Token transfer
        console.log('Creating SPL token transfer instructions...');
        const mintPubkey = new PublicKey(mint);

        // Get sender's token account
        // Note: Smart wallets are PDAs (off-curve), so we need to allow off-curve owners
        const senderTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          smartWalletPubkey,
          true // allowOwnerOffCurve - required for smart wallets/PDAs
        );
        console.log('Sender token account:', senderTokenAccount.toString());

        // Get recipient's token account
        const recipientTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          recipientPubkey,
          true // allowOwnerOffCurve - recipient might also be a smart wallet
        );
        console.log('Recipient token account:', recipientTokenAccount.toString());

        // Check if recipient token account exists
        const recipientAccountInfo = await connection.getAccountInfo(
          recipientTokenAccount
        );

        // Create recipient token account if it doesn't exist
        if (!recipientAccountInfo) {
          console.log('Recipient token account does not exist, creating...');
          instructions.push(
            createAssociatedTokenAccountInstruction(
              smartWalletPubkey, // payer
              recipientTokenAccount, // associated token account
              recipientPubkey, // owner
              mintPubkey // mint
            )
          );
        } else {
          console.log('Recipient token account already exists');
        }

        // Add transfer instruction
        console.log('Adding SPL transfer instruction...');
        instructions.push(
          createTransferInstruction(
            senderTokenAccount, // source
            recipientTokenAccount, // destination
            smartWalletPubkey, // owner
            rawAmount // amount
          )
        );
      }

      console.log(`Total instructions: ${instructions.length}`);
      
      const redirectUrl = `${APP_CONFIG.scheme}://`;
      console.log('📱 App scheme from config:', APP_CONFIG.scheme);
      console.log('📱 Redirect URL that will be used:', redirectUrl);
      console.log('Opening Lazor portal for transaction approval...');
      console.log('🔵 Calling signAndSendTransaction...');
      console.log('🔵 Using redirect URL:', redirectUrl);
      console.log('🔵 Waiting for user to approve/reject in browser...');

      try {
        const signature = await signAndSendTransaction(
          {
            instructions,
            transactionOptions: {
              clusterSimulation: 'devnet',
              computeUnitLimit: 200000,
            },
          },
          {
            redirectUrl, // Deep link back to app (matches scheme in app.json)
            onSuccess: (sig: string) => {
              console.log('🎉 LazorKit onSuccess callback fired!');
              console.log('🎉 Transaction signature:', sig);
              console.log('🎉 User APPROVED transaction in browser');
            },
            onFail: (error: Error) => {
              console.error('❌ LazorKit onFail callback fired!');
              console.error('❌ Error from LazorKit:', error);
              console.error('❌ User REJECTED/CANCELLED transaction in browser');
            },
          }
        );

        console.log('🎊 signAndSendTransaction returned successfully!');
        console.log('🎊 Transaction was APPROVED and SENT!');
        console.log('🎊 Signature:', signature);
        console.log('🎊 App should now return from browser and show success');
        console.log('=== SEND TRANSACTION SUCCESS ===');

        return signature;
      } catch (txError: any) {
        console.error('❌ signAndSendTransaction failed:', txError);
        console.error('❌ Error details:', {
          message: txError?.message,
          name: txError?.name,
          stack: txError?.stack,
        });
        throw txError;
      }
    },
    onSuccess: (signature) => {
      // Invalidate token balances to refetch
      queryClient.invalidateQueries({ queryKey: ['all-tokens'] });
      showToast('Transaction sent successfully!', 'success');
      console.log('Transaction signature:', signature);
      
      // Call component callback if provided
      if (callbacksRef.current.onSuccess) {
        console.log('✅ Hook: Calling component onSuccess callback');
        callbacksRef.current.onSuccess();
      }
    },
    onError: (error: any) => {
      console.error('❌ Send transaction error:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error name:', error?.name);

      const errorMessage = error?.message?.toLowerCase() || '';
      console.log('🔍 Checking error message:', errorMessage);
      
      if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
        console.log('💰 Showing insufficient balance toast');
        showToast('Insufficient balance', 'error');
      } else if (
        errorMessage.includes('user rejected') || 
        errorMessage.includes('cancelled') ||
        errorMessage.includes('canceled') ||
        errorMessage.includes('user denied') ||
        errorMessage.includes('rejected') ||
        errorMessage.includes('sign failed: success parameter is not true')  // ← LazorKit cancellation error
      ) {
        console.log('🚫 Showing transaction cancelled toast');
        showToast('Transaction cancelled', 'error');
      } else if (errorMessage.includes('timeout')) {
        console.log('⏱️ Showing timeout toast');
        showToast('Transaction timed out', 'error');
      } else {
        console.log('⚠️ Showing generic error toast');
        showToast('Transaction failed. Please try again.', 'error');
      }
      
      // Call component callback if provided
      if (callbacksRef.current.onError) {
        console.log('❌ Hook: Calling component onError callback');
        callbacksRef.current.onError(error);
      }
    },
  });

  return {
    sendTransaction: (params: any, callbacks?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      // Store callbacks in ref
      callbacksRef.current = callbacks || {};
      
      // Trigger mutation
      mutation.mutate(params);
    },
    isSending: mutation.isPending,
    error: mutation.error,
    signature: mutation.data,
  };
}
