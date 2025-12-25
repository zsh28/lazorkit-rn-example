import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface QuickAction {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onSend?: () => void;
  onReceive?: () => void;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onSend,
  onReceive,
  className,
}) => {
  // Use custom actions if provided, otherwise use default Send/Receive
  const defaultActions: QuickAction[] = [
    {
      iconName: 'paper-plane',
      label: 'Send',
      onPress: onSend || (() => {}),
      variant: 'primary',
    },
    {
      iconName: 'download',
      label: 'Receive',
      onPress: onReceive || (() => {}),
      variant: 'secondary',
    },
  ];

  const displayActions = actions || defaultActions;

  return (
    <View style={styles.container}>
      {displayActions.map((action, index) => (
        <QuickActionButton key={index} {...action} />
      ))}
    </View>
  );
};

const QuickActionButton: React.FC<QuickAction> = ({
  iconName,
  label,
  onPress,
  variant = 'primary',
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  // Get background color based on variant and press state
  const getBackgroundColor = (): string => {
    if (variant === 'primary') {
      return isPressed ? '#1d4ed8' : '#2563eb'; // primary-700 : primary-600
    } else {
      return isPressed ? '#d1d5db' : '#e5e7eb'; // gray-300 : gray-200
    }
  };

  // Get icon color based on variant
  const getIconColor = (): string => {
    return variant === 'primary' ? '#ffffff' : '#111827';
  };

  // Get label color based on variant
  const getLabelColor = (): string => {
    return variant === 'primary' ? '#111827' : '#4b5563'; // gray-900 : gray-600
  };

  const iconContainerStyle: ViewStyle = {
    ...styles.iconContainer,
    backgroundColor: getBackgroundColor(),
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.button}
    >
      <MotiView
        animate={{
          scale: isPressed ? 0.95 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 100,
        }}
      >
        <View style={styles.content}>
          {/* Icon Container */}
          <View style={iconContainerStyle}>
            <Ionicons name={iconName} size={24} color={getIconColor()} />
          </View>

          {/* Label */}
          <Text style={[styles.label, { color: getLabelColor() }]}>
            {label}
          </Text>
        </View>
      </MotiView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
