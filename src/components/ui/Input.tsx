import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { MotiView } from 'moti';

interface InputProps extends Omit<React.ComponentProps<typeof TextInput>, 'style' | 'className'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const getBorderColor = () => {
    if (error) return '#ef4444'; // error color
    if (isFocused) return '#2563eb'; // primary-600
    return '#e5e7eb'; // gray-200
  };

  return (
    <View className={`mb-4 ${className || ''}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-900 mb-1">
          {label}
        </Text>
      )}
      
      <MotiView
        animate={{
          borderColor: getBorderColor(),
          borderWidth: isFocused ? 2 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 150,
        }}
        className="flex-row items-center bg-white rounded-lg"
      >
        {leftIcon && (
          <View className="pl-4 justify-center items-center">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          {...textInputProps}
          className={`flex-1 py-2 px-4 text-base text-gray-900 min-h-[44px] ${
            leftIcon ? 'pl-0' : ''
          } ${rightIcon ? 'pr-0' : ''}`}
          placeholderTextColor="#9ca3af"
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
        
        {rightIcon && (
          <View className="pr-4 justify-center items-center">
            {rightIcon}
          </View>
        )}
      </MotiView>

      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <Text className="text-sm text-error mt-1">{error}</Text>
        </MotiView>
      )}

      {!error && helperText && (
        <Text className="text-sm text-gray-600 mt-1">{helperText}</Text>
      )}
    </View>
  );
};
