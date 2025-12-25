import { StatusBar } from "expo-status-bar";
import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback, useMemo, useEffect } from "react";
import { MotiView } from 'moti';

// Hooks
import { useAllTokenBalances } from '../hooks/useTokenBalances';
import { useSendTransaction } from '../hooks/useSendTransaction';
import { useAddressBook, useRecentAddresses } from '../hooks/useAddressBook';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigationWithFeedback } from '../hooks/useNavigationWithFeedback';

// Components
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { TokenDropdown } from '../components/wallet/TokenDropdown';
import { Modal } from '../components/ui/Modal';

// Services
import { isValidTokenAmount } from '../services/formatters/amount';
import { formatTokenAmountDisplay } from '../services/formatters/amount';
import { validateSolanaAddress, validateTokenAmount } from '../services/validators';
import { logger } from '../services/logger';

// Types
import { TokenMetadata } from '../types/tokens';

export default function SendScreen() {
  const router = useRouter();
  const { light, success, error: hapticError } = useHaptics();
  const { goBack } = useNavigationWithFeedback();

  // State
  const [selectedToken, setSelectedToken] = useState<TokenMetadata | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amountError, setAmountError] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);

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
      if (sol) {
        setSelectedToken(sol);
        logger.info('Auto-selected SOL token', { screen: 'Send' });
      }
    }
  }, [tokens, selectedToken]);

  // Validate address using validation service
  const validateAddress = useCallback((address: string): boolean => {
    const result = validateSolanaAddress(address);
    
    if (!result.valid) {
      setRecipientError(result.error || 'Invalid address');
      return false;
    }

    setRecipientError('');
    return true;
  }, []);

  // Validate amount using validation service
  const validateAmountInput = useCallback((value: string): boolean => {
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

    // Use validation service
    const result = validateTokenAmount(value, {
      mint: selectedToken.mint,
      symbol: selectedToken.symbol,
      decimals: selectedToken.decimals,
      balance: selectedToken.balance / Math.pow(10, selectedToken.decimals),
    });

    if (!result.valid) {
      setAmountError(result.error || 'Invalid amount');
      return false;
    }

    setAmountError('');
    return true;
  }, [selectedToken]);

  // Handle max button
  const handleMaxPress = useCallback(() => {
    if (!selectedToken) return;

    light();
    const maxAmount = selectedToken.balance / Math.pow(10, selectedToken.decimals);
    
    // For SOL, leave some for fees
    const finalAmount = selectedToken.mint === 'So11111111111111111111111111111111111111112'
      ? Math.max(0, maxAmount - 0.001)
      : maxAmount;

    setAmount(finalAmount.toString());
    validateAmountInput(finalAmount.toString());
    logger.action('Max button clicked', { token: selectedToken.symbol, amount: finalAmount });
  }, [selectedToken, validateAmountInput, light]);

  // Handle recent address selection
  const handleRecentAddressPress = useCallback((address: string) => {
    light();
    setRecipient(address);
    validateAddress(address);
  }, [validateAddress, light]);

  // Handle save address
  const handleSaveAddress = useCallback(() => {
    if (!recipient || !validateAddress(recipient)) {
      return;
    }

    light();
    setShowSaveModal(true);
  }, [recipient, validateAddress, light]);

  // Handle confirm save
  const handleConfirmSave = useCallback(() => {
    if (addressLabel && addressLabel.trim()) {
      addEntry({ address: recipient, label: addressLabel.trim() });
      setShowSaveModal(false);
      setAddressLabel('');
      
      // Show success feedback
      success();
    }
  }, [addressLabel, recipient, addEntry, success]);

  // Handle send
  const handleSend = useCallback(() => {
    hapticError();

    const isAmountValid = validateAmountInput(amount);
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
                  logger.transaction('send', { screen: 'Send', recipient });
                  
                  // Set processing success state to keep loading screen visible
                  setIsProcessingSuccess(true);
                  
                  // Mark address as used
                  markAsUsed(recipient);
                  logger.info('Address marked as used', { address: recipient });
                  
                  // Reset form
                  setAmount('');
                  setRecipient('');
                  setAmountError('');
                  setRecipientError('');
                  logger.info('Form reset complete', { screen: 'Send' });
                  
                  // Navigate to dashboard after longer delay
                  // Keep loading overlay visible longer to prevent screen flash
                  logger.navigation('Dashboard', { from: 'Send', reason: 'transaction_success' });
                  setTimeout(() => {
                    // Use replace instead of back to avoid transition animation
                    router.replace('/dashboard');
                    // Reset processing state after longer delay to ensure smooth transition
                    setTimeout(() => setIsProcessingSuccess(false), 1000);
                  }, 1500);
                },
                onError: (error: any) => {
                  // Error is already handled by useSendTransaction hook
                  logger.error('Transaction error in send screen', error, { screen: 'Send' });
                  setIsProcessingSuccess(false);
                  // Don't navigate away - stay on send screen
                },
              }
            );
          },
        },
      ]
    );
  }, [amount, recipient, selectedToken, validateAmountInput, validateAddress, sendTransaction, markAsUsed, router, hapticError]);

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

      {/* Full-screen loading overlay when sending transaction */}
      {(isSending || isProcessingSuccess) && (
        <MotiView 
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          className="absolute inset-0 bg-white z-50 items-center justify-center px-6"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 1000,
            zIndex: 9999
          }}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 100 }}
            className="items-center"
          >
            <LoadingSpinner size="large" />
            <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">
              {isProcessingSuccess ? 'Transaction Successful!' : 'Processing Transaction'}
            </Text>
            <Text className="text-sm text-gray-600 text-center mb-4">
              {isProcessingSuccess ? 'Returning to dashboard...' : 'Waiting for confirmation...'}
            </Text>
            <Card variant="outlined" padding="medium" className="w-full">
              <Text className="text-xs text-gray-600 text-center">
                {isProcessingSuccess 
                  ? 'Your transaction has been confirmed and will appear in your history.'
                  : 'Your transaction is being processed. This may take a few moments.'}
              </Text>
            </Card>
          </MotiView>
        </MotiView>
      )}

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <IconButton
          iconName="arrow-back"
          size="medium"
          variant="ghost"
          onPress={goBack}
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
                  validateAmountInput(text);
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
