import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useHaptics } from './useHaptics';
import { logger } from '../services/logger';

/**
 * Hook for navigation with haptic feedback and logging
 * 
 * Provides navigation methods with built-in haptic feedback and analytics logging.
 * 
 * @returns Navigation methods
 * 
 * @example
 * ```typescript
 * const { goBack, navigate, replace } = useNavigationWithFeedback();
 * 
 * const handlePress = () => {
 *   navigate('/dashboard');
 * };
 * 
 * const handleBack = () => {
 *   goBack();
 * };
 * ```
 */
export function useNavigationWithFeedback() {
  const router = useRouter();
  const { light } = useHaptics();

  /**
   * Navigate back with haptic feedback
   */
  const goBack = useCallback(() => {
    light();
    logger.navigation('back');
    router.back();
  }, [router, light]);

  /**
   * Navigate to a new screen with haptic feedback
   */
  const navigate = useCallback((path: string) => {
    light();
    logger.navigation(path);
    router.push(path);
  }, [router, light]);

  /**
   * Replace current screen with haptic feedback
   */
  const replace = useCallback((path: string) => {
    light();
    logger.navigation(path, { action: 'replace' });
    router.replace(path);
  }, [router, light]);

  /**
   * Navigate without haptic feedback (for programmatic navigation)
   */
  const navigateSilent = useCallback((path: string) => {
    logger.navigation(path, { silent: true });
    router.push(path);
  }, [router]);

  /**
   * Go back without haptic feedback
   */
  const goBackSilent = useCallback(() => {
    logger.navigation('back', { silent: true });
    router.back();
  }, [router]);

  return {
    goBack,
    navigate,
    replace,
    navigateSilent,
    goBackSilent,
  };
}
