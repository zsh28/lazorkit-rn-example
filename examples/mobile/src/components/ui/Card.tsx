import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'elevated',
  padding = 'medium',
  animate = true,
}) => {
  const variantClasses = {
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border border-gray-200',
    filled: 'bg-gray-50',
  };

  const paddingClasses = {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6',
  };

  const cardClasses = `rounded-xl overflow-hidden ${variantClasses[variant]} ${paddingClasses[padding]} ${className || ''}`;

  const content = (
    <View className={cardClasses}>
      {children}
    </View>
  );

  if (animate) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 200 }}
      >
        {content}
      </MotiView>
    );
  }

  return content;
};
