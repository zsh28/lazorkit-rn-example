import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function TransactionSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const signature = params.signature as string || '';
  const amount = params.amount as string || '0';
  const symbol = params.symbol as string || 'SOL';
  const type = (params.type as string) || 'sent'; // sent, received, swap

  const handleViewExplorer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Open Solana Explorer
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    console.log('Open explorer:', explorerUrl);
  }, [signature]);

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/dashboard');
  }, [router]);

  const getSuccessMessage = () => {
    switch (type) {
      case 'sent':
        return {
          title: 'Transaction Sent!',
          description: 'Your transaction has been submitted to the network',
          icon: '✅',
        };
      case 'received':
        return {
          title: 'Received!',
          description: 'Funds have been added to your wallet',
          icon: '💰',
        };
      case 'swap':
        return {
          title: 'Swap Complete!',
          description: 'Your tokens have been exchanged',
          icon: '🔄',
        };
      default:
        return {
          title: 'Success!',
          description: 'Transaction completed successfully',
          icon: '✅',
        };
    }
  };

  const successInfo = getSuccessMessage();

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <View className="flex-1 items-center justify-center px-6">
        {/* Animated Success Icon */}
        <MotiView
          from={{ scale: 0, rotate: '0deg' }}
          animate={{ scale: 1, rotate: '360deg' }}
          transition={{
            type: 'spring',
            duration: 600,
            delay: 100,
          }}
          className="mb-6"
        >
          <View className="w-24 h-24 bg-success-light rounded-full items-center justify-center">
            <Text className="text-5xl">{successInfo.icon}</Text>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
        >
          <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {successInfo.title}
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6">
            {successInfo.description}
          </Text>
        </MotiView>

        {/* Amount Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 500 }}
          className="w-full mb-6"
        >
          <Card variant="elevated" padding="large">
            <View className="items-center">
              <Text className="text-sm text-gray-600 mb-1">Amount</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {amount} {symbol}
              </Text>
            </View>
          </Card>
        </MotiView>

        {/* Transaction Signature */}
        {signature && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 600 }}
            className="w-full mb-8"
          >
            <Card variant="outlined" padding="medium">
              <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Transaction Signature
              </Text>
              <Text className="text-xs font-mono text-gray-700" numberOfLines={1}>
                {signature}
              </Text>
            </Card>
          </MotiView>
        )}

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 700 }}
          className="w-full"
        >
          {signature && (
            <Button
              onPress={handleViewExplorer}
              variant="outline"
              size="large"
              fullWidth
              className="mb-3"
            >
              View on Explorer
            </Button>
          )}
          
          <Button
            onPress={handleDone}
            variant="primary"
            size="large"
            fullWidth
          >
            Done
          </Button>
        </MotiView>
      </View>
    </View>
  );
}
