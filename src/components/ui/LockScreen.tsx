import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSecurity } from '../../providers/SecurityProvider';
import * as LocalAuthentication from 'expo-local-authentication';

export const LockScreen: React.FC = () => {
  const { unlockApp } = useSecurity();

  useEffect(() => {
    // Automatically prompt for authentication when lock screen appears
    authenticate();
  }, []);

  const authenticate = async () => {
    try {
      const hasBiometric = await LocalAuthentication.isEnrolledAsync();
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: hasBiometric ? 'Unlock to access your wallet' : 'Enter your PIN to unlock',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        unlockApp();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <View className="flex-1 bg-primary-600 justify-center items-center">
      {/* Lock Icon */}
      <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-8">
        <Text className="text-7xl">🔒</Text>
      </View>
      
      {/* Title */}
      <Text className="text-3xl font-bold text-white text-center mb-4">
        Wallet Locked
      </Text>
      
      {/* Description */}
      <Text className="text-base text-white/80 text-center mb-8 px-8">
        Authenticate to access your wallet
      </Text>
      
      {/* Unlock Button */}
      <Pressable
        onPress={authenticate}
        className="bg-white px-8 py-4 rounded-full active:opacity-80"
      >
        <Text className="text-primary-600 font-semibold text-lg">
          Unlock
        </Text>
      </Pressable>
    </View>
  );
};
