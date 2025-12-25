/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log metadata interface
 */
export interface LogMetadata {
  userId?: string;
  screen?: string;
  action?: string;
  component?: string;
  [key: string]: any;
}

/**
 * Logger Service
 * 
 * Centralized logging service that handles console logging in development
 * and can be extended to send logs to analytics services in production.
 * 
 * @example
 * ```typescript
 * import { logger } from '@/services/logger';
 * 
 * // Basic logging
 * logger.info('User logged in');
 * logger.error('Transaction failed', error);
 * 
 * // With metadata
 * logger.info('Button clicked', { screen: 'Dashboard', action: 'send' });
 * 
 * // Transaction logging
 * logger.transaction('send', { amount: 1.5, token: 'SOL' });
 * ```
 */
export class Logger {
  private enabled: boolean = __DEV__;

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (!this.enabled) return;
    console.log(`🔍 ${message}`, metadata ? metadata : '');
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: LogMetadata): void {
    if (!this.enabled) return;
    console.log(`ℹ️  ${message}`, metadata ? metadata : '');
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: LogMetadata): void {
    console.warn(`⚠️  ${message}`, metadata ? metadata : '');
    // TODO: Send to analytics service in production
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | any, metadata?: LogMetadata): void {
    console.error(`❌ ${message}`, error, metadata ? metadata : '');
    // TODO: Send to error tracking service (Sentry, Crashlytics)
  }

  /**
   * Log a transaction event
   */
  transaction(txType: 'send' | 'receive' | 'swap' | 'stake', metadata: LogMetadata): void {
    this.info(`Transaction: ${txType}`, metadata);
    // TODO: Send to analytics service
  }

  /**
   * Log a navigation event
   */
  navigation(screen: string, metadata?: LogMetadata): void {
    this.info(`Navigation to ${screen}`, { screen, ...metadata });
    // TODO: Send to analytics service
  }

  /**
   * Log a user action
   */
  action(action: string, metadata?: LogMetadata): void {
    this.info(`Action: ${action}`, metadata);
    // TODO: Send to analytics service
  }

  /**
   * Log a deep link event
   */
  deepLink(url: string, metadata?: LogMetadata): void {
    this.info(`Deep link: ${url}`, { url, ...metadata });
    // TODO: Send to analytics service
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
