import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and handle React errors gracefully
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 * 
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => <CustomError error={error} onReset={reset} />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = __DEV__ } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError);
      }

      // Default error UI
      return (
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <Card variant="outlined" padding="large" className="w-full">
            <View className="items-center mb-6">
              <Text className="text-6xl mb-4">⚠️</Text>
              <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Something went wrong
              </Text>
              <Text className="text-base text-gray-600 text-center mb-4">
                We're sorry for the inconvenience. The app encountered an unexpected error.
              </Text>
            </View>

            {/* Error Details (only in dev mode or if showDetails is true) */}
            {showDetails && (
              <ScrollView className="mb-4 max-h-48 bg-gray-100 p-3 rounded-lg">
                <Text className="text-xs font-mono text-error mb-2 font-semibold">
                  {error.name}: {error.message}
                </Text>
                {error.stack && (
                  <Text className="text-xs font-mono text-gray-600">
                    {error.stack}
                  </Text>
                )}
                {errorInfo?.componentStack && (
                  <View className="mt-3">
                    <Text className="text-xs font-mono text-gray-700 font-semibold mb-1">
                      Component Stack:
                    </Text>
                    <Text className="text-xs font-mono text-gray-600">
                      {errorInfo.componentStack}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Action Buttons */}
            <View className="space-y-2">
              <Button
                variant="primary"
                size="medium"
                onPress={this.resetError}
                fullWidth
              >
                Try Again
              </Button>
              
              {showDetails && (
                <Button
                  variant="outline"
                  size="medium"
                  onPress={() => {
                    // Copy error to clipboard for debugging
                    const errorText = `${error.name}: ${error.message}\n\nStack:\n${error.stack}`;
                    console.log('Error details:', errorText);
                  }}
                  fullWidth
                >
                  Copy Error Details
                </Button>
              )}
            </View>
          </Card>
        </View>
      );
    }

    return children;
  }
}

/**
 * Hook version of ErrorBoundary for functional components
 * Note: This is a wrapper that uses the class-based ErrorBoundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};
