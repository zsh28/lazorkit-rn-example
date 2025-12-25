import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSegments, useLocalSearchParams } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLazor } from '../providers/LazorProvider';

const ONBOARDING_COMPLETED_KEY = '@lazor_onboarding_completed';

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const searchParams = useLocalSearchParams();
  const { isConnected, isLoading: isWalletLoading } = useLazor();
  const hasNavigated = useRef(false);
  const navigationAttempted = useRef(false);

  useEffect(() => {
    const checkInitialRoute = async () => {
      // Check if this is a transaction result redirect (should be ignored)
      // Transaction results have 'type' and 'error'/'signature' params
      const isTransactionResult = searchParams.type === 'error' || searchParams.type === 'success';
      
      if (isTransactionResult) {
        console.log('🔍 Index: Transaction result detected - going back to previous screen');
        console.log('🔍 Index: This will be handled by LazorKit');
        // Go back to the previous screen (which should be the send screen)
        hasNavigated.current = true;
        navigationAttempted.current = true;
        router.back();
        return;
      }

      // Prevent multiple navigations
      if (navigationAttempted.current) {
        console.log('🔍 Index: Navigation already attempted, skipping...');
        return;
      }

      // Wait for wallet to finish loading
      if (isWalletLoading) {
        console.log('⏳ Index: Waiting for wallet to load...');
        return;
      }

      // Check if we're already on a valid route (not index)
      // This prevents navigation when returning from a transaction
      if (pathname && pathname !== '/' && segments.length > 0) {
        console.log('🔍 Index: Already on route:', pathname, 'segments:', segments);
        console.log('🔍 Index: Skipping navigation - user is on a valid screen');
        hasNavigated.current = true;
        navigationAttempted.current = true;
        return;
      }

      navigationAttempted.current = true;

      try {
        console.log('🔍 Index: Checking initial route...');
        console.log('🔍 isConnected:', isConnected);
        console.log('🔍 Current pathname:', pathname);

        // Check if user has completed onboarding
        const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        console.log('🔍 hasCompletedOnboarding:', hasCompletedOnboarding);

        // Small delay to ensure proper navigation
        await new Promise(resolve => setTimeout(resolve, 100));

        if (isConnected && hasCompletedOnboarding) {
          // Logged in user who has seen onboarding - go to dashboard
          console.log('➡️ Navigating to dashboard');
          hasNavigated.current = true;
          router.replace('/dashboard');
        } else if (isConnected && !hasCompletedOnboarding) {
          // Logged in but hasn't seen onboarding - show onboarding first
          console.log('➡️ Navigating to onboarding');
          hasNavigated.current = true;
          router.replace('/onboarding');
        } else {
          // Not logged in - show welcome/login screen
          console.log('➡️ Navigating to welcome');
          hasNavigated.current = true;
          router.replace('/welcome');
        }
      } catch (error) {
        console.error('❌ Error checking initial route:', error);
        hasNavigated.current = true;
        // Default to welcome screen on error
        router.replace('/welcome');
      }
    };

    checkInitialRoute();
  }, [router, isConnected, isWalletLoading, pathname, segments]);

  // Don't return null - keep rendering loading screen
  // Index will unmount naturally when router.replace happens
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3b82f6' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
