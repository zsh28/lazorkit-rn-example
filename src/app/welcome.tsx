import { StatusBar } from "expo-status-bar";
import { View, Text, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useLazor } from '../providers/LazorProvider';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { APP_CONFIG } from '../constants/config';
import { MotiView } from 'moti';

const ONBOARDING_COMPLETED_KEY = '@lazor_onboarding_completed';

export default function WelcomeScreen() {
  const router = useRouter();
  const { connect, isConnecting } = useLazor();

  // Debug: Log connection state
  console.log('🔍 WelcomeScreen render - isConnecting:', isConnecting);

  // Ensure browser is dismissed when component mounts (handles app resume)
  useEffect(() => {
    try {
      WebBrowser.dismissBrowser();
      console.log('✅ Dismissed any open browser on WelcomeScreen mount');
    } catch (err) {
      // Silently ignore - browser might not be open
    }
  }, []);

  const handleConnect = useCallback(async () => {
    console.log('🔘 Sign In button pressed');
    const redirectUrl = APP_CONFIG.scheme + '://';
    console.log('📱 Redirect URL:', redirectUrl);
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('🚀 Calling connect() with redirect URL:', redirectUrl);
      
      await connect({
        redirectUrl: redirectUrl,
        onSuccess: async (walletInfo) => {
          console.log('✅ onSuccess callback triggered!');
          console.log('✅ Connected successfully:', walletInfo.smartWallet);
          
          // Check if user has already seen onboarding
          try {
            const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
            
            if (hasCompletedOnboarding) {
              // User has already seen onboarding, go straight to dashboard
              console.log('➡️ Going to dashboard (onboarding completed)');
              router.replace('/dashboard');
            } else {
              // First time login, show onboarding
              console.log('➡️ Going to onboarding (first time)');
              router.replace('/onboarding');
            }
          } catch (storageError) {
            console.error('Error checking onboarding flag:', storageError);
            // Default to onboarding on error
            router.replace('/onboarding');
          }
        },
        onFail: (error) => {
          console.error('❌ onFail callback triggered!');
          console.error('❌ Connection failed:', error);
          console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
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
      
      console.log('⏳ connect() call completed, waiting for callbacks...');
    } catch (error) {
      console.error('💥 Connect error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  }, [connect, router]);

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
            >
              {isConnecting ? 'Signing In...' : 'Sign In'}
            </Button>
            
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
