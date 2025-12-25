import React, { useRef, useState } from 'react';
import { Modal, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface InAppBrowserProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  onNavigationStateChange?: (url: string) => void;
}

export const InAppBrowser: React.FC<InAppBrowserProps> = ({
  visible,
  url,
  onClose,
  onNavigationStateChange,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setLoading(navState.loading);

    console.log('🌐 WebView navigation:', navState.url);

    // Check if URL is a deep link back to the app
    if (navState.url.includes('lazordemo://') || navState.url.includes('exp+lazor-kit-rn-demo://')) {
      console.log('🔗 Deep link detected in WebView, closing browser');
      
      // Open the deep link
      Linking.openURL(navState.url).catch((err) => {
        console.error('Failed to open deep link:', err);
      });
      
      // Close the browser
      onClose();
      
      // Call custom callback if provided
      if (onNavigationStateChange) {
        onNavigationStateChange(navState.url);
      }
      
      return;
    }
  };

  const goBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const goForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const reload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: 12,
          backgroundColor: '#f3f4f6',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}>
          {/* Close Button */}
          <TouchableOpacity 
            onPress={onClose}
            style={{ 
              padding: 8,
              marginRight: 8,
            }}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>

          {/* URL Bar */}
          <View style={{ 
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginRight: 8,
          }}>
            <Text 
              numberOfLines={1} 
              style={{ 
                fontSize: 14,
                color: '#6b7280',
              }}
            >
              {currentUrl}
            </Text>
          </View>

          {/* Navigation Buttons */}
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <TouchableOpacity 
              onPress={goBack}
              disabled={!canGoBack}
              style={{ padding: 8 }}
            >
              <Ionicons 
                name="arrow-back" 
                size={20} 
                color={canGoBack ? '#374151' : '#d1d5db'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={goForward}
              disabled={!canGoForward}
              style={{ padding: 8 }}
            >
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={canGoForward ? '#374151' : '#d1d5db'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={reload}
              style={{ padding: 8 }}
            >
              <Ionicons name="reload" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
          }}
          style={{ flex: 1 }}
          // Allow camera access for QR scanning if needed
          mediaPlaybackRequiresUserAction={false}
          // Enable JavaScript (required for portal)
          javaScriptEnabled={true}
          // Enable DOM storage
          domStorageEnabled={true}
          // Allow third-party cookies (for auth)
          thirdPartyCookiesEnabled={true}
          // Additional security settings
          allowsInlineMediaPlayback={true}
          startInLoadingState={true}
        />
      </SafeAreaView>
    </Modal>
  );
};
