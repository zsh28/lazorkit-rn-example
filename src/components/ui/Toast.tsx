import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { useToast } from '../../providers/ToastProvider';
import { ToastType } from '../../types/toast';

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <SafeAreaView className="absolute bottom-0 left-0 right-0 items-center z-[9999] pb-8" pointerEvents="box-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
          />
        ))}
      </AnimatePresence>
    </SafeAreaView>
  );
};

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ message, type }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10b981'; // success color
      case 'error':
        return '#ef4444'; // error color
      case 'info':
        return '#3b82f6'; // info/primary color
      default:
        return '#3b82f6';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <MotiView
      from={{
        opacity: 0,
        translateY: 100,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
      }}
      exit={{
        opacity: 0,
        translateY: 100,
      }}
      transition={{
        type: 'timing',
        duration: 250,
      }}
      style={{ backgroundColor: getBackgroundColor() }}
      className="flex-row items-center mx-4 mb-2 py-3 px-4 rounded-lg max-w-[90%] min-w-[280px] shadow-lg"
    >
      <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center mr-2">
        <Text className="text-sm text-white font-bold">{getIcon()}</Text>
      </View>
      <Text className="flex-1 text-base text-white font-medium" numberOfLines={2}>
        {message}
      </Text>
    </MotiView>
  );
};
