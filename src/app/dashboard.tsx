import { StatusBar } from "expo-status-bar";
import { View, FlatList, RefreshControl, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import * as React from 'react';
import * as Haptics from 'expo-haptics';

// Hooks
import { useLazor } from '../providers/LazorProvider';
import { useAllTokenBalances } from '../hooks/useTokenBalances';
import { useHiddenTokens } from '../hooks/useHiddenTokens';
import { useAirdrop, useShouldShowAirdrop } from '../hooks/useAirdrop';
import { useTransactions } from '../hooks/useTransactions';

// Components
import { NetworkBadge } from '../components/wallet/NetworkBadge';
import { BalanceCard } from '../components/wallet/BalanceCard';
import { QuickActions } from '../components/wallet/QuickActions';
import { TokenListItem } from '../components/wallet/TokenListItem';
import { TransactionListItem } from '../components/ui/TransactionListItem';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { Text } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // LazorKit wallet connection
  const { isConnected } = useLazor();

  // Hooks
  const { data: tokens, isLoading, error, refetch } = useAllTokenBalances();
  const { hideToken } = useHiddenTokens();
  const { requestAirdrop, isRequesting } = useAirdrop();
  const shouldShowAirdrop = useShouldShowAirdrop();
  const { data: recentTransactions } = useTransactions(3); // Get 3 recent transactions

  // Redirect to welcome screen if not connected - use useEffect to avoid navigation during render
  React.useEffect(() => {
    if (!isConnected) {
      router.replace('/welcome');
    }
  }, [isConnected, router]);

  // Show loading while checking connection
  if (!isConnected) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <StatusBar style="dark" />
        <LoadingSpinner size="large" message="Loading..." />
      </View>
    );
  }
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // Navigation handlers
  const handleSend = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/send');
  }, [router]);

  const handleReceive = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/receive');
  }, [router]);

  const handleSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  }, [router]);

  const handleViewTransactions = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/transaction-history');
  }, [router]);

  // Token handlers
  const handleTokenPress = useCallback((mint: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to token details (to be implemented)
    console.log('Token pressed:', mint);
  }, []);

  const handleTokenLongPress = useCallback((mint: string, symbol: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      `Hide ${symbol}?`,
      `This token will be hidden from your token list. You can unhide it later in Settings.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Hide',
          style: 'destructive',
          onPress: () => {
            hideToken(mint);
          },
        },
      ]
    );
  }, [hideToken]);

  // Airdrop handler
  const handleAirdrop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    requestAirdrop(1); // Request 1 SOL
  }, [requestAirdrop]);

  // Redirect to welcome screen if not connected
  if (!isConnected) {
    router.replace('/welcome');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <LoadingSpinner size="large" message="Loading your wallet..." fullScreen />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <StatusBar style="dark" />
        <Card variant="outlined" padding="large" className="w-full">
          <Text className="text-lg font-semibold text-error mb-2">
            Unable to load wallet
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </Text>
          <Button onPress={() => refetch()} variant="primary" size="medium">
            Try Again
          </Button>
        </Card>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <FlatList
        data={tokens || []}
        keyExtractor={(item) => item.mint}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb" // primary-600
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header with Network Badge and Settings */}
            <View className="px-4 pt-12 pb-4 flex-row items-center justify-between">
              <NetworkBadge network="devnet" />
              <IconButton
                iconName="settings-outline"
                onPress={handleSettings}
                variant="ghost"
                size="medium"
              />
            </View>

            {/* Balance Card */}
            <View className="px-4 pb-4">
              <BalanceCard />
            </View>

            {/* Quick Actions */}
            <View className="px-4 pb-6">
              <QuickActions
                actions={[
                  {
                    label: 'Send',
                    iconName: 'paper-plane',
                    onPress: handleSend,
                    variant: 'primary',
                  },
                  {
                    label: 'Receive',
                    iconName: 'download',
                    onPress: handleReceive,
                    variant: 'secondary',
                  },
                ]}
              />
            </View>

            {/* Airdrop Button (conditional) */}
            {shouldShowAirdrop && (
              <View className="px-4 pb-4">
                <Card variant="outlined" padding="medium" animate={false}>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Low Balance
                  </Text>
                  <Text className="text-xs text-gray-600 mb-3">
                    Get free devnet SOL to start testing. Note: Airdrops may be rate-limited during high usage.
                  </Text>
                  <Button
                    onPress={handleAirdrop}
                    loading={isRequesting}
                    variant="primary"
                    size="medium"
                  >
                    Request Airdrop (1 SOL)
                  </Button>
                </Card>
              </View>
            )}

            {/* Recent Transactions Preview */}
            <View className="px-4 pb-2">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Recent Activity
                </Text>
                <Pressable onPress={handleViewTransactions}>
                  <Text className="text-sm font-semibold text-primary-600">
                    View All →
                  </Text>
                </Pressable>
              </View>
              {recentTransactions && recentTransactions.length > 0 ? (
                <View>
                  {recentTransactions.map((tx, index) => (
                    <View key={tx.signature} className="mb-2">
                      <TransactionListItem
                        type={tx.type}
                        status={tx.status}
                        amount={tx.amount}
                        symbol={tx.symbol}
                        timestamp={tx.timestamp}
                        signature={tx.signature}
                        index={index}
                        onPress={() => {
                          // Open transaction in explorer
                          const explorerUrl = `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`;
                          console.log('Open transaction:', explorerUrl);
                        }}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <Card variant="outlined" padding="medium" animate={false}>
                  <Text className="text-sm text-gray-600 text-center py-2">
                    No recent transactions
                  </Text>
                </Card>
              )}
            </View>

            {/* Token List Header */}
            <View className="px-4 pb-2">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Your Tokens
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className="px-4 pb-2">
            <TokenListItem
              token={item}
              index={index}
              onPress={() => handleTokenPress(item.mint)}
              onLongPress={() => handleTokenLongPress(item.mint, item.symbol)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="px-4">
            <Card variant="outlined" padding="large">
              <Text className="text-center text-gray-600 text-sm">
                No tokens found in your wallet
              </Text>
            </Card>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 24,
        }}
      />
    </View>
  );
}
