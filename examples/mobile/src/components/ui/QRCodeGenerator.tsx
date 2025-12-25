import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-qr-code';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  backgroundColor = '#ffffff',
  color = '#000000',
}) => {
  // Don't render QR code if value is empty or invalid
  if (!value || value.trim().length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { width: size + 32, height: size + 32 }]}>
        <Text style={styles.emptyText}>No address available</Text>
      </View>
    );
  }

  // Wrap QR code generation in error boundary
  try {
    return (
      <View style={[styles.container, styles.qrContainer]}>
        <QRCode
          value={value}
          size={size}
          bgColor={backgroundColor}
          fgColor={color}
          level="M"
        />
      </View>
    );
  } catch (error) {
    console.error('QR Code generation error:', error);
    return (
      <View style={[styles.container, styles.emptyContainer, { width: size + 32, height: size + 32 }]}>
        <Text style={styles.emptyText}>Unable to generate QR code</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  qrContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyContainer: {
    backgroundColor: '#f3f4f6',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
