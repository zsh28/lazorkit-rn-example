import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

interface BadgeProps {
  children: string;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'devnet';
  size?: 'small' | 'medium';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className,
}) => {
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-light text-success-dark',
    error: 'bg-error-light text-error-dark',
    warning: 'bg-warning-light text-warning-dark',
    devnet: 'bg-devnet text-white',
  };

  // Size classes
  const sizeClasses = {
    small: 'py-0.5 px-1 text-xs',
    medium: 'py-1 px-2 text-sm',
  };

  const badgeClasses = `rounded-full self-start ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`;
  const textClasses = `font-semibold uppercase tracking-wide ${variant === 'devnet' ? 'text-white' : ''}`;

  return (
    <View className={badgeClasses}>
      <Text className={textClasses}>
        {children}
      </Text>
    </View>
  );
};
