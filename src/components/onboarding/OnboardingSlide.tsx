import * as React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  index: number;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  iconName,
  title,
  description,
  index,
}) => {
  return (
    <MotiView
      from={{ opacity: 0, translateX: 50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: 'timing',
        duration: 600,
        delay: index * 100,
      }}
      style={{ width }}
      className="items-center justify-center px-8 py-12"
    >
      <View className="items-center mb-8">
        <View className="bg-primary-50 rounded-full p-8 mb-6">
          <Ionicons name={iconName} size={64} color="#2563eb" />
        </View>
      </View>
      
      <Text className="text-3xl font-bold text-gray-900 mb-4 text-center">
        {title}
      </Text>
      
      <Text className="text-base text-gray-600 text-center leading-relaxed max-w-sm">
        {description}
      </Text>
    </MotiView>
  );
};
