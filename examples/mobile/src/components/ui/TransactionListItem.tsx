import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export type TransactionType = 'sent' | 'received' | 'swap' | 'unknown';
export type TransactionStatus = 'success' | 'pending' | 'failed';

interface TransactionListItemProps {
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  symbol: string;
  timestamp: number;
  signature?: string;
  recipient?: string;
  sender?: string;
  onPress?: () => void;
  index?: number; // For staggered animation
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  type,
  status,
  amount,
  symbol,
  timestamp,
  onPress,
  index = 0,
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  // Get icon and colors based on type
  const getTypeInfo = () => {
    switch (type) {
      case 'sent':
        return { iconName: 'arrow-up' as const, color: '#dc2626', bg: 'bg-error-light' };
      case 'received':
        return { iconName: 'arrow-down' as const, color: '#16a34a', bg: 'bg-success-light' };
      case 'swap':
        return { iconName: 'swap-horizontal' as const, color: '#2563eb', bg: 'bg-primary-50' };
      default:
        return { iconName: 'ellipse' as const, color: '#4b5563', bg: 'bg-gray-100' };
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Text className="text-xs text-warning">Pending</Text>;
      case 'failed':
        return <Text className="text-xs text-error">Failed</Text>;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const mins = Math.floor(diffInHours * 60);
      return `${mins}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const typeInfo = getTypeInfo();
  const isPositive = type === 'received';

  return (
    <Pressable onPress={handlePress} disabled={!onPress}>
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ 
          type: 'timing', 
          duration: 300,
          delay: index * 50, // Stagger animation based on index
        }}
        className="bg-white rounded-xl p-4 shadow-sm"
      >
        <View className="flex-row items-center">
          {/* Icon */}
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${typeInfo.bg}`}>
            <Ionicons name={typeInfo.iconName} size={20} color={typeInfo.color} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-semibold text-gray-900 capitalize">
                {type}
              </Text>
              <Text className={`text-base font-semibold ${isPositive ? 'text-success' : 'text-gray-900'}`}>
                {isPositive ? '+' : '-'}{amount} {symbol}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">
                {formatDate(timestamp)}
              </Text>
              {getStatusBadge()}
            </View>
          </View>
        </View>
      </MotiView>
    </Pressable>
  );
};
