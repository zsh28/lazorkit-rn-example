import { StatusBar } from "expo-status-bar";
import { View, Text, Alert, ScrollView, AppState } from "react-native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useLazor } from '../providers/LazorProvider';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigationWithFeedback } from '../hooks/useNavigationWithFeedback';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { APP_CONFIG } from '../constants/config';
import { MotiView } from 'moti';
import { logger } from '../services/logger';

const ONBOARDING_COMPLETED_KEY = '@lazor_onboarding_completed';

export default function WelcomeScreen() {
  const router = useRouter();
  const { connect, isConnecting } = useLazor();
  const { medium, light } = useHaptics();
  const { replace } = useNavigationWithFeedback();
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [connectionInstructions, setConnectionInstructions] = useState('');

  // Debug: Log connection state
  logger.info('WelcomeScreen render', { isConnecting, screen: 'Welcome' });

  // Ensure browser is dismissed when component mounts (handles app resume)
  useEffect(() => {
    try {
      WebBrowser.dismissBrowser();
      logger.info('Browser dismissed on mount', { screen: 'Welcome' });
    } catch (err) {
      // Silently ignore - browser might not be open
    }
  }, []);

  // Monitor connection state and show cancel button after delay
  useEffect(() => {
    if (!isConnecting) {
      setShowCancelButton(false);
      setConnectionInstructions('');
      return;
    }

    // Update instructions immediately when connecting starts
    setConnectionInstructions('Opening browser...');
    
    // After 2 seconds, update instructions
    const instructionTimeout = setTimeout(() => {
      setConnectionInstructions('Complete authentication in your browser');
    }, 2000);

    // Show cancel button after 5 seconds of connecting
    const cancelTimeout = setTimeout(() => {
      logger.info('Connection taking longer than expected', { screen: 'Welcome' });
      setShowCancelButton(true);
      setConnectionInstructions('Taking longer than expected...');
    }, 5000);

    return () => {
      clearTimeout(instructionTimeout);
      clearTimeout(cancelTimeout);
    };
  }, [isConnecting]);

  // Monitor app state to detect if user returns without completing auth
  useEffect(() => {
    if (!isConnecting) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      logger.info('App state changed', { from: appStateRef.current, to: nextAppState, screen: 'Welcome' });
      
      // If app goes to background, assume browser opened
      if (appStateRef.current === 'active' && nextAppState.match(/background/)) {
        logger.info('App went to background - browser likely opened', { screen: 'Welcome' });
        setConnectionInstructions('Complete authentication in your browser');
      }
      
      // If app comes back to foreground while still connecting, give SDK time to process
      if (appStateRef.current.match(/background/) && nextAppState === 'active') {
        logger.info('App returned to foreground while connecting', { screen: 'Welcome' });
        setConnectionInstructions('Processing authentication...');
        
        // Give the SDK 10 seconds to fire callbacks after returning
        connectionTimeoutRef.current = setTimeout(() => {
          if (isConnecting) {
            logger.warn('Connection timeout - no callback received', { screen: 'Welcome' });
            setConnectionInstructions('Authentication timed out');
          }
        }, 10000);
      }
      
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [isConnecting]);

  // Handle cancel connection
  const handleCancelConnection = useCallback(async () => {
    logger.action('Cancel connection button pressed', { screen: 'Welcome' });
    light();
    
    try {
      // Dismiss any open browser
      await WebBrowser.dismissBrowser();
      logger.info('Browser dismissed by user', { screen: 'Welcome' });
    } catch (err) {
      logger.error('Error dismissing browser', err, { screen: 'Welcome' });
    }
    
    // Show helpful alert
    Alert.alert(
      'Connection Cancelled',
      'The authentication was cancelled. If you\'re having trouble, please ensure:\n\n• Your device supports passkeys (Face ID, Touch ID, or fingerprint)\n• Your browser is up to date\n• You have a stable internet connection\n\nThen try signing in again.',
      [{ text: 'OK' }]
    );
    
    // Note: We can't manually reset isConnecting as it's managed by LazorKit SDK
    // The SDK should eventually timeout and reset the state
    // If not, user may need to force close and reopen the app
  }, [light]);

  const handleConnect = useCallback(async () => {
    logger.action('Sign In button pressed', { screen: 'Welcome' });
    const redirectUrl = APP_CONFIG.scheme + '://';
    logger.info('Redirect URL configured', { redirectUrl, screen: 'Welcome' });
    
    try {
      medium();
      
      logger.info('Calling connect with redirect URL', { redirectUrl, screen: 'Welcome' });
      
      await connect({
        redirectUrl: redirectUrl,
        onSuccess: async (walletInfo) => {
          logger.info('Connection successful', { smartWallet: walletInfo.smartWallet, screen: 'Welcome' });
          
          // Check if user has already seen onboarding
          try {
            const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
            
            if (hasCompletedOnboarding) {
              // User has already seen onboarding, go straight to dashboard
              logger.navigation('Dashboard', { from: 'Welcome', reason: 'onboarding_completed' });
              router.replace('/dashboard');
            } else {
              // First time login, show onboarding
              logger.navigation('Onboarding', { from: 'Welcome', reason: 'first_time' });
              router.replace('/onboarding');
            }
          } catch (storageError) {
            logger.error('Error checking onboarding flag', storageError, { screen: 'Welcome' });
            // Default to onboarding on error
            router.replace('/onboarding');
          }
        },
        onFail: (error) => {
          logger.error('Connection failed', error, { 
            screen: 'Welcome',
            errorDetails: {
              message: error.message,
              name: error.name
            }
          });
          
          // Show user-friendly error message
          let errorMessage = 'Failed to connect to wallet. Please try again.';
          
          if (error.message.includes('passkeyPublicKey')) {
            errorMessage = 'Passkey authentication failed. Please ensure you have passkeys enabled on your device and try again.';
          } else if (error.message.includes('cancel')) {
            errorMessage = 'Authentication was cancelled.';
          }
          
          Alert.alert('Connection Failed', errorMessage);
        }
      });
      
      logger.info('Connect call completed, waiting for callbacks', { screen: 'Welcome' });
    } catch (error) {
      logger.error('Connect error', error, { screen: 'Welcome' });
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  }, [connect, router, medium]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="items-center px-6 pt-16 pb-8">
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
            className="items-center mb-8"
          >
            {/* Large Icon */}
            <View className="bg-primary-50 rounded-full p-8 mb-6">
              <Ionicons name="flash" size={64} color="#2563eb" />
            </View>
            
            {/* Title */}
            <Text className="text-4xl font-bold text-gray-900 mb-3 text-center">
              Welcome to Lazor
            </Text>
            
            {/* Subtitle */}
            <Text className="text-lg text-gray-600 text-center max-w-sm">
              Secure Solana wallet with passkey authentication
            </Text>
          </MotiView>

          {/* Features List */}
          <View className="w-full mb-8 gap-3">
            <FeatureItem
              iconName="shield-checkmark"
              title="Secure Authentication"
              description="No passwords or seed phrases required"
            />
            <FeatureItem
              iconName="flash"
              title="Gasless Transactions"
              description="We cover the fees on devnet"
            />
            <FeatureItem
              iconName="globe"
              title="Multi-Device Support"
              description="Access your wallet from anywhere"
            />
            <FeatureItem
              iconName="lock-closed"
              title="Self-Custodial"
              description="You always control your keys"
            />
          </View>

          {/* CTA Button */}
          <View className="w-full">
            <Button
              onPress={handleConnect}
              loading={isConnecting}
              variant="secondary"
              size="large"
              fullWidth
              disabled={isConnecting && !showCancelButton}
            >
              {isConnecting ? 'Signing In...' : 'Sign In'}
            </Button>
            
            {/* Connection instructions */}
            {isConnecting && connectionInstructions && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
                className="mt-3"
              >
                <Card variant="filled" padding="small">
                  <Text className="text-sm text-primary-700 text-center font-medium">
                    {connectionInstructions}
                  </Text>
                </Card>
              </MotiView>
            )}
            
            {/* Cancel button */}
            {isConnecting && showCancelButton && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 300 }}
                className="mt-3"
              >
                <Button
                  onPress={handleCancelConnection}
                  variant="outline"
                  size="medium"
                  fullWidth
                >
                  Cancel & Try Again
                </Button>
              </MotiView>
            )}
            
            <Text className="text-xs text-gray-500 text-center mt-4 px-4">
              Secure authentication with Face ID, Touch ID, or passkey
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Feature Item Component
interface FeatureItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ iconName, title, description }) => {
  return (
    <Card variant="outlined" padding="medium" animate={false}>
      <View className="flex-row items-start">
        <View className="mr-4">
          <Ionicons name={iconName} size={28} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {title}
          </Text>
          <Text className="text-sm text-gray-600">
            {description}
          </Text>
        </View>
      </View>
    </Card>
  );
};
