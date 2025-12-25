import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ACTIVITY_KEY = '@lazor_wallet:last_activity';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Update the last activity timestamp to current time
 */
export async function updateLastActivity(): Promise<void> {
  const timestamp = Date.now().toString();
  await AsyncStorage.setItem(LAST_ACTIVITY_KEY, timestamp);
}

/**
 * Get the last activity timestamp
 */
export async function getLastActivity(): Promise<number | null> {
  const timestamp = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
  return timestamp ? parseInt(timestamp, 10) : null;
}

/**
 * Check if the session has expired (more than 24 hours since last activity)
 */
export async function isSessionExpired(): Promise<boolean> {
  const lastActivity = await getLastActivity();
  
  if (!lastActivity) {
    return false; // No previous activity, not expired
  }
  
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;
  
  return timeSinceLastActivity > SESSION_DURATION;
}

/**
 * Clear the last activity timestamp (used on logout)
 */
export async function clearLastActivity(): Promise<void> {
  await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
}
