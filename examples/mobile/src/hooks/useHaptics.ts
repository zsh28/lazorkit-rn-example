import { useCallback } from 'react';
import { haptics } from '../services/platform/haptics';

/**
 * Hook for haptic feedback
 * 
 * Provides easy access to haptic feedback methods throughout the app.
 * 
 * @returns HapticService methods
 * 
 * @example
 * ```typescript
 * const { light, medium, heavy, success, error } = useHaptics();
 * 
 * const handlePress = () => {
 *   light();
 *   // ... button action
 * };
 * ```
 */
export function useHaptics() {
  const light = useCallback(() => haptics.light(), []);
  const medium = useCallback(() => haptics.medium(), []);
  const heavy = useCallback(() => haptics.heavy(), []);
  const success = useCallback(() => haptics.success(), []);
  const warning = useCallback(() => haptics.warning(), []);
  const error = useCallback(() => haptics.error(), []);
  const selection = useCallback(() => haptics.selection(), []);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
  };
}
