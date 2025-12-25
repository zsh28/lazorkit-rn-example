import { StatusBar } from "expo-status-bar";
import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback, useMemo, useEffect } from "react";
import * as Haptics from 'expo-haptics';
import { PublicKey } from '@solana/web3.js';

// Hooks
import { useAllTokenBalances } from '../hooks/useTokenBalances';
import { useSendTransaction } from '../hooks/useSendTransaction';
import { useAddressBook, useRecentAddresses } from '../hooks/useAddressBook';

// Components
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { TokenDropdown } from '../components/wallet/TokenDropdown';
import { Modal } from '../components/ui/Modal';

// Utils
import { isValidTokenAmount } from '../services/formatters/amount';
import { formatTokenAmountDisplay } from '../services/formatters/amount';
import { TokenMetadata } from '../types/tokens';

export default function SendScreen() {
  const router = useRouter();

  // State
  const [selectedToken, setSelectedToken] = useState<TokenMetadata | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amountError, setAmountError] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');

  // Hooks
  const { data: tokens, isLoading: tokensLoading } = useAllTokenBalances();
  const { sendTransaction, isSending } = useSendTransaction();
  const { entries: addressBookEntries, addEntry, markAsUsed } = useAddressBook();
  const { data: recentAddresses } = useRecentAddresses(3);

  // Check if recipient address is already saved
  const isAddressSaved = useMemo(() => {
    if (!recipient || recipientError) return false;
    return addressBookEntries.some(entry => entry.address === recipient);
  }, [recipient, recipientError, addressBookEntries]);

  // Auto-select SOL as default token
  useEffect(() => {
    if (tokens && tokens.length > 0 && !selectedToken) {
      const sol = tokens.find(t => t.mint === 'So11111111111111111111111111111111111111112');
      if (sol) setSelectedToken(sol);
    }
  }, [tokens, selectedToken]);

  // Validate address
  const validateAddress = useCallback((address: string): boolean => {
    if (!address || address.trim().length === 0) {
      setRecipientError('Recipient address is required');
      return false;
    }

    try {
      new PublicKey(address);
      setRecipientError('');
      return true;
    } catch {
      setRecipientError('Invalid Solana address');
      return false;
    }
  }, []);

  // Validate amount
  const validateAmount = useCallback((value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setAmountError('Amount is required');
      return false;
    }

    if (!isValidTokenAmount(value)) {
      setAmountError('Invalid amount');
      return false;
    }

    if (!selectedToken) {
      setAmountError('Select a token first');
      return false;
    }

    const numValue = parseFloat(value);
    const maxBalance = selectedToken.balance / Math.pow(10, selectedToken.decimals);

    if (numValue > maxBalance) {
      setAmountError('Insufficient balance');
      return false;
    }

    setAmountError('');
    return true;
  }, [selectedToken]);

  // Handle max button
  const handleMaxPress = useCallback(() => {
    if (!selectedToken) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const maxAmount = selectedToken.balance / Math.pow(10, selectedToken.decimals);
    
    // For SOL, leave some for fees
    const finalAmount = selectedToken.mint === 'So11111111111111111111111111111111111111112'
      ? Math.max(0, maxAmount - 0.001)
      : maxAmount;

    setAmount(finalAmount.toString());
    validateAmount(finalAmount.toString());
  }, [selectedToken, validateAmount]);

  // Handle recent address selection
  const handleRecentAddressPress = useCallback((address: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRecipient(address);
    validateAddress(address);
  }, [validateAddress]);

  // Handle save address
  const handleSaveAddress = useCallback(() => {
    if (!recipient || !validateAddress(recipient)) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSaveModal(true);
  }, [recipient, validateAddress]);

  // Handle confirm save
  const handleConfirmSave = useCallback(() => {
    if (addressLabel && addressLabel.trim()) {
      addEntry({ address: recipient, label: addressLabel.trim() });
      setShowSaveModal(false);
      setAddressLabel('');
      
      // Show success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [addressLabel, recipient, addEntry]);

  // Handle send
  const handleSend = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isAmountValid = validateAmount(amount);
    const isAddressValid = validateAddress(recipient);

    if (!isAmountValid || !isAddressValid || !selectedToken) {
      return;
    }

    // Show confirmation
    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${selectedToken.symbol} to ${recipient.slice(0, 8)}...${recipient.slice(-8)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            sendTransaction(
              {
                recipient,
                amount,
                mint: selectedToken.mint,
                decimals: selectedToken.decimals,
              },
              {
                onSuccess: () => {
                  console.log('📱 Send screen: Transaction SUCCESS callback fired!');
                  
                  // Mark address as used
                  markAsUsed(recipient);
                  console.log('📱 Marked address as used');
                  
                  // Reset form
                  setAmount('');
                  setRecipient('');
                  setAmountError('');
                  setRecipientError('');
                  console.log('📱 Form reset complete');
                  
                  // Go back to dashboard
                  console.log('📱 Navigating back to dashboard in 1 second...');
                  setTimeout(() => {
                    console.log('📱 Executing router.back()');
                    router.back();
                  }, 1000);
                },
                onError: (error: any) => {
                  // Error is already handled by useSendTransaction hook
                  // Just log it here for debugging
                  console.log('📱 Transaction error in send screen:', error?.message);
                  console.log('📱 Staying on send screen - not navigating');
                  // Don't navigate away - stay on send screen
                },
              }
            );
          },
        },
      ]
    );
  }, [amount, recipient, selectedToken, validateAmount, validateAddress, sendTransaction, markAsUsed, router]);

  // Estimated fee (simplified)
  const estimatedFee = useMemo(() => {
    if (!selectedToken) return '~0.000005 SOL';
    return selectedToken.mint === 'So11111111111111111111111111111111111111112'
      ? '~0.000005 SOL'
      : '~0.00001 SOL';
  }, [selectedToken]);

  // Loading state
  if (tokensLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <LoadingSpinner size="large" message="Loading tokens..." fullScreen />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <IconButton
          iconName="arrow-back"
          size="medium"
          variant="ghost"
          onPress={() => router.back()}
        />
        <Text className="text-xl font-bold text-gray-900">Send</Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Token Selector */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Token</Text>
          <TokenDropdown
            tokens={tokens || []}
            selectedToken={selectedToken || undefined}
            onSelectToken={setSelectedToken}
          />
        </View>

        {/* Amount Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Amount</Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                placeholder="0.00"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  validateAmount(text);
                }}
                keyboardType="decimal-pad"
                error={amountError}
              />
            </View>
            <Button
              onPress={handleMaxPress}
              variant="secondary"
              size="medium"
              disabled={!selectedToken}
            >
              MAX
            </Button>
          </View>
          {selectedToken && !amountError && (
            <Text className="text-xs text-gray-600 mt-1">
              Balance: {formatTokenAmountDisplay(selectedToken.balance, selectedToken.decimals)} {selectedToken.symbol}
            </Text>
          )}
        </View>

        {/* Recipient Input */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700">Recipient Address</Text>
            {recipient && !recipientError && !isAddressSaved && (
              <Pressable onPress={handleSaveAddress}>
                <Text className="text-sm font-semibold text-primary-600">Save +</Text>
              </Pressable>
            )}
            {recipient && !recipientError && isAddressSaved && (
              <Text className="text-sm font-medium text-green-600">✓ Saved</Text>
            )}
          </View>
          <Input
            placeholder="Solana address"
            value={recipient}
            onChangeText={(text) => {
              setRecipient(text);
              validateAddress(text);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            error={recipientError}
          />
        </View>

        {/* Recent Addresses */}
        {recentAddresses && recentAddresses.length > 0 && (
          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Recent Addresses
            </Text>
            {recentAddresses.map((entry) => (
              <Pressable
                key={entry.id}
                onPress={() => handleRecentAddressPress(entry.address)}
              >
                <Card
                  variant="outlined"
                  padding="small"
                  className="mb-2"
                >
                  <Text className="text-sm font-medium text-gray-900 mb-0.5">
                    {entry.label}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    {entry.address.slice(0, 16)}...{entry.address.slice(-16)}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        {/* Transaction Summary */}
        {amount && recipient && selectedToken && !amountError && !recipientError && (
          <Card variant="filled" padding="medium" className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Transaction Summary
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">Amount</Text>
              <Text className="text-sm font-medium text-gray-900">
                {amount} {selectedToken.symbol}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">To</Text>
              <Text className="text-sm font-medium text-gray-900">
                {recipient.slice(0, 8)}...{recipient.slice(-8)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Network Fee</Text>
              <Text className="text-sm font-medium text-gray-900">
                {estimatedFee}
              </Text>
            </View>
          </Card>
        )}

        {/* Send Button */}
        <Button
          onPress={handleSend}
          loading={isSending}
          disabled={!amount || !recipient || !selectedToken || !!amountError || !!recipientError}
          variant="primary"
          size="large"
          className="mb-8"
        >
          Send Transaction
        </Button>
      </ScrollView>

      {/* Save Address Modal */}
      <Modal
        visible={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setAddressLabel('');
        }}
        title="Save Address"
      >
        <View className="py-4 pb-8">
          <Text className="text-sm text-gray-600 mb-4">
            Enter a label for this address so you can easily find it later.
          </Text>
          
          <Input
            placeholder="e.g., John's Wallet, Exchange, etc."
            value={addressLabel}
            onChangeText={setAddressLabel}
            autoFocus
            autoCapitalize="words"
          />

          <View className="flex-row gap-3 mt-6">
            <View className="flex-1">
              <Button
                onPress={() => {
                  setShowSaveModal(false);
                  setAddressLabel('');
                }}
                variant="secondary"
                size="medium"
                fullWidth
              >
                Cancel
              </Button>
            </View>
            <View className="flex-1">
              <Button
                onPress={handleConfirmSave}
                variant="primary"
                size="medium"
                fullWidth
                disabled={!addressLabel || !addressLabel.trim()}
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
