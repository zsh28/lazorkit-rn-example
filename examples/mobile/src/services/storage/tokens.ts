import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../constants/config';

const HIDDEN_TOKENS_KEY = 'hidden_tokens';
const TOKEN_METADATA_CACHE_KEY = 'token_metadata_cache';

interface CachedTokenMetadata {
  [mint: string]: {
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    cachedAt: number;
  };
}

/**
 * Get list of hidden token mints
 */
export async function getHiddenTokens(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(HIDDEN_TOKENS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting hidden tokens:', error);
    return [];
  }
}

/**
 * Hide a token (add to hidden list)
 */
export async function hideToken(mint: string): Promise<void> {
  try {
    const hidden = await getHiddenTokens();
    if (!hidden.includes(mint)) {
      hidden.push(mint);
      await AsyncStorage.setItem(HIDDEN_TOKENS_KEY, JSON.stringify(hidden));
    }
  } catch (error) {
    console.error('Error hiding token:', error);
    throw error;
  }
}

/**
 * Unhide a token (remove from hidden list)
 */
export async function unhideToken(mint: string): Promise<void> {
  try {
    const hidden = await getHiddenTokens();
    const filtered = hidden.filter(m => m !== mint);
    await AsyncStorage.setItem(HIDDEN_TOKENS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error unhiding token:', error);
    throw error;
  }
}

/**
 * Check if a token is hidden
 */
export async function isTokenHidden(mint: string): Promise<boolean> {
  try {
    const hidden = await getHiddenTokens();
    return hidden.includes(mint);
  } catch (error) {
    console.error('Error checking if token is hidden:', error);
    return false;
  }
}

/**
 * Get cached token metadata
 */
export async function getCachedTokenMetadata(mint: string): Promise<any | null> {
  try {
    const data = await AsyncStorage.getItem(TOKEN_METADATA_CACHE_KEY);
    if (!data) return null;
    
    const cache: CachedTokenMetadata = JSON.parse(data);
    const cached = cache[mint];
    
    if (!cached) return null;
    
    // Check if cache is still valid (24h TTL)
    const now = Date.now();
    if (now - cached.cachedAt > APP_CONFIG.metadataCacheTTL) {
      return null;
    }
    
    return cached;
  } catch (error) {
    console.error('Error getting cached token metadata:', error);
    return null;
  }
}

/**
 * Cache token metadata
 */
export async function cacheTokenMetadata(
  mint: string,
  metadata: {
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  }
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(TOKEN_METADATA_CACHE_KEY);
    const cache: CachedTokenMetadata = data ? JSON.parse(data) : {};
    
    cache[mint] = {
      ...metadata,
      cachedAt: Date.now(),
    };
    
    await AsyncStorage.setItem(TOKEN_METADATA_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching token metadata:', error);
  }
}

/**
 * Clear expired metadata cache entries
 */
export async function clearExpiredMetadataCache(): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(TOKEN_METADATA_CACHE_KEY);
    if (!data) return;
    
    const cache: CachedTokenMetadata = JSON.parse(data);
    const now = Date.now();
    
    // Filter out expired entries
    const filtered = Object.entries(cache).reduce((acc, [mint, metadata]) => {
      if (now - metadata.cachedAt <= APP_CONFIG.metadataCacheTTL) {
        acc[mint] = metadata;
      }
      return acc;
    }, {} as CachedTokenMetadata);
    
    await AsyncStorage.setItem(TOKEN_METADATA_CACHE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error clearing expired metadata cache:', error);
  }
}
