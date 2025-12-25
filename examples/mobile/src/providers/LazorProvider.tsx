import * as React from 'react';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { LazorKitProvider, useWallet } from '@lazorkit/wallet-mobile-adapter';
import { SOLANA_RPC_URL } from '../constants/config';
import { isSessionExpired, updateLastActivity, clearLastActivity } from '../services/storage/session';
import { useRouter } from 'expo-router';

interface LazorProviderProps {
  children: React.ReactNode;
}

// Re-export the useWallet hook from @lazorkit/wallet-mobile-adapter as useLazor
export { useWallet as useLazor } from '@lazorkit/wallet-mobile-adapter';

// Inner component that has access to the wallet context
function SessionManager({ children }: { children: React.ReactNode }) {
  const { isConnected, disconnect } = useWallet();
  const router = useRouter();

  // Check session expiry on mount and app state changes
  useEffect(() => {
    const checkSessionExpiry = async () => {
      if (isConnected) {
        const expired = await isSessionExpired();
        
        if (expired) {
          console.log('🕐 Session expired (24 hours of inactivity) - logging out');
          
          // Disconnect wallet
          await disconnect({
            onSuccess: () => {
              console.log('✅ Logged out due to session expiry');
            },
            onFail: (error) => {
              console.error('❌ Failed to disconnect on session expiry:', error);
            }
          });
          
          // Clear session data
          await clearLastActivity();
          
          // Navigate to welcome screen
          router.replace('/welcome');
        } else {
          // Update last activity on app open
          await updateLastActivity();
        }
      }
    };

    // Check on mount
    checkSessionExpiry();

    // Check when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkSessionExpiry();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isConnected, disconnect, router]);

  // Update last activity when connected
  useEffect(() => {
    if (isConnected) {
      updateLastActivity();
    }
  }, [isConnected]);

  return <>{children}</>;
}

export const LazorProvider: React.FC<LazorProviderProps> = ({ children }) => {
  return (
    <LazorKitProvider
      rpcUrl={SOLANA_RPC_URL}
      portalUrl="https://portal.lazor.sh"
      configPaymaster={{
        paymasterUrl: "https://kora.devnet.lazorkit.com"
      }}
      isDebug={__DEV__}
    >
      <SessionManager>
        {children as any}
      </SessionManager>
    </LazorKitProvider>
  );
};
