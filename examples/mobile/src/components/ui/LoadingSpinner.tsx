import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { MotiView } from 'moti';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#2563eb', // primary-600
  message,
  fullScreen = false,
}) => {
  return (
    <View className={`justify-center items-center p-6 ${fullScreen ? 'flex-1 bg-white' : ''}`}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 300,
        }}
        className="items-center"
      >
        <ActivityIndicator size={size} color={color} />
        {message && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 300,
              delay: 100,
            }}
          >
            <Text className="mt-4 text-base text-gray-600 text-center">
              {message}
            </Text>
          </MotiView>
        )}
      </MotiView>
    </View>
  );
};
