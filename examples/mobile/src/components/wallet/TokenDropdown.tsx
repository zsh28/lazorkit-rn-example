import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { TokenMetadata } from '../../types/tokens';
import { formatTokenAmountDisplay } from '../../services/formatters/amount';
import { Modal } from '../ui/Modal';

interface TokenDropdownProps {
  tokens: TokenMetadata[];
  selectedToken?: TokenMetadata;
  onSelectToken: (token: TokenMetadata) => void;
  label?: string;
  error?: string;
  className?: string;
}

export const TokenDropdown: React.FC<TokenDropdownProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  label,
  error,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectToken = (token: TokenMetadata) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectToken(token);
    setIsOpen(false);
  };

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <View className={className}>
      {/* Label */}
      {label && (
        <Text className="text-sm font-medium text-gray-900 mb-1">
          {label}
        </Text>
      )}

      {/* Dropdown Trigger */}
      <Pressable
        onPress={handleOpen}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <MotiView
          animate={{
            scale: isPressed ? 0.98 : 1,
            borderColor: error ? '#ef4444' : '#e5e7eb',
          }}
          transition={{
            type: 'timing',
            duration: 100,
          }}
          className="flex-row items-center justify-between p-4 bg-white rounded-lg border"
        >
          {selectedToken ? (
            <View className="flex-row items-center flex-1">
              {/* Token Icon */}
              {selectedToken.logoURI ? (
                <Image
                  source={{ uri: selectedToken.logoURI }}
                  className="w-8 h-8 rounded-full mr-3"
                />
              ) : (
                <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-3">
                  <Text className="text-lg text-primary-600 font-bold">$</Text>
                </View>
              )}

              {/* Token Info */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {selectedToken.symbol}
                </Text>
                <Text className="text-xs text-gray-600" numberOfLines={1}>
                  {formatTokenAmountDisplay(
                    selectedToken.balance,
                    selectedToken.decimals
                  )}{' '}
                  available
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-base text-gray-400">Select a token</Text>
          )}

          {/* Dropdown Icon */}
          <Text className="text-xl text-gray-600 ml-2">
            {isOpen ? '▲' : '▼'}
          </Text>
        </MotiView>
      </Pressable>

      {/* Error Message */}
      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <Text className="text-sm text-error mt-1">{error}</Text>
        </MotiView>
      )}

      {/* Token List Modal */}
      <Modal
        visible={isOpen}
        onClose={handleClose}
        title="Select Token"
        height="half"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {tokens.map((token) => (
            <TokenDropdownItem
              key={token.mint}
              token={token}
              isSelected={selectedToken?.mint === token.mint}
              onSelect={() => handleSelectToken(token)}
            />
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
};

interface TokenDropdownItemProps {
  token: TokenMetadata;
  isSelected: boolean;
  onSelect: () => void;
}

const TokenDropdownItem: React.FC<TokenDropdownItemProps> = ({
  token,
  isSelected,
  onSelect,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onSelect}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <MotiView
        animate={{
          scale: isPressed ? 0.98 : 1,
          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
        }}
        transition={{
          type: 'timing',
          duration: 100,
        }}
        className="flex-row items-center p-4 rounded-lg mb-2"
      >
        {/* Token Icon */}
        {token.logoURI ? (
          <Image
            source={{ uri: token.logoURI }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
            <Text className="text-xl text-primary-600 font-bold">$</Text>
          </View>
        )}

        {/* Token Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {token.symbol}
          </Text>
          <Text className="text-sm text-gray-600" numberOfLines={1}>
            {token.name}
          </Text>
        </View>

        {/* Balance */}
        <View className="items-end">
          <Text className="text-base font-semibold text-gray-900">
            {formatTokenAmountDisplay(token.balance, token.decimals)}
          </Text>
          {isSelected && (
            <Text className="text-xs text-primary-600 font-medium">
              Selected
            </Text>
          )}
        </View>
      </MotiView>
    </Pressable>
  );
};
