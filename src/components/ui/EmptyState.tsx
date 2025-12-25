import * as React from 'react';
import { Text } from 'react-native';
import { MotiView } from 'moti';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      className={`items-center justify-center py-12 px-6 ${className || ''}`}
    >
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-gray-600 text-center mb-6 max-w-sm">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction} variant="primary" size="medium">
          {actionLabel}
        </Button>
      )}
    </MotiView>
  );
};
