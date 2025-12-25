import { StatusBar } from "expo-status-bar";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { TransactionListItem, TransactionType, TransactionStatus } from '../components/ui/TransactionListItem';
import { IconButton } from '../components/ui/IconButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useTransactions } from '../hooks/useTransactions';
import * as Haptics from 'expo-haptics';
import { Linking } from 'react-native';

type FilterType = 'all' | 'sent' | 'received' | 'swap';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { data: transactions, isLoading, error, refetch } = useTransactions(50);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  }, []);

  const handleTransactionPress = useCallback((signature: string) => {
    console.log('View transaction:', signature);
    // Open in Solana Explorer
    Linking.openURL(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  }, []);

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
  }, [refetch]);

  // Filter transactions
  const filteredTransactions = (transactions || []).filter(tx => {
    if (activeFilter === 'all') return true;
    return tx.type === activeFilter;
  });

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <IconButton
            iconName="arrow-back"
            onPress={handleBack}
            variant="ghost"
            size="medium"
          />
          <Text className="text-xl font-bold text-gray-900">
            Transaction History
          </Text>
          <View className="w-10" />
        </View>

        {/* Filter Tabs */}
        <View className="flex-row gap-2">
          {(['all', 'sent', 'received', 'swap'] as FilterType[]).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => handleFilterChange(filter)}
              style={{
                backgroundColor: activeFilter === filter ? '#2563eb' : '#f3f4f6',
              }}
              className="px-4 py-2 rounded-full"
            >
              <Text
                style={{
                  color: activeFilter === filter ? '#ffffff' : '#4b5563',
                }}
                className="text-sm font-medium capitalize"
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Transaction List */}
      {isLoading ? (
        <LoadingSpinner size="large" message="Loading transactions..." fullScreen />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Card variant="outlined" padding="large">
            <Text className="text-lg font-semibold text-error mb-2 text-center">
              Error Loading Transactions
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              {error instanceof Error ? error.message : 'An error occurred'}
            </Text>
          </Card>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            title="No Transactions"
            description={
              activeFilter === 'all'
                ? "You haven't made any transactions yet."
                : `No ${activeFilter} transactions found.`
            }
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor="#2563eb"
            />
          }
        >
          <View className="gap-3">
            {filteredTransactions.map((tx) => (
              <TransactionListItem
                key={tx.signature}
                type={tx.type as TransactionType}
                status={tx.status as TransactionStatus}
                amount={tx.amount}
                symbol={tx.symbol}
                timestamp={tx.timestamp}
                signature={tx.signature}
                onPress={() => handleTransactionPress(tx.signature)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
