import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface QueryErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
  message?: string;
}

/**
 * Specialized error fallback for query/data fetching errors
 * More compact and context-aware than the general ErrorBoundary
 */
export const QueryErrorFallback: React.FC<QueryErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Unable to load data',
  message = 'There was a problem fetching data. Please try again.',
}) => {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center px-6">
      <Card variant="outlined" padding="large" className="w-full">
        <View className="items-center mb-4">
          <Ionicons name="cloud-offline-outline" size={48} color="#6b7280" className="mb-3" />
          <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
            {title}
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-3">
            {message}
          </Text>
        </View>

        {/* Error message */}
        {__DEV__ && (
          <View className="bg-gray-100 p-3 rounded-lg mb-4">
            <Text className="text-xs font-mono text-error">
              {error.message}
            </Text>
          </View>
        )}

        <Button
          variant="primary"
          size="medium"
          onPress={resetError}
          fullWidth
        >
          Try Again
        </Button>
      </Card>
    </View>
  );
};

/**
 * Inline error display for list items and small sections
 */
export const InlineError: React.FC<{
  error: Error;
  onRetry?: () => void;
  compact?: boolean;
}> = ({ error, onRetry, compact = false }) => {
  return (
    <View className={compact ? 'p-3' : 'p-4'}>
      <View className="bg-error/10 border border-error/20 rounded-lg p-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="warning-outline" size={20} color="#dc2626" />
          <Text className="text-sm font-semibold text-error flex-1 ml-2">
            Error loading data
          </Text>
        </View>
        
        {__DEV__ && (
          <Text className="text-xs text-gray-600 mb-3 font-mono">
            {error.message}
          </Text>
        )}

        {onRetry && (
          <Button
            variant="outline"
            size="small"
            onPress={onRetry}
          >
            Retry
          </Button>
        )}
      </View>
    </View>
  );
};

/**
 * Network error specific fallback
 */
export const NetworkErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => {
  const isNetworkError = 
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('timeout') ||
    error.message.includes('offline');

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center px-6">
      <Card variant="outlined" padding="large" className="w-full">
        <View className="items-center mb-4">
          <Ionicons 
            name={isNetworkError ? 'cloud-offline-outline' : 'alert-circle-outline'} 
            size={56} 
            color="#6b7280" 
          />
          <Text className="text-xl font-semibold text-gray-900 mb-2 text-center mt-3">
            {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-3">
            {isNetworkError 
              ? 'Please check your internet connection and try again.'
              : 'An unexpected error occurred. Please try again.'
            }
          </Text>
        </View>

        {__DEV__ && (
          <View className="bg-gray-100 p-3 rounded-lg mb-4">
            <Text className="text-xs font-mono text-error">
              {error.message}
            </Text>
          </View>
        )}

        <View className="space-y-2">
          <Button
            variant="primary"
            size="medium"
            onPress={resetError}
            fullWidth
          >
            Try Again
          </Button>
        </View>
      </Card>
    </View>
  );
};
