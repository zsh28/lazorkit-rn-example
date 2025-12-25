import AsyncStorage from '@react-native-async-storage/async-storage';
import { clusterApiUrl } from '@solana/web3.js';

const CUSTOM_RPC_URL_KEY = 'custom_rpc_url';

/**
 * Default RPC endpoints
 */
export const DEFAULT_RPC_ENDPOINTS = {
  devnet: clusterApiUrl('devnet'),
  helius: 'https://devnet.helius-rpc.com/?api-key=',
  quicknode: 'https://devnet.helius-rpc.com',
  alchemy: 'https://solana-devnet.g.alchemy.com/v2/',
} as const;

/**
 * Get the current RPC URL (custom or default)
 */
export async function getRpcUrl(): Promise<string> {
  try {
    const customUrl = await AsyncStorage.getItem(CUSTOM_RPC_URL_KEY);
    if (customUrl) {
      return customUrl;
    }
    return DEFAULT_RPC_ENDPOINTS.devnet;
  } catch (error) {
    console.error('Error getting RPC URL:', error);
    return DEFAULT_RPC_ENDPOINTS.devnet;
  }
}

/**
 * Set a custom RPC URL
 */
export async function setCustomRpcUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_RPC_URL_KEY, url);
  } catch (error) {
    console.error('Error setting custom RPC URL:', error);
    throw error;
  }
}

/**
 * Reset to default RPC URL
 */
export async function resetRpcUrl(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CUSTOM_RPC_URL_KEY);
  } catch (error) {
    console.error('Error resetting RPC URL:', error);
    throw error;
  }
}

/**
 * Test if an RPC URL is working
 */
export async function testRpcUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth',
      }),
    });

    const data = await response.json();
    return response.ok && (data.result === 'ok' || data.result);
  } catch (error) {
    console.error('Error testing RPC URL:', error);
    return false;
  }
}
