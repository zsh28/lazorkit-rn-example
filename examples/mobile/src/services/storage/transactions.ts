import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../../hooks/useTransactions';

const TRANSACTIONS_CACHE_KEY = 'transactions_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface TransactionCache {
  [walletAddress: string]: {
    transactions: Transaction[];
    cachedAt: number;
    lastSignature?: string; // Track the most recent signature
  };
}

/**
 * Get cached transactions for a wallet
 */
export async function getCachedTransactions(
  walletAddress: string
): Promise<Transaction[] | null> {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_CACHE_KEY);
    if (!data) return null;

    const cache: TransactionCache = JSON.parse(data);
    const walletCache = cache[walletAddress];

    if (!walletCache) return null;

    // Check if cache is still valid
    const now = Date.now();
    if (now - walletCache.cachedAt > CACHE_TTL) {
      console.log('📦 Transaction cache expired');
      return null;
    }

    console.log(`📦 Found ${walletCache.transactions.length} cached transactions`);
    return walletCache.transactions;
  } catch (error) {
    console.error('Error getting cached transactions:', error);
    return null;
  }
}

/**
 * Cache transactions for a wallet
 */
export async function cacheTransactions(
  walletAddress: string,
  transactions: Transaction[]
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_CACHE_KEY);
    const cache: TransactionCache = data ? JSON.parse(data) : {};

    // Find the most recent signature
    const lastSignature = transactions.length > 0 ? transactions[0].signature : undefined;

    cache[walletAddress] = {
      transactions,
      cachedAt: Date.now(),
      lastSignature,
    };

    await AsyncStorage.setItem(TRANSACTIONS_CACHE_KEY, JSON.stringify(cache));
    console.log(`📦 Cached ${transactions.length} transactions`);
  } catch (error) {
    console.error('Error caching transactions:', error);
  }
}

/**
 * Get the last cached signature for a wallet (to fetch only new transactions)
 */
export async function getLastCachedSignature(
  walletAddress: string
): Promise<string | null> {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_CACHE_KEY);
    if (!data) return null;

    const cache: TransactionCache = JSON.parse(data);
    const walletCache = cache[walletAddress];

    return walletCache?.lastSignature || null;
  } catch (error) {
    console.error('Error getting last cached signature:', error);
    return null;
  }
}

/**
 * Append new transactions to cache (for incremental updates)
 */
export async function appendTransactionsToCache(
  walletAddress: string,
  newTransactions: Transaction[]
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_CACHE_KEY);
    const cache: TransactionCache = data ? JSON.parse(data) : {};

    const walletCache = cache[walletAddress];

    if (walletCache) {
      // Merge new transactions with existing ones, avoiding duplicates
      const existingSignatures = new Set(
        walletCache.transactions.map((tx) => tx.signature)
      );
      const uniqueNewTransactions = newTransactions.filter(
        (tx) => !existingSignatures.has(tx.signature)
      );

      // Prepend new transactions (they're more recent)
      const mergedTransactions = [
        ...uniqueNewTransactions,
        ...walletCache.transactions,
      ];

      // Update cache with merged transactions
      const lastSignature =
        mergedTransactions.length > 0 ? mergedTransactions[0].signature : undefined;

      cache[walletAddress] = {
        transactions: mergedTransactions,
        cachedAt: Date.now(),
        lastSignature,
      };

      await AsyncStorage.setItem(TRANSACTIONS_CACHE_KEY, JSON.stringify(cache));
      console.log(`📦 Appended ${uniqueNewTransactions.length} new transactions to cache`);
    } else {
      // No existing cache, just cache the new transactions
      await cacheTransactions(walletAddress, newTransactions);
    }
  } catch (error) {
    console.error('Error appending transactions to cache:', error);
  }
}

/**
 * Clear transaction cache for a specific wallet
 */
export async function clearTransactionCache(walletAddress: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_CACHE_KEY);
    if (!data) return;

    const cache: TransactionCache = JSON.parse(data);
    delete cache[walletAddress];

    await AsyncStorage.setItem(TRANSACTIONS_CACHE_KEY, JSON.stringify(cache));
    console.log('📦 Cleared transaction cache for wallet');
  } catch (error) {
    console.error('Error clearing transaction cache:', error);
  }
}

/**
 * Clear all transaction caches
 */
export async function clearAllTransactionCaches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_CACHE_KEY);
    console.log('📦 Cleared all transaction caches');
  } catch (error) {
    console.error('Error clearing all transaction caches:', error);
  }
}
