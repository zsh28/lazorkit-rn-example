import React from 'react';
import { Pressable, Text, ActivityIndicator, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  // Get button background color based on variant and press state
  const getBackgroundColor = (): string => {
    if (disabled) {
      switch (variant) {
        case 'primary':
          return '#93c5fd'; // primary-300
        case 'secondary':
          return '#e5e7eb'; // gray-200
        case 'outline':
          return '#ffffff';
        case 'danger':
          return '#fca5a5'; // red-300
        default:
          return '#93c5fd';
      }
    }

    switch (variant) {
      case 'primary':
        return isPressed ? '#1d4ed8' : '#2563eb'; // primary-700 : primary-600
      case 'secondary':
        return isPressed ? '#d1d5db' : '#e5e7eb'; // gray-300 : gray-200
      case 'outline':
        return isPressed ? '#eff6ff' : '#ffffff'; // primary-50 : white
      case 'danger':
        return isPressed ? '#dc2626' : '#ef4444'; // red-600 : red-500
      default:
        return '#2563eb';
    }
  };

  // Get text color based on variant
  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#ffffff';
      case 'secondary':
        return '#111827'; // gray-900
      case 'outline':
        return isPressed ? '#1d4ed8' : '#2563eb'; // primary-700 : primary-600
      default:
        return '#ffffff';
    }
  };

  // Get border style for outline variant
  const getBorderStyle = (): ViewStyle => {
    if (variant === 'outline') {
      return {
        borderWidth: 2,
        borderColor: isPressed ? '#1d4ed8' : '#2563eb', // primary-700 : primary-600
      };
    }
    return {};
  };

  // Size-based styles
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 6,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          minHeight: 52,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          minHeight: 44,
        };
    }
  };

  // Text size based on button size
  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 14 };
      case 'large':
        return { fontSize: 18 };
      case 'medium':
      default:
        return { fontSize: 16 };
    }
  };

  // Activity indicator color
  const getIndicatorColor = () => {
    switch (variant) {
      case 'secondary':
        return '#111827';
      case 'outline':
        return '#2563eb';
      default:
        return '#ffffff';
    }
  };

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...getSizeStyles(),
    ...getBorderStyle(),
    backgroundColor: getBackgroundColor(),
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const textStyle: TextStyle = {
    ...styles.text,
    ...getTextSize(),
    color: getTextColor(),
  };

  return (
    <MotiView
      animate={{
        scale: isPressed ? 0.97 : 1,
      }}
      transition={{
        type: 'timing',
        duration: 100,
      }}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
      >
        <View style={containerStyle}>
          {loading ? (
            <ActivityIndicator 
              color={getIndicatorColor()} 
              size="small" 
            />
          ) : (
            <Text style={textStyle}>
              {children}
            </Text>
          )}
        </View>
      </Pressable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
