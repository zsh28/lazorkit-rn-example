import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface BrowserState {
  visible: boolean;
  url: string;
}

let globalBrowserState: BrowserState = { visible: false, url: '' };
let globalSetBrowserState: ((state: BrowserState) => void) | null = null;

/**
 * Hook to manage in-app browser globally
 * Use this in the root layout to display the browser
 */
export function useInAppBrowserController() {
  const [browserState, setBrowserState] = useState<BrowserState>(globalBrowserState);

  useEffect(() => {
    // Register global setter
    globalSetBrowserState = setBrowserState;

    return () => {
      globalSetBrowserState = null;
    };
  }, []);

  // Monitor app state to detect when portal might open
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        console.log('🌐 App went to background - external browser likely opened');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const closeBrowser = useCallback(() => {
    console.log('🌐 Closing in-app browser');
    const newState = { visible: false, url: '' };
    setBrowserState(newState);
    globalBrowserState = newState;
  }, []);

  const handleNavigation = useCallback((url: string) => {
    console.log('🌐 Browser navigated to:', url);
    
    // Check if URL is a deep link back to app
    if (url.includes('lazordemo://') || url.includes('exp+lazor-kit-rn-demo://')) {
      console.log('🔗 Deep link detected in browser, closing');
      closeBrowser();
    }
  }, [closeBrowser]);

  return {
    browserState,
    closeBrowser,
    handleNavigation,
  };
}

/**
 * Global function to open in-app browser
 * Call this from anywhere in the app
 */
export function openInAppBrowser(url: string) {
  console.log('🌐 Opening in-app browser:', url);
  const newState = { visible: true, url };
  globalBrowserState = newState;
  if (globalSetBrowserState) {
    globalSetBrowserState(newState);
  }
}
