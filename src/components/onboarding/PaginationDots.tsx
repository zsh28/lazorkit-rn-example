import * as React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

interface PaginationDotsProps {
  count: number;
  activeIndex: number;
  className?: string;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  count,
  activeIndex,
  className,
}) => {
  return (
    <View className={`flex-row items-center justify-center ${className || ''}`}>
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        
        return (
          <MotiView
            key={index}
            animate={{
              width: isActive ? 24 : 8,
              backgroundColor: isActive ? '#2563eb' : '#d1d5db',
            }}
            transition={{
              type: 'timing',
              duration: 300,
            }}
            className="h-2 rounded-full mx-1"
          />
        );
      })}
    </View>
  );
};
