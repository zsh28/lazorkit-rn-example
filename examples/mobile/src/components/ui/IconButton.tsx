import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface IconButtonProps {
  onPress: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  iconName,
  size = 'medium',
  variant = 'ghost',
  disabled = false,
  className,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-gray-200',
    ghost: 'bg-transparent',
  };

  // Size classes
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  // Icon size
  const iconSizes = {
    small: 20,
    medium: 28,
    large: 36,
  };

  // Icon color based on variant
  const iconColors = {
    primary: '#ffffff',
    secondary: '#111827',
    ghost: '#374151',
  };

  const containerClasses = `rounded-full items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50' : ''} ${className || ''}`;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <MotiView
        animate={{
          scale: isPressed ? 0.9 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 100,
        }}
        className={containerClasses}
      >
        <Ionicons 
          name={iconName} 
          size={iconSizes[size]} 
          color={iconColors[variant]} 
        />
      </MotiView>
    </Pressable>
  );
};
