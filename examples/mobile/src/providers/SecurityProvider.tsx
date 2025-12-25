import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Session timeout options (in milliseconds)
export const SESSION_TIMEOUT_OPTIONS = {
  IMMEDIATELY: 0,           // Lock immediately when app goes to background
  ONE_MINUTE: 60 * 1000,    // 1 minute
  FIVE_MINUTES: 5 * 60 * 1000,   // 5 minutes
  FIFTEEN_MINUTES: 15 * 60 * 1000, // 15 minutes
  THIRTY_MINUTES: 30 * 60 * 1000,  // 30 minutes
  NEVER: -1,                // Never lock automatically (only on app restart)
} as const;

export type SessionTimeoutValue = typeof SESSION_TIMEOUT_OPTIONS[keyof typeof SESSION_TIMEOUT_OPTIONS];

interface SecurityContextValue {
  isAppLocked: boolean;
  isAppLockEnabled: boolean;
  sessionTimeout: SessionTimeoutValue;
  unlockApp: () => void;
  lockApp: () => void;
  handleAppBackground: () => void;
  enableAppLock: () => Promise<void>;
  disableAppLock: () => Promise<void>;
  setSessionTimeout: (timeout: SessionTimeoutValue) => Promise<void>;
  resetSessionTimer: () => void;
}

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

const APP_LOCK_ENABLED_KEY = 'app_lock_enabled';
const SESSION_TIMEOUT_KEY = 'session_timeout';
const LAST_ACTIVE_TIME_KEY = 'last_active_time';

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeoutState] = useState<SessionTimeoutValue>(SESSION_TIMEOUT_OPTIONS.IMMEDIATELY);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveTimeRef = useRef<number>(Date.now());

  // Clear any existing session timer
  const clearSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, []);

  // Start session timer based on configured timeout
  const startSessionTimer = useCallback(() => {
    clearSessionTimer();

    // Don't start timer if:
    // - App lock is not enabled
    // - Session timeout is NEVER (-1)
    // - Session timeout is IMMEDIATELY (0) - we lock immediately instead
    if (!isAppLockEnabled || sessionTimeout === SESSION_TIMEOUT_OPTIONS.NEVER || sessionTimeout === SESSION_TIMEOUT_OPTIONS.IMMEDIATELY) {
      return;
    }

    console.log(`⏱️ Starting session timer: ${sessionTimeout}ms`);
    
    sessionTimerRef.current = setTimeout(() => {
      console.log('⏱️ Session timeout reached - locking app');
      setIsAppLocked(true);
    }, sessionTimeout);
  }, [isAppLockEnabled, sessionTimeout, clearSessionTimer]);

  // Reset session timer (called on user activity)
  const resetSessionTimer = useCallback(() => {
    lastActiveTimeRef.current = Date.now();
    
    // Only reset timer if app is unlocked and lock is enabled
    if (!isAppLocked && isAppLockEnabled) {
      startSessionTimer();
    }
  }, [isAppLocked, isAppLockEnabled, startSessionTimer]);

  // Check if app lock is enabled and session timeout on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const [enabledValue, timeoutValue, lastActiveValue] = await Promise.all([
          AsyncStorage.getItem(APP_LOCK_ENABLED_KEY),
          AsyncStorage.getItem(SESSION_TIMEOUT_KEY),
          AsyncStorage.getItem(LAST_ACTIVE_TIME_KEY),
        ]);
        
        const isEnabled = enabledValue === 'true';
        const timeout = timeoutValue ? parseInt(timeoutValue, 10) : SESSION_TIMEOUT_OPTIONS.IMMEDIATELY;
        const lastActive = lastActiveValue ? parseInt(lastActiveValue, 10) : Date.now();
        
        setIsAppLockEnabled(isEnabled);
        setSessionTimeoutState(timeout);
        
        // Check if we should lock based on time elapsed since last active
        if (isEnabled) {
          const timeElapsed = Date.now() - lastActive;
          
          // Lock immediately if:
          // 1. Timeout is IMMEDIATELY (0)
          // 2. Timeout is not NEVER and time elapsed exceeds timeout
          if (timeout === SESSION_TIMEOUT_OPTIONS.IMMEDIATELY || 
              (timeout !== SESSION_TIMEOUT_OPTIONS.NEVER && timeElapsed > timeout)) {
            console.log('🔒 Locking app on launch (session expired)');
            setIsAppLocked(true);
          } else if (timeout !== SESSION_TIMEOUT_OPTIONS.NEVER) {
            // Start timer for remaining time
            const remainingTime = timeout - timeElapsed;
            if (remainingTime > 0) {
              console.log(`⏱️ Starting session timer with ${remainingTime}ms remaining`);
              sessionTimerRef.current = setTimeout(() => {
                console.log('⏱️ Session timeout reached - locking app');
                setIsAppLocked(true);
              }, remainingTime);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing security:', error);
      }
    };
    
    initialize();
    
    // Cleanup timer on unmount
    return () => {
      clearSessionTimer();
    };
  }, [clearSessionTimer]);

  // Save last active time when app state changes
  const saveLastActiveTime = useCallback(async () => {
    try {
      await AsyncStorage.setItem(LAST_ACTIVE_TIME_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving last active time:', error);
    }
  }, []);

  const unlockApp = useCallback(() => {
    console.log('🔓 Unlocking app');
    setIsAppLocked(false);
    lastActiveTimeRef.current = Date.now();
    saveLastActiveTime();
    
    // Start session timer after unlock
    if (isAppLockEnabled && sessionTimeout !== SESSION_TIMEOUT_OPTIONS.NEVER) {
      startSessionTimer();
    }
  }, [isAppLockEnabled, sessionTimeout, startSessionTimer, saveLastActiveTime]);

  const lockApp = useCallback(() => {
    if (isAppLockEnabled) {
      console.log('🔒 Locking app');
      clearSessionTimer();
      setIsAppLocked(true);
      saveLastActiveTime();
    }
  }, [isAppLockEnabled, clearSessionTimer, saveLastActiveTime]);

  // Handle app going to background - only lock immediately if timeout is IMMEDIATELY
  const handleAppBackground = useCallback(() => {
    if (!isAppLockEnabled) {
      return;
    }

    // Save the current time as last active
    saveLastActiveTime();

    // Only lock immediately if timeout is set to IMMEDIATELY
    if (sessionTimeout === SESSION_TIMEOUT_OPTIONS.IMMEDIATELY) {
      console.log('🔒 Locking app immediately (timeout is IMMEDIATELY)');
      clearSessionTimer();
      setIsAppLocked(true);
    } else {
      console.log('⏱️ App went to background - timer will continue');
      // Timer continues running - will lock when it expires
    }
  }, [isAppLockEnabled, sessionTimeout, clearSessionTimer, saveLastActiveTime]);

  const enableAppLock = useCallback(async () => {
    try {
      await AsyncStorage.setItem(APP_LOCK_ENABLED_KEY, 'true');
      setIsAppLockEnabled(true);
      lastActiveTimeRef.current = Date.now();
      await saveLastActiveTime();
    } catch (error) {
      console.error('Error enabling app lock:', error);
      throw error;
    }
  }, [saveLastActiveTime]);

  const disableAppLock = useCallback(async () => {
    try {
      await AsyncStorage.setItem(APP_LOCK_ENABLED_KEY, 'false');
      clearSessionTimer();
      setIsAppLockEnabled(false);
      setIsAppLocked(false);
    } catch (error) {
      console.error('Error disabling app lock:', error);
      throw error;
    }
  }, [clearSessionTimer]);

  const setSessionTimeout = useCallback(async (timeout: SessionTimeoutValue) => {
    try {
      await AsyncStorage.setItem(SESSION_TIMEOUT_KEY, timeout.toString());
      setSessionTimeoutState(timeout);
      
      // Restart timer with new timeout if app is unlocked
      if (!isAppLocked && isAppLockEnabled) {
        startSessionTimer();
      }
    } catch (error) {
      console.error('Error setting session timeout:', error);
      throw error;
    }
  }, [isAppLocked, isAppLockEnabled, startSessionTimer]);

  const value: SecurityContextValue = {
    isAppLocked,
    isAppLockEnabled,
    sessionTimeout,
    unlockApp,
    lockApp,
    handleAppBackground,
    enableAppLock,
    disableAppLock,
    setSessionTimeout,
    resetSessionTimer,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
