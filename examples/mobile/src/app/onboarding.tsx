import { StatusBar } from "expo-status-bar";
import { View, ScrollView, Dimensions, Pressable, Text, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingSlide } from '../components/onboarding/OnboardingSlide';
import { PaginationDots } from '../components/onboarding/PaginationDots';
import { Button } from '../components/ui/Button';
import { useSecurity } from '../providers/SecurityProvider';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigationWithFeedback } from '../hooks/useNavigationWithFeedback';
import { logger } from '../services/logger';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');
const ONBOARDING_COMPLETED_KEY = '@lazor_onboarding_completed';

const SLIDES = [
  {
    iconName: 'wallet' as const,
    title: 'Your Solana Wallet',
    description: 'Send, receive, and manage SOL and SPL tokens with ease. Everything you need in one place.',
  },
  {
    iconName: 'shield-checkmark' as const,
    title: 'Secure by Design',
    description: 'Protected by WebAuthn passkeys. No seed phrases to write down or lose.',
  },
  {
    iconName: 'flash' as const,
    title: 'Gasless Transactions',
    description: 'Send tokens without worrying about gas fees. We cover the costs on devnet.',
  },
  {
    iconName: 'sync' as const,
    title: 'Multi-Device Sync',
    description: 'Access your wallet seamlessly across all your devices. Start on mobile, continue on desktop.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [hasAuthHardware, setHasAuthHardware] = useState(false);
  const { enableAppLock, disableAppLock } = useSecurity();
  const { light } = useHaptics();
  const { replace } = useNavigationWithFeedback();

  // Check if authentication hardware is available (biometric or PIN)
  useEffect(() => {
    const checkAuth = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setHasAuthHardware(hasHardware);
    };
    checkAuth();
  }, []);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const handleNext = () => {
    light();
    
    if (activeIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
    } else {
      // Show app lock setup if hardware is available
      if (hasAuthHardware) {
        setShowBiometricSetup(true);
      } else {
        handleGetStarted();
      }
    }
  };

  const handleSkip = () => {
    light();
    if (hasAuthHardware) {
      setShowBiometricSetup(true);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    try {
      // Save app lock preference
      if (biometricEnabled) {
        // Authenticate before enabling (will use biometric if available, otherwise PIN)
        const hasBiometric = await LocalAuthentication.isEnrolledAsync();
        
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: hasBiometric ? 'Authenticate to enable lock' : 'Enter your PIN to enable lock',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false, // Allow PIN/password fallback
          fallbackLabel: 'Use PIN',
        });

        if (result.success) {
          await enableAppLock();
        } else {
          // User cancelled authentication, disable it
          setBiometricEnabled(false);
          await disableAppLock();
        }
      } else {
        await disableAppLock();
      }
      
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      logger.navigation('Dashboard', { from: 'Onboarding', reason: 'onboarding_completed' });
      router.replace('/dashboard');
    } catch (error) {
      logger.error('Error saving onboarding completion', error, { screen: 'Onboarding' });
      // Navigate anyway
      router.replace('/dashboard');
    }
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;

  // If showing biometric setup, render that screen instead
  if (showBiometricSetup) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        
        <View className="flex-1 justify-center items-center px-6">
          {/* Icon */}
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-6">
            <Text className="text-5xl">🔐</Text>
          </View>
          
          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            Enable App Lock?
          </Text>
          
          {/* Description */}
          <Text className="text-base text-gray-600 text-center mb-8 leading-6">
            Secure your wallet with biometric authentication or PIN. You'll need to authenticate each time you open the app.
          </Text>
          
          {/* Toggle */}
          <View className="flex-row items-center justify-between w-full mb-8 p-4 bg-gray-50 rounded-lg">
            <Text className="text-base font-medium text-gray-900">
              {biometricEnabled ? 'Enabled' : 'Disabled'}
            </Text>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={biometricEnabled ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>
        
        {/* Bottom Section */}
        <View className="px-6 pb-8">
          <Button
            onPress={handleGetStarted}
            variant="primary"
            size="large"
            fullWidth
          >
            Continue
          </Button>
          
          <Pressable onPress={() => {
            setBiometricEnabled(false);
            handleGetStarted();
          }} className="mt-4">
            <Text className="text-sm text-gray-500 text-center">
              Skip for now
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Skip Button */}
      {!isLastSlide && (
        <View className="absolute top-12 right-6 z-10">
          <Pressable onPress={handleSkip}>
            <Text className="text-sm font-semibold text-primary-600">
              Skip
            </Text>
          </Pressable>
        </View>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide, index) => (
          <OnboardingSlide
            key={index}
            iconName={slide.iconName}
            title={slide.title}
            description={slide.description}
            index={index}
          />
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        {/* Pagination Dots */}
        <PaginationDots count={SLIDES.length} activeIndex={activeIndex} className="mb-6" />
        
        {/* Next/Get Started Button */}
        <Button
          onPress={handleNext}
          variant="primary"
          size="large"
          fullWidth
        >
          {isLastSlide ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
}
