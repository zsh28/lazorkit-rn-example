// Animation Timing Configuration (for Moti)
export const ANIMATION = {
  // Duration presets (in ms)
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  // Easing presets
  easing: {
    linear: 'linear' as const,
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  },
  
  // Common animation configs
  fadeIn: {
    from: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { type: 'timing' as const, duration: 300 },
  },
  
  fadeOut: {
    from: { opacity: 1 },
    animate: { opacity: 0 },
    transition: { type: 'timing' as const, duration: 300 },
  },
  
  slideUp: {
    from: { opacity: 0, translateY: 20 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'timing' as const, duration: 300 },
  },
  
  slideDown: {
    from: { opacity: 0, translateY: -20 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'timing' as const, duration: 300 },
  },
  
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring' as const, damping: 15 },
  },
  
  // Toast animation
  toastSlideDown: {
    from: { opacity: 0, translateY: -100 },
    animate: { opacity: 1, translateY: 0 },
    exit: { opacity: 0, translateY: -100 },
    transition: { type: 'spring' as const, damping: 20 },
  },
  
  // Button press
  buttonPress: {
    from: { scale: 1 },
    animate: { scale: 0.95 },
    transition: { type: 'timing' as const, duration: 100 },
  },
};

// Haptic Feedback Types
export const HAPTICS = {
  light: 'light' as const,
  medium: 'medium' as const,
  heavy: 'heavy' as const,
  success: 'notificationSuccess' as const,
  warning: 'notificationWarning' as const,
  error: 'notificationError' as const,
};
