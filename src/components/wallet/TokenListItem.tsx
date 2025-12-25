import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { TokenMetadata } from '../../types/tokens';
import { formatTokenAmountDisplay } from '../../services/formatters/amount';

interface TokenListItemProps {
  token: TokenMetadata;
  onPress?: () => void;
  onLongPress?: () => void;
  showBalance?: boolean;
  index?: number; // For staggered animation
}

export const TokenListItem: React.FC<TokenListItemProps> = ({
  token,
  onPress,
  onLongPress,
  showBalance = true,
  index = 0,
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
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onLongPress();
    }
  };

  const formattedBalance = formatTokenAmountDisplay(token.balance, token.decimals);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={!onPress && !onLongPress}
    >
      <MotiView
        from={{
          opacity: 0,
          translateX: -20,
        }}
        animate={{
          opacity: 1,
          translateX: 0,
          scale: isPressed ? 0.98 : 1,
          backgroundColor: isPressed ? '#f9fafb' : '#ffffff',
        }}
        transition={{
          type: 'timing',
          duration: 300,
          delay: index * 50, // Stagger animation based on index
        }}
        className="flex-row items-center p-4 rounded-lg shadow-sm"
      >
        {/* Token Icon */}
        <View className="w-10 h-10 mr-4">
          {token.logoURI ? (
            <Image
              source={{ uri: token.logoURI }}
              className="w-10 h-10 rounded-full"
              defaultSource={require('../../../assets/icon.png')}
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-xl text-primary-600 font-bold">$</Text>
            </View>
          )}
        </View>

        {/* Token Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-0.5">
            {token.symbol}
          </Text>
          <Text className="text-sm text-gray-600" numberOfLines={1}>
            {token.name}
          </Text>
        </View>

        {/* Balance */}
        {showBalance && (
          <View className="items-end">
            <Text className="text-base font-semibold text-gray-900 mb-0.5">
              {formattedBalance}
            </Text>
            <Text className="text-xs text-gray-400">
              {token.symbol}
            </Text>
          </View>
        )}
      </MotiView>
    </Pressable>
  );
};
