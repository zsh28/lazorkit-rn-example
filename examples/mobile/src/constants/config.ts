import { clusterApiUrl } from '@solana/web3.js';
import { getRpcUrl } from '../services/storage/rpc';

// Get the correct deep link scheme based on environment
// In Expo Dev Client, use the exp+slug scheme
// In production/standalone, use the custom scheme
export const getAppScheme = (): string => {
  console.log('🔧 __DEV__:', __DEV__);
  
  // Simple check: if in dev mode, use exp+ scheme
  if (__DEV__) {
    const devScheme = 'exp+lazor-kit-rn-demo';
    console.log('🔧 Development mode - using scheme:', devScheme);
    return devScheme;
  }
  
  // Production build
  console.log('🔧 Production mode - using scheme: lazordemo');
  return 'lazordemo';
};

// Lazor Kit Configuration
export const LAZOR_CONFIG = {
  cluster: 'devnet' as const,
  clientId: 'lazor-demo-wallet', // Replace with your actual client ID from Lazor
  redirectUrl: 'lazordemo://connected',
  paymaster: true, // Enable gasless transactions
};

// Solana RPC Configuration
// This is the default, but can be overridden by custom RPC URL in settings
export const SOLANA_RPC_URL = clusterApiUrl('devnet');
export const SOLANA_CLUSTER = 'devnet';

/**
 * Get the current RPC URL (checks AsyncStorage for custom URL)
 * This should be used instead of SOLANA_RPC_URL for dynamic RPC switching
 */
export const getSolanaRpcUrl = async (): Promise<string> => {
  return await getRpcUrl();
};

// App Configuration
export const APP_CONFIG = {
  get scheme() {
    return getAppScheme(); // Call function every time to get fresh value
  },
  airdropThreshold: 0.01, // Show airdrop button when SOL < 0.01
  tokenRefreshInterval: 10000, // 10 seconds
  metadataCacheTTL: 86400000, // 24 hours
  maxRecentRecipients: 10,
};

// Solana Token Registry
export const TOKEN_REGISTRY_URL = 'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json';
