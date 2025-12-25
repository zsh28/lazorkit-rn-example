import * as React from 'react';
import { View, DimensionValue } from 'react-native';
import { MotiView } from 'moti';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className,
}) => {
  return (
    <View
      style={{ width, height, borderRadius }}
      className={`bg-gray-200 overflow-hidden ${className || ''}`}
    >
      <MotiView
        from={{ translateX: -300 }}
        animate={{ translateX: 300 }}
        transition={{
          type: 'timing',
          duration: 1500,
          loop: true,
        }}
        style={{ width: 300, height: '100%', opacity: 0.5 }}
        className="absolute inset-0 bg-white"
      />
    </View>
  );
};

// Pre-built skeleton components
export const SkeletonCard: React.FC = () => (
  <View className="p-4 bg-white rounded-xl mb-2">
    <Skeleton width="60%" height={16} className="mb-2" />
    <Skeleton width="40%" height={12} />
  </View>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);
