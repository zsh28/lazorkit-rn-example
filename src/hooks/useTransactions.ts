import { useQuery } from '@tanstack/react-query';
import { Connection } from '@solana/web3.js';
import { useLazor } from '../providers/LazorProvider';
import { getSolanaRpcUrl } from '../constants/config';
import { getTokenMetadata } from '../services/blockchain/tokens';
import { 
  getCachedTransactions, 
  cacheTransactions, 
  getLastCachedSignature,
  appendTransactionsToCache 
} from '../services/storage/transactions';

export interface Transaction {
  signature: string;
  timestamp: number;
  type: 'sent' | 'received' | 'swap' | 'unknown';
  status: 'success' | 'failed' | 'pending';
  amount: string;
  symbol: string;
  from?: string;
  to?: string;
}

export const useTransactions = (limit: number = 20) => {
  const { smartWalletPubkey } = useLazor();

  return useQuery({
    queryKey: ['transactions', smartWalletPubkey?.toString()],
    queryFn: async (): Promise<Transaction[]> => {
      if (!smartWalletPubkey) {
        return [];
      }

      const walletAddress = smartWalletPubkey.toString();

      try {
        // Check cache first
        const cachedTransactions = await getCachedTransactions(walletAddress);
        if (cachedTransactions && cachedTransactions.length > 0) {
          console.log(`📦 Found ${cachedTransactions.length} cached transactions`);
          
          // If cached transactions are less than requested limit, fetch more
          if (cachedTransactions.length < limit) {
            console.log(`📦 Cached transactions (${cachedTransactions.length}) < requested limit (${limit}), fetching more...`);
            
            try {
              const rpcUrl = await getSolanaRpcUrl();
              const connection = new Connection(rpcUrl, 'confirmed');
              
              // Fetch all transactions up to the limit
              const allSignatures = await connection.getSignaturesForAddress(
                smartWalletPubkey,
                { limit }
              );

              console.log(`📦 Fetched ${allSignatures.length} total transaction signatures`);

              // Parse all transactions
              const allTransactions = await parseTransactions(
                connection,
                allSignatures,
                smartWalletPubkey
              );

              // Update cache with full set
              await cacheTransactions(walletAddress, allTransactions);

              return allTransactions.slice(0, limit);
            } catch (error) {
              console.error('Error fetching more transactions:', error);
              // Return cached transactions as fallback
              return cachedTransactions.slice(0, limit);
            }
          }
          
          console.log('📦 Using cached transactions');
          
          // Fetch only new transactions since last cached one
          const lastCachedSignature = await getLastCachedSignature(walletAddress);
          
          if (lastCachedSignature) {
            try {
              const rpcUrl = await getSolanaRpcUrl();
              const connection = new Connection(rpcUrl, 'confirmed');
              
              // Fetch only signatures after the last cached one
              const newSignatures = await connection.getSignaturesForAddress(
                smartWalletPubkey,
                { until: lastCachedSignature, limit: 10 } // Fetch up to 10 new transactions
              );

              console.log(`📦 Found ${newSignatures.length} new transactions since last cache`);

              if (newSignatures.length > 0) {
                // Parse new transactions
                const newTransactions = await parseTransactions(
                  connection,
                  newSignatures,
                  smartWalletPubkey
                );

                // Append to cache
                await appendTransactionsToCache(walletAddress, newTransactions);

                // Return merged result (new + cached), limited to requested amount
                const mergedTransactions = [...newTransactions, ...cachedTransactions];
                return mergedTransactions.slice(0, limit);
              }
            } catch (error) {
              console.error('Error fetching new transactions:', error);
            }
          }

          // Return cached transactions if no new ones or error, limited to requested amount
          return cachedTransactions.slice(0, limit);
        }

        // No cache, fetch all transactions
        console.log('📦 No cache found, fetching all transactions');
        const rpcUrl = await getSolanaRpcUrl();
        const connection = new Connection(rpcUrl, 'confirmed');
        
        // Fetch transaction signatures
        const signatures = await connection.getSignaturesForAddress(
          smartWalletPubkey,
          { limit }
        );

        // Parse transactions
        const transactions = await parseTransactions(
          connection,
          signatures,
          smartWalletPubkey
        );

        // Cache the transactions
        await cacheTransactions(walletAddress, transactions);

        return transactions;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        
        // Return cached transactions as fallback if available
        const cachedTransactions = await getCachedTransactions(walletAddress);
        if (cachedTransactions) {
          console.log('📦 Using cached transactions as fallback after error');
          return cachedTransactions.slice(0, limit);
        }
        
        return [];
      }
    },
    enabled: !!smartWalletPubkey,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Parse transaction signatures into Transaction objects
 */
async function parseTransactions(
  connection: Connection,
  signatures: any[],
  smartWalletPubkey: any
): Promise<Transaction[]> {
  // Fetch transaction details
  const transactions: Transaction[] = await Promise.all(
    signatures.map(async (sig) => {
      try {
              const tx = await connection.getParsedTransaction(sig.signature, {
                maxSupportedTransactionVersion: 0,
              });

              if (!tx || !tx.meta) {
                return {
                  signature: sig.signature,
                  timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                  type: 'unknown' as const,
                  status: sig.err ? 'failed' as const : 'success' as const,
                  amount: '0',
                  symbol: 'SOL',
                };
              }

              // Find the user's account index in the transaction
              const userAccountIndex = tx.transaction.message.accountKeys.findIndex(
                (key) => key.pubkey.toString() === smartWalletPubkey.toString()
              );

              // If user's account not found, skip this transaction
              if (userAccountIndex === -1) {
                return {
                  signature: sig.signature,
                  timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                  type: 'unknown' as const,
                  status: sig.err ? 'failed' as const : 'success' as const,
                  amount: '0',
                  symbol: 'SOL',
                };
              }

              // Check for SPL token transfers in parsed instructions
              let tokenTransfer = null;

              console.log(`TX ${sig.signature.slice(0, 8)}: Checking for SPL token transfers...`);
              console.log(`  innerInstructions: ${tx.meta.innerInstructions?.length || 0}`);
              console.log(`  top-level instructions: ${tx.transaction.message.instructions.length}`);

              // Look through all inner instructions for SPL token transfers
              // SPL token transfers have program = 'spl-token'
              if (tx.meta.innerInstructions) {
                for (const inner of tx.meta.innerInstructions) {
                  for (const instruction of inner.instructions) {
                    const program = 'program' in instruction ? instruction.program : null;
                    const isParsed = 'parsed' in instruction;
                    const type = isParsed ? instruction.parsed?.type : 'N/A';
                    console.log(`  Inner instruction: program=${program || 'unknown'}, parsed=${isParsed}, type=${type}`);
                    if (
                      'parsed' in instruction && 
                      instruction.program === 'spl-token' &&
                      (instruction.parsed?.type === 'transfer' || instruction.parsed?.type === 'transferChecked')
                    ) {
                      const parsed = instruction.parsed;
                      // We need to check token balance changes to see if this involves our wallet
                      // We can't just check authority because received transactions have a different authority
                      console.log(`  ✅ Found SPL token transfer (${instruction.parsed?.type}) in inner instructions`);
                      tokenTransfer = parsed.info;
                      break;
                    }
                  }
                  if (tokenTransfer) break;
                }
              }

              // Also check top-level instructions
              if (!tokenTransfer) {
                for (const instruction of tx.transaction.message.instructions) {
                  const program = 'program' in instruction ? instruction.program : null;
                  const isParsed = 'parsed' in instruction;
                  const type = isParsed ? instruction.parsed?.type : 'N/A';
                  console.log(`  Top-level instruction: program=${program || 'unknown'}, parsed=${isParsed}, type=${type}`);
                  if (
                    'parsed' in instruction && 
                    instruction.program === 'spl-token' &&
                    (instruction.parsed?.type === 'transfer' || instruction.parsed?.type === 'transferChecked')
                  ) {
                    const parsed = instruction.parsed;
                    console.log(`  ✅ Found SPL token transfer (${instruction.parsed?.type}) in top-level instructions`);
                    tokenTransfer = parsed.info;
                    break;
                  }
                }
              }

              if (!tokenTransfer) {
                console.log(`  ❌ No SPL token transfer found`);
              }

              // If we found a token transfer, parse it
              if (tokenTransfer) {
                console.log(`  Token transfer info:`, JSON.stringify(tokenTransfer, null, 2));
                
                // Get token balance changes from meta.postTokenBalances and preTokenBalances
                let tokenSymbol = 'TOKEN';
                let tokenAmount = '0';
                let tokenDecimals = 0;
                let tokenMint = '';
                let type: 'sent' | 'received' | 'unknown' = 'unknown';
                let foundTokenChange = false;

                console.log(`  preTokenBalances: ${tx.meta.preTokenBalances?.length || 0}`);
                console.log(`  postTokenBalances: ${tx.meta.postTokenBalances?.length || 0}`);

                // Find token balance changes for the user's token accounts
                if (tx.meta.preTokenBalances && tx.meta.postTokenBalances) {
                  for (const postBalance of tx.meta.postTokenBalances) {
                    const preBalance = tx.meta.preTokenBalances.find(
                      (pre) => pre.accountIndex === postBalance.accountIndex
                    );

                    console.log(`  Checking postBalance: accountIndex=${postBalance.accountIndex}, mint=${postBalance.mint}, owner=${postBalance.owner}`);
                    console.log(`    Our wallet: ${smartWalletPubkey.toString()}`);

                    // Check if this token account belongs to our wallet
                    // Token accounts have an 'owner' property that should match our smart wallet
                    const isOurAccount = postBalance.owner === smartWalletPubkey.toString() || 
                                        (preBalance && preBalance.owner === smartWalletPubkey.toString());

                    console.log(`    isOurAccount: ${isOurAccount}`);

                    // Check if there's a balance change (preBalance might not exist for newly created token accounts)
                    if (postBalance.mint && isOurAccount) {
                      const preAmount = preBalance ? parseFloat(preBalance.uiTokenAmount.uiAmountString || '0') : 0;
                      const postAmount = parseFloat(postBalance.uiTokenAmount.uiAmountString || '0');
                      const change = postAmount - preAmount;
                      
                      console.log(`    preAmount=${preAmount}, postAmount=${postAmount}, change=${change}`);
                      
                      // If there's a balance change, this is our transaction
                      if (change !== 0) {
                        tokenAmount = Math.abs(change).toString();
                        tokenDecimals = postBalance.uiTokenAmount.decimals;
                        tokenMint = postBalance.mint;
                        type = change > 0 ? 'received' : 'sent';
                        foundTokenChange = true;
                        
                        // Try to get token metadata
                        try {
                          const metadata = await getTokenMetadata(tokenMint);
                          tokenSymbol = metadata.symbol;
                        } catch (error) {
                          console.error('Error fetching token metadata:', error);
                          tokenSymbol = 'TOKEN';
                        }
                        break;
                      }
                    }
                  }
                }

                // Only return token transaction if we found a balance change
                if (foundTokenChange) {
                  console.log(`TX ${sig.signature.slice(0, 8)}: SPL token transfer detected - ${tokenSymbol} ${tokenAmount}, type=${type}`);

                  return {
                    signature: sig.signature,
                    timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                    type,
                    status: sig.err ? 'failed' as const : 'success' as const,
                    amount: tokenAmount,
                    symbol: tokenSymbol,
                    from: tokenTransfer.source || tokenTransfer.authority,
                    to: tokenTransfer.destination,
                  };
                }
                // If no token balance change found, fall through to SOL balance check
              }

              // Fall back to SOL balance changes if no token transfer found
              // Get balance change for the user's account
              const preBalance = tx.meta.preBalances[userAccountIndex] || 0;
              const postBalance = tx.meta.postBalances[userAccountIndex] || 0;
              const balanceChange = postBalance - preBalance;
              
              // Determine transaction type based on balance change
              let type: 'sent' | 'received' | 'unknown' = 'unknown';
              if (balanceChange > 0) {
                type = 'received';
              } else if (balanceChange < 0) {
                type = 'sent';
              }
              
              const amount = Math.abs(balanceChange / 1e9).toFixed(6); // Convert lamports to SOL

              // Debug logging
              console.log(`TX ${sig.signature.slice(0, 8)}: SOL transfer - pre=${preBalance}, post=${postBalance}, change=${balanceChange}, type=${type}`);

              return {
                signature: sig.signature,
                timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                type,
                status: sig.err ? 'failed' as const : 'success' as const,
                amount,
                symbol: 'SOL',
                from: tx.transaction.message.accountKeys[0]?.pubkey.toString(),
                to: tx.transaction.message.accountKeys[1]?.pubkey.toString(),
              };
            } catch (error) {
              console.error('Error parsing transaction:', error);
              return {
                signature: sig.signature,
                timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                type: 'unknown' as const,
                status: sig.err ? 'failed' as const : 'success' as const,
                amount: '0',
                symbol: 'SOL',
              };
            }
          })
        );

        // Filter out transactions with no meaningful activity
        // Keep transactions that have:
        // 1. A non-zero amount (sent/received tokens or SOL)
        // 2. OR are marked as 'sent' (even if just fees)
        return transactions.filter(tx => 
          parseFloat(tx.amount) > 0 || tx.type === 'sent'
        );
}
