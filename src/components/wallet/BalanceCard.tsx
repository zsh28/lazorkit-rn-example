import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useSOLBalance } from '../../hooks/useTokenBalances';
import { formatTokenAmountDisplay } from '../../services/formatters/amount';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface BalanceCardProps {
  onPress?: () => void;
  showDetails?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  onPress,
  showDetails = false,
}) => {
  const { data: solToken, isLoading, error } = useSOLBalance();
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    if (onPress) {
      setIsPressed(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="min-h-[120px]">
        <LoadingSpinner size="small" message="Loading balance..." />
      </Card>
    );
  }

  if (error || !solToken) {
    return (
      <Card variant="elevated">
        <View className="items-center py-6">
          <Text className="text-base text-error">Failed to load balance</Text>
        </View>
      </Card>
    );
  }

  const formattedBalance = formatTokenAmountDisplay(
    solToken.balance,
    solToken.decimals
  );

  const content = (
    <View className="items-center py-6">
      {/* Label */}
      <Text className="text-sm text-gray-600 mb-2 uppercase tracking-wide">
        Total Balance
      </Text>

      {/* Balance Amount */}
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 200,
        }}
      >
        <Text className="text-4xl font-bold text-gray-900 mb-1">
          {formattedBalance}
        </Text>
      </MotiView>

      {/* Currency */}
      <Text className="text-lg text-gray-600 font-medium">SOL</Text>

      {/* Details */}
      {showDetails && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 300,
            delay: 100,
          }}
          className="mt-4 pt-4 border-t border-gray-200 w-full"
        >
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Wallet Address</Text>
            <Text className="text-sm text-gray-900 font-medium">
              {solToken.mint.slice(0, 4)}...{solToken.mint.slice(-4)}
            </Text>
          </View>
        </MotiView>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <MotiView
          animate={{
            scale: isPressed ? 0.98 : 1,
          }}
          transition={{
            type: 'timing',
            duration: 100,
          }}
        >
          <Card variant="elevated">{content}</Card>
        </MotiView>
      </Pressable>
    );
  }

  return <Card variant="elevated">{content}</Card>;
};
