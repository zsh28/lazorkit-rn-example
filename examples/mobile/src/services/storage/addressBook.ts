import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddressBookEntry } from '../../types/transaction';

const ADDRESS_BOOK_KEY = 'address_book';

/**
 * Get all address book entries
 */
export async function getAddressBook(): Promise<AddressBookEntry[]> {
  try {
    const data = await AsyncStorage.getItem(ADDRESS_BOOK_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting address book:', error);
    return [];
  }
}

/**
 * Add a new address book entry
 */
export async function addAddressBookEntry(
  address: string,
  label: string
): Promise<void> {
  try {
    const entries = await getAddressBook();
    
    // Check if address already exists
    const existingIndex = entries.findIndex(e => e.address === address);
    
    if (existingIndex !== -1) {
      // Update existing entry
      entries[existingIndex] = {
        ...entries[existingIndex],
        label,
        lastUsed: Date.now(),
      };
    } else {
      // Add new entry
      const newEntry: AddressBookEntry = {
        id: Math.random().toString(36).substring(7),
        address,
        label,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };
      entries.push(newEntry);
    }
    
    await AsyncStorage.setItem(ADDRESS_BOOK_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error adding address book entry:', error);
    throw error;
  }
}

/**
 * Update an address book entry
 */
export async function updateAddressBookEntry(
  id: string,
  updates: Partial<Omit<AddressBookEntry, 'id'>>
): Promise<void> {
  try {
    const entries = await getAddressBook();
    const index = entries.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error('Address book entry not found');
    }
    
    entries[index] = { ...entries[index], ...updates };
    await AsyncStorage.setItem(ADDRESS_BOOK_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error updating address book entry:', error);
    throw error;
  }
}

/**
 * Delete an address book entry
 */
export async function deleteAddressBookEntry(id: string): Promise<void> {
  try {
    const entries = await getAddressBook();
    const filtered = entries.filter(e => e.id !== id);
    await AsyncStorage.setItem(ADDRESS_BOOK_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting address book entry:', error);
    throw error;
  }
}

/**
 * Mark an address as recently used
 */
export async function markAddressAsUsed(address: string): Promise<void> {
  try {
    const entries = await getAddressBook();
    const index = entries.findIndex(e => e.address === address);
    
    if (index !== -1) {
      entries[index].lastUsed = Date.now();
      await AsyncStorage.setItem(ADDRESS_BOOK_KEY, JSON.stringify(entries));
    }
  } catch (error) {
    console.error('Error marking address as used:', error);
  }
}

/**
 * Get recently used addresses (sorted by lastUsed)
 */
export async function getRecentAddresses(limit: number = 5): Promise<AddressBookEntry[]> {
  try {
    const entries = await getAddressBook();
    return entries
      .filter(e => e.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent addresses:', error);
    return [];
  }
}
