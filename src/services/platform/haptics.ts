import * as Haptics from 'expo-haptics';

/**
 * Haptics Service
 * 
 * Centralized haptic feedback service for consistent tactile feedback across the app.
 * 
 * @example
 * ```typescript
 * import { haptics } from '@/services/platform/haptics';
 * 
 * // Button tap
 * haptics.light();
 * 
 * // Important action
 * haptics.medium();
 * 
 * // Delete action
 * haptics.heavy();
 * 
 * // Success feedback
 * haptics.success();
 * 
 * // Error feedback
 * haptics.error();
 * ```
 */
export class HapticService {
  /**
   * Light impact - for subtle interactions like button taps
   */
  async light(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail if haptics not supported
      console.warn('Haptics not supported', error);
    }
  }

  /**
   * Medium impact - for standard interactions
   */
  async medium(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptics not supported', error);
    }
  }

  /**
   * Heavy impact - for important interactions like delete or submit
   */
  async heavy(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptics not supported', error);
    }
  }

  /**
   * Success notification - for successful actions
   */
  async success(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptics not supported', error);
    }
  }

  /**
   * Warning notification - for warning messages
   */
  async warning(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptics not supported', error);
    }
  }

  /**
   * Error notification - for error messages
   */
  async error(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptics not supported', error);
    }
  }

  /**
   * Selection feedback - for picker or selection changes
   */
  async selection(): Promise<void> {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptics not supported', error);
    }
  }
}

/**
 * Singleton haptic service instance
 */
export const haptics = new HapticService();
