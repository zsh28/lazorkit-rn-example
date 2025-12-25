// Polyfills - MUST be imported first
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import "../global.css";

import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LazorProvider } from '../providers/LazorProvider';
import { SecurityProvider } from '../providers/SecurityProvider';
import { ToastProvider } from '../providers/ToastProvider';
import { ToastContainer } from '../components/ui/Toast';
import { LockScreen } from '../components/ui/LockScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useSecurity } from '../providers/SecurityProvider';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AppState, AppStateStatus } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5000,
      gcTime: 300000, // 5 minutes
    },
  },
});

// Inner component that can access the SecurityProvider context
function LayoutContent() {
  const { isAppLocked, handleAppBackground } = useSecurity();

  // Log deep link events for debugging
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      
      const parsed = Linking.parse(event.url);
      console.log('🔗 Parsed URL:', parsed);
      
      // Check if this is a transaction result (don't let it navigate)
      if (parsed.queryParams?.type) {
        console.log('🔗 Transaction result type:', parsed.queryParams.type);
        if (parsed.queryParams.type === 'success') {
          console.log('✅ Transaction was APPROVED');
          if (parsed.queryParams.signature) {
            console.log('✅ Signature:', parsed.queryParams.signature);
          }
        } else if (parsed.queryParams.type === 'error') {
          console.log('❌ Transaction was REJECTED/CANCELLED');
          console.log('❌ Error:', parsed.queryParams.error);
        }
        // Transaction results are handled by LazorKit - don't navigate
        console.log('🔗 Transaction result handled by LazorKit - preventing router navigation');
        return;
      }
    };

    // Handle initial URL (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL (cold start):', url);
        handleDeepLink({ url });
      }
    });

    // Handle URL when app is in background (warm start)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // Track app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('📱 App state changed to:', nextAppState);
      
      if (nextAppState === 'background') {
        console.log('📱 App went to background - Lazor Kit portal likely opened in system browser');
        handleAppBackground();
      } else if (nextAppState === 'active') {
        console.log('📱 App came to foreground - Returning from system browser');
        
        // Force dismiss any open WebBrowser
        try {
          WebBrowser.dismissBrowser();
          console.log('✅ WebBrowser dismissed successfully');
        } catch (err) {
          console.log('ℹ️ WebBrowser dismiss error (might already be closed):', err);
        }
        
        // Note: We do NOT call Linking.getInitialURL() here because:
        // 1. Deep links are already handled by the Linking.addEventListener('url') listener
        // 2. Calling getInitialURL() when returning from background can trigger unwanted navigations
        // 3. getInitialURL() should only be used on cold start (which we do above)
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppBackground]);

  // If app is locked, show lock screen overlay
  if (isAppLocked) {
    return <LockScreen />;
  }

  return (
    <ToastProvider>
      <Slot />
      
      {/* Toast Container - Global toasts */}
      <ToastContainer />
    </ToastProvider>
  );
}

export default function Layout() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error reporting service in production
        console.error('App Error:', error);
        console.error('Error Info:', errorInfo);
        
        // TODO: Send to error tracking service (e.g., Sentry, Bugsnag)
        // Sentry.captureException(error);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <LazorProvider>
          <SecurityProvider>
            <LayoutContent />
          </SecurityProvider>
        </LazorProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
