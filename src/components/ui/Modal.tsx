import React from 'react';
import { View, Text, Modal as RNModal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { MotiView } from 'moti';
import { AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  height?: 'auto' | 'half' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  height = 'auto',
}) => {
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const getHeightClass = () => {
    switch (height) {
      case 'half':
        return 'h-1/2';
      case 'full':
        return 'h-full';
      case 'auto':
      default:
        return '';
    }
  };

  const getContentClass = () => {
    switch (height) {
      case 'half':
      case 'full':
        return 'flex-1';
      case 'auto':
      default:
        return '';
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end">
          {/* Backdrop */}
          <AnimatePresence>
            {visible && (
              <Pressable onPress={handleClose} className="absolute inset-0">
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  className="flex-1 bg-black/50"
                />
              </Pressable>
            )}
          </AnimatePresence>

          {/* Bottom Sheet */}
          <AnimatePresence>
            {visible && (
              <MotiView
                from={{ translateY: 500 }}
                animate={{ translateY: 0 }}
                exit={{ translateY: 500 }}
                transition={{
                  type: 'timing',
                  duration: 300,
                }}
                className={`bg-white rounded-t-3xl ${getHeightClass()}`}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                  {title && (
                    <Text className="text-xl font-bold text-gray-900 flex-1">
                      {title}
                    </Text>
                  )}
                  {showCloseButton && (
                    <Pressable onPress={handleClose} className="p-2">
                      <Ionicons name="close" size={24} color="#374151" />
                    </Pressable>
                  )}
                </View>

                {/* Content - Let parent handle scrolling */}
                <View className={`px-4 py-2 pb-6 ${getContentClass()}`}>
                  {children}
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};
