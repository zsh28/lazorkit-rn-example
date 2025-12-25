import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert, Pressable, TextInput, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useLazor } from '../providers/LazorProvider';
import { useSecurity } from '../providers/SecurityProvider';
import { SESSION_TIMEOUT_OPTIONS, SessionTimeoutValue } from '../providers/SecurityProvider';
import { useHiddenTokens } from '../hooks/useHiddenTokens';
import { useAddressBook } from '../hooks/useAddressBook';
import { useAllTokenBalances } from '../hooks/useTokenBalances';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { NetworkBadge } from '../components/wallet/NetworkBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../providers/ToastProvider';
import { truncateAddress } from '../services/formatters/address';
import * as LocalAuthentication from 'expo-local-authentication';
import { getRpcUrl, setCustomRpcUrl, resetRpcUrl, testRpcUrl, DEFAULT_RPC_ENDPOINTS } from '../services/storage/rpc';
import { clearAllTransactionCaches } from '../services/storage/transactions';
import { clearLastActivity } from '../services/storage/session';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { smartWalletPubkey, isConnected, disconnect } = useLazor();
  const { isAppLockEnabled, enableAppLock, disableAppLock, sessionTimeout, setSessionTimeout } = useSecurity();
  const { hiddenTokens, unhideToken } = useHiddenTokens();
  const { entries: addressBookEntries, deleteEntry } = useAddressBook();
  const { data: allTokens, isLoading: isLoadingTokens } = useAllTokenBalances();
  const { showToast } = useToast();

  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentRpcUrl, setCurrentRpcUrl] = useState<string>('');
  const [showRpcModal, setShowRpcModal] = useState(false);
  const [tempRpcUrl, setTempRpcUrl] = useState<string>('');
  const [isTestingRpc, setIsTestingRpc] = useState(false);

  // Load current RPC URL on mount
  useEffect(() => {
    loadRpcUrl();
  }, []);

  const loadRpcUrl = async () => {
    const url = await getRpcUrl();
    setCurrentRpcUrl(url);
  };

  // Network selection (currently hardcoded to devnet in config)
  const currentNetwork = 'devnet';

  // Handle biometric lock toggle
  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        // Enabling - require authentication (biometric or PIN)
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        
        if (!hasHardware) {
          showToast('Device does not support authentication', 'error');
          return;
        }

        // Check what authentication types are available
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const hasBiometric = await LocalAuthentication.isEnrolledAsync();
        
        // Authenticate before enabling (will use biometric if available, otherwise PIN)
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: hasBiometric ? 'Authenticate to enable lock' : 'Enter your PIN to enable lock',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false, // Allow PIN/password fallback
          fallbackLabel: 'Use PIN',
        });

        if (result.success) {
          await enableAppLock();
          showToast('App lock enabled', 'success');
        } else {
          showToast('Authentication failed', 'error');
        }
      } else {
        // Disabling - also require authentication to confirm
        const hasBiometric = await LocalAuthentication.isEnrolledAsync();
        
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: hasBiometric ? 'Authenticate to disable lock' : 'Enter your PIN to disable lock',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false, // Allow PIN/password fallback
          fallbackLabel: 'Use PIN',
        });

        if (result.success) {
          await disableAppLock();
          showToast('App lock disabled', 'success');
        } else {
          showToast('Authentication failed', 'error');
        }
      }
    } catch (error) {
      console.error('App lock toggle error:', error);
      showToast('Failed to toggle app lock', 'error');
    }
  };

  // Handle unhide token
  const handleUnhideToken = (mint: string, symbol: string) => {
    Alert.alert(
      'Unhide Token',
      `Unhide ${symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unhide',
          onPress: () => {
            unhideToken(mint);
            showToast(`${symbol} unhidden`, 'success');
          },
        },
      ]
    );
  };

  // Handle delete address book entry
  const handleDeleteAddress = (id: string, label: string) => {
    Alert.alert(
      'Delete Address',
      `Delete "${label}" from address book?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEntry(id);
            showToast('Address deleted', 'success');
          },
        },
      ]
    );
  };

  // Handle clear cache
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data (tokens, transactions, metadata) and force a refresh. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            setIsClearingCache(true);
            try {
              await queryClient.invalidateQueries();
              await queryClient.clear();
              await clearAllTransactionCaches();
              showToast('Cache cleared successfully', 'success');
            } catch (error) {
              showToast('Failed to clear cache', 'error');
            } finally {
              setIsClearingCache(false);
            }
          },
        },
      ]
    );
  };

  // Handle copy wallet address
  const handleCopyAddress = async () => {
    if (smartWalletPubkey) {
      await Clipboard.setStringAsync(smartWalletPubkey.toBase58());
      showToast('Address copied', 'success');
    }
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to disconnect your wallet? You will need to reconnect to access your wallet again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await disconnect({
                onSuccess: async () => {
                  // Clear session data
                  await clearLastActivity();
                  
                  // Clear cache
                  await queryClient.invalidateQueries();
                  await queryClient.clear();
                  
                  showToast('Logged out successfully', 'success');
                  
                  // Navigate to welcome screen
                  router.replace('/welcome');
                },
                onFail: (error) => {
                  console.error('Logout error:', error);
                  showToast('Failed to logout', 'error');
                  setIsLoggingOut(false);
                }
              });
            } catch (error) {
              console.error('Logout error:', error);
              showToast('Failed to logout', 'error');
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  // Handle session timeout change
  const handleSessionTimeoutChange = () => {
    const timeoutOptions: { label: string; value: SessionTimeoutValue }[] = [
      { label: 'Immediately', value: SESSION_TIMEOUT_OPTIONS.IMMEDIATELY },
      { label: '1 Minute', value: SESSION_TIMEOUT_OPTIONS.ONE_MINUTE },
      { label: '5 Minutes', value: SESSION_TIMEOUT_OPTIONS.FIVE_MINUTES },
      { label: '15 Minutes', value: SESSION_TIMEOUT_OPTIONS.FIFTEEN_MINUTES },
      { label: '30 Minutes', value: SESSION_TIMEOUT_OPTIONS.THIRTY_MINUTES },
      { label: 'Never', value: SESSION_TIMEOUT_OPTIONS.NEVER },
    ];

    Alert.alert(
      'Session Timeout',
      'Choose when to lock the app after inactivity:',
      [
        ...timeoutOptions.map(option => ({
          text: option.label,
          onPress: async () => {
            try {
              await setSessionTimeout(option.value);
              showToast(`Session timeout set to ${option.label.toLowerCase()}`, 'success');
            } catch (error) {
              showToast('Failed to update session timeout', 'error');
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Get current session timeout label
  const getSessionTimeoutLabel = (timeout: SessionTimeoutValue): string => {
    switch (timeout) {
      case SESSION_TIMEOUT_OPTIONS.IMMEDIATELY:
        return 'Immediately';
      case SESSION_TIMEOUT_OPTIONS.ONE_MINUTE:
        return '1 Minute';
      case SESSION_TIMEOUT_OPTIONS.FIVE_MINUTES:
        return '5 Minutes';
      case SESSION_TIMEOUT_OPTIONS.FIFTEEN_MINUTES:
        return '15 Minutes';
      case SESSION_TIMEOUT_OPTIONS.THIRTY_MINUTES:
        return '30 Minutes';
      case SESSION_TIMEOUT_OPTIONS.NEVER:
        return 'Never';
      default:
        return 'Immediately';
    }
  };

  // Handle custom RPC URL
  const handleCustomRpcUrl = () => {
    setTempRpcUrl(currentRpcUrl);
    setShowRpcModal(true);
  };

  // Save custom RPC URL
  const handleSaveRpcUrl = async () => {
    if (!tempRpcUrl || tempRpcUrl.trim() === '') {
      showToast('Please enter a valid URL', 'error');
      return;
    }

    setIsTestingRpc(true);
    showToast('Testing RPC endpoint...', 'info');
    
    const isWorking = await testRpcUrl(tempRpcUrl.trim());

    if (isWorking) {
      await setCustomRpcUrl(tempRpcUrl.trim());
      await loadRpcUrl();
      await queryClient.invalidateQueries();
      setShowRpcModal(false);
      setIsTestingRpc(false);
      showToast('RPC URL updated successfully', 'success');
    } else {
      setIsTestingRpc(false);
      showToast('RPC endpoint is not responding', 'error');
    }
  };

  // Handle reset RPC URL
  const handleResetRpcUrl = () => {
    Alert.alert(
      'Reset RPC URL',
      'Reset to default Solana devnet RPC endpoint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetRpcUrl();
            await loadRpcUrl();
            await queryClient.invalidateQueries();
            showToast('RPC URL reset to default', 'success');
          },
        },
      ]
    );
  };

  // Get RPC URL display (truncate if too long)
  const getRpcDisplayUrl = (url: string): string => {
    if (url === DEFAULT_RPC_ENDPOINTS.devnet) {
      return 'Default (Solana)';
    }
    if (url.length > 35) {
      return url.slice(0, 32) + '...';
    }
    return url;
  };

  // Get hidden tokens data - filter allTokens by hiddenTokens (string array from hook)
  const hiddenTokensData = allTokens?.filter(token => 
    hiddenTokens.includes(token.mint)
  ) || [];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-12 pb-8">
        {/* Header */}
        <View className="mb-6">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary-600 text-base mb-2">← Back</Text>
          </Pressable>
          <Text className="text-3xl font-bold text-gray-900">Settings</Text>
        </View>

        {/* Network Section */}
        <Card variant="outlined" padding="medium" className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900">Network</Text>
            <NetworkBadge />
          </View>
          <Text className="text-sm text-gray-500 mb-4">
            Currently connected to {currentNetwork.toUpperCase()}.
          </Text>

          {/* RPC Endpoint */}
          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900 mb-1">RPC Endpoint</Text>
                <Text className="text-xs text-gray-500">
                  {getRpcDisplayUrl(currentRpcUrl)}
                </Text>
              </View>
            </View>
            <View className="flex-row space-x-2 mt-2">
              <View className="flex-1">
                <Button
                  variant="outline"
                  size="small"
                  onPress={handleCustomRpcUrl}
                >
                  Change URL
                </Button>
              </View>
              {currentRpcUrl !== DEFAULT_RPC_ENDPOINTS.devnet && (
                <View className="flex-1">
                  <Button
                    variant="outline"
                    size="small"
                    onPress={handleResetRpcUrl}
                  >
                    Reset
                  </Button>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Security Section */}
        <Card variant="outlined" padding="medium" className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">App Lock</Text>
              <Text className="text-sm text-gray-500">
                Require biometric or PIN to unlock app
              </Text>
            </View>
            <Switch
              value={isAppLockEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={isAppLockEnabled ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          {/* Session Timeout - only show when app lock is enabled */}
          {isAppLockEnabled && (
            <View className="border-t border-gray-100 pt-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900 mb-1">Session Timeout</Text>
                  <Text className="text-xs text-gray-500">
                    Lock app after inactivity
                  </Text>
                </View>
                <Pressable
                  onPress={handleSessionTimeoutChange}
                  className="bg-gray-100 px-3 py-2 rounded-lg"
                >
                  <Text className="text-sm font-medium text-primary-600">
                    {getSessionTimeoutLabel(sessionTimeout)}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </Card>

        {/* Hidden Tokens Section */}
        <Card variant="outlined" padding="medium" className="mb-4">
          <View className="mb-3">
            <Text className="text-base font-semibold text-gray-900 mb-1">Hidden Tokens</Text>
            <Text className="text-sm text-gray-500">
              Tokens you've hidden from the main view
            </Text>
          </View>

          {isLoadingTokens ? (
            <LoadingSpinner size="small" message="Loading hidden tokens..." />
          ) : hiddenTokensData.length === 0 ? (
            <View className="py-4">
              <Text className="text-sm text-gray-400 text-center">No hidden tokens</Text>
            </View>
          ) : (
            <View className="space-y-2">
              {hiddenTokensData.map((token) => (
                <View key={token.mint} className="flex-row items-center justify-between py-2 border-b border-gray-100">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">{token.symbol}</Text>
                    <Text className="text-xs text-gray-500">
                      Balance: {token.balance.toFixed(token.decimals < 6 ? token.decimals : 6)}
                    </Text>
                  </View>
                  <Button
                    variant="outline"
                    size="small"
                    onPress={() => handleUnhideToken(token.mint, token.symbol)}
                  >
                    Unhide
                  </Button>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Address Book Section */}
        <Card variant="outlined" padding="medium" className="mb-4">
          <View className="mb-3">
            <Text className="text-base font-semibold text-gray-900 mb-1">Address Book</Text>
            <Text className="text-sm text-gray-500">
              Saved addresses for quick sending
            </Text>
          </View>

          {addressBookEntries.length === 0 ? (
            <View className="py-4">
              <Text className="text-sm text-gray-400 text-center">No saved addresses</Text>
            </View>
          ) : (
            <View className="space-y-2">
              {addressBookEntries.map((entry) => (
                <View key={entry.id} className="flex-row items-center justify-between py-2 border-b border-gray-100">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-medium text-gray-900">{entry.label}</Text>
                    <Text className="text-xs text-gray-500 font-mono">
                      {truncateAddress(entry.address, 8, 8)}
                    </Text>
                  </View>
                  <Button
                    variant="outline"
                    size="small"
                    onPress={() => handleDeleteAddress(entry.id, entry.label)}
                  >
                    Delete
                  </Button>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Maintenance Section */}
        <Card variant="outlined" padding="medium" className="mb-4">
          <View className="mb-3">
            <Text className="text-base font-semibold text-gray-900 mb-1">Maintenance</Text>
            <Text className="text-sm text-gray-500">
              Clear cached data and force refresh
            </Text>
          </View>
          <Button
            variant="outline"
            size="medium"
            onPress={handleClearCache}
            disabled={isClearingCache}
            loading={isClearingCache}
          >
            Clear Cache
          </Button>
        </Card>

        {/* Wallet Section - Logout */}
        {isConnected && (
          <Card variant="outlined" padding="medium" className="mb-4">
            <View className="mb-3">
              <Text className="text-base font-semibold text-gray-900 mb-1">Wallet</Text>
              <Text className="text-sm text-gray-500">
                Disconnect your wallet from this device
              </Text>
            </View>
            <Button
              variant="outline"
              size="medium"
              onPress={handleLogout}
              disabled={isLoggingOut}
              loading={isLoggingOut}
            >
              Logout
            </Button>
          </Card>
        )}

        {/* About Section */}
        <Card variant="outlined" padding="medium" className="mb-4">
          <View className="mb-3">
            <Text className="text-base font-semibold text-gray-900 mb-1">About</Text>
          </View>

          <View className="space-y-3">
            {/* App Version */}
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm text-gray-600">App Version</Text>
              <Text className="text-sm font-medium text-gray-900">1.0.0</Text>
            </View>

            {/* Wallet Address */}
            <View className="py-2 border-t border-gray-100">
              <Text className="text-sm text-gray-600 mb-2">Wallet Address</Text>
              {isConnected && smartWalletPubkey ? (
                <View>
                  <Text className="text-xs font-mono text-gray-900 mb-2">
                    {smartWalletPubkey.toBase58()}
                  </Text>
                  <Button
                    variant="outline"
                    size="small"
                    onPress={handleCopyAddress}
                  >
                    Copy Address
                  </Button>
                </View>
              ) : (
                <Text className="text-sm text-gray-400">Not connected</Text>
              )}
            </View>

            {/* Connection Status */}
            <View className="flex-row items-center justify-between py-2 border-t border-gray-100">
              <Text className="text-sm text-gray-600">Connection Status</Text>
              <Badge variant={isConnected ? 'success' : 'error'} size="small">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </View>
          </View>
        </Card>

        {/* Footer */}
        <View className="py-4">
          <Text className="text-xs text-gray-400 text-center">
            Lazor Demo Wallet
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-1">
            Built with Lazor Kit SDK
          </Text>
        </View>
      </View>

      {/* RPC URL Modal */}
      <Modal
        visible={showRpcModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRpcModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Custom RPC URL
            </Text>
            <Text className="text-sm text-gray-500 mb-4">
              Enter a custom Solana RPC endpoint URL
            </Text>

            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 mb-4"
              placeholder="https://api.devnet.solana.com"
              value={tempRpcUrl}
              onChangeText={setTempRpcUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Button
                  variant="outline"
                  size="medium"
                  onPress={() => setShowRpcModal(false)}
                  disabled={isTestingRpc}
                >
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  variant="primary"
                  size="medium"
                  onPress={handleSaveRpcUrl}
                  loading={isTestingRpc}
                  disabled={isTestingRpc}
                >
                  Test & Save
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
