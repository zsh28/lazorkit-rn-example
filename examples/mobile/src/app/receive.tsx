import { StatusBar } from "expo-status-bar";
import { View, Text, Share, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

// Hooks
import { useLazor } from '../providers/LazorProvider';
import { useToast } from '../providers/ToastProvider';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigationWithFeedback } from '../hooks/useNavigationWithFeedback';

// Services
import { logger } from '../services/logger';

// Components
import { IconButton } from '../components/ui/IconButton';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { QRCodeGenerator } from '../components/ui/QRCodeGenerator';

export default function ReceiveScreen() {
  const router = useRouter();
  const { smartWalletPubkey } = useLazor();
  const { showToast } = useToast();
  const { medium } = useHaptics();
  const { goBack } = useNavigationWithFeedback();

  const walletAddress = smartWalletPubkey?.toString() || '';

  // Copy address to clipboard
  const handleCopyAddress = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      medium();
      await Clipboard.setStringAsync(walletAddress);
      showToast('Address copied to clipboard', 'success');
      logger.action('Address copied', { screen: 'Receive' });
    } catch (error) {
      logger.error('Error copying address', error, { screen: 'Receive' });
      showToast('Failed to copy address', 'error');
    }
  }, [walletAddress, showToast, medium]);

  // Share address
  const handleShareAddress = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      medium();
      await Share.share({
        message: `My Solana wallet address:\n${walletAddress}`,
        title: 'Solana Wallet Address',
      });
      logger.action('Address shared', { screen: 'Receive' });
    } catch (error) {
      logger.error('Error sharing address', error, { screen: 'Receive' });
    }
  }, [walletAddress, medium]);

  if (!walletAddress) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <StatusBar style="dark" />
        <Ionicons name="wallet-outline" size={64} color="#9ca3af" />
        <Text className="text-lg font-semibold text-gray-900 mt-4">
          Wallet not connected
        </Text>
        <Text className="text-sm text-gray-600 mt-2 text-center">
          Please connect your wallet to receive tokens
        </Text>
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
          onPress={goBack}
        />
        <Text className="text-xl font-bold text-gray-900">Receive</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        {/* Instructions */}
        <Card variant="filled" padding="medium" className="mb-6" animate={false}>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Receive Solana & SPL Tokens
          </Text>
          <Text className="text-xs text-gray-600">
            Share your wallet address or QR code to receive SOL and any SPL tokens on Solana.
          </Text>
        </Card>

        {/* QR Code */}
        <View className="items-center mb-6">
          <QRCodeGenerator value={walletAddress} size={220} />
        </View>

        {/* Wallet Address */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Your Wallet Address
          </Text>
          <Card variant="outlined" padding="medium" animate={false}>
            <Text className="text-sm font-mono text-gray-900" style={{ flexWrap: 'wrap' }}>
              {walletAddress}
            </Text>
          </Card>
        </View>

        {/* Action Buttons */}
        <View className="flex-row mb-4" style={styles.buttonRow}>
          <View className="flex-1">
            <Button
              onPress={handleCopyAddress}
              variant="primary"
              size="large"
            >
              Copy Address
            </Button>
          </View>
          <View className="flex-1">
            <Button
              onPress={handleShareAddress}
              variant="secondary"
              size="large"
            >
              Share
            </Button>
          </View>
        </View>

        {/* Warning */}
        <Card variant="outlined" padding="medium" animate={false}>
          <View className="flex-row items-start" style={styles.warningRow}>
            <View className="mr-2">
              <Ionicons name="warning-outline" size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-700 mb-1">
                Only send Solana (SOL) and SPL tokens
              </Text>
              <Text className="text-xs text-gray-600">
                Sending other crypto currencies to this address may result in permanent loss.
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    gap: 12,
  },
  warningRow: {
    gap: 8,
  },
});
