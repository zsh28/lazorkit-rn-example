import * as React from 'react';
import { View } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warm' | 'cool';
  className?: string;
}

const BACKGROUND_COLORS = {
  primary: 'bg-primary-600',
  success: 'bg-success',
  warm: 'bg-warning',
  cool: 'bg-primary-500',
};

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'primary',
  className,
}) => {
  const bgColor = BACKGROUND_COLORS[variant];

  return (
    <View className={`flex-1 ${bgColor} ${className || ''}`}>
      {children}
    </View>
  );
};
