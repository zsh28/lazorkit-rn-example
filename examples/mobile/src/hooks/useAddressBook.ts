import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAddressBook,
  addAddressBookEntry,
  updateAddressBookEntry,
  deleteAddressBookEntry,
  markAddressAsUsed,
  getRecentAddresses,
} from '../services/storage/addressBook';
import { AddressBookEntry } from '../types/transaction';
import { useToast } from '../providers/ToastProvider';

/**
 * Hook to manage address book
 */
export function useAddressBook() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Query to get all address book entries
  const query = useQuery({
    queryKey: ['address-book'],
    queryFn: getAddressBook,
    staleTime: 60000, // 1 minute
  });

  // Mutation to add an entry
  const addMutation = useMutation({
    mutationFn: ({ address, label }: { address: string; label: string }) =>
      addAddressBookEntry(address, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address-book'] });
      showToast('Address saved', 'success');
    },
    onError: (error) => {
      console.error('Error adding address:', error);
      showToast('Failed to save address', 'error');
    },
  });

  // Mutation to update an entry
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<AddressBookEntry, 'id'>>;
    }) => updateAddressBookEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address-book'] });
      showToast('Address updated', 'success');
    },
    onError: (error) => {
      console.error('Error updating address:', error);
      showToast('Failed to update address', 'error');
    },
  });

  // Mutation to delete an entry
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddressBookEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address-book'] });
      showToast('Address deleted', 'success');
    },
    onError: (error) => {
      console.error('Error deleting address:', error);
      showToast('Failed to delete address', 'error');
    },
  });

  // Mutation to mark address as used
  const markAsUsedMutation = useMutation({
    mutationFn: (address: string) => markAddressAsUsed(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address-book'] });
    },
    onError: (error) => {
      console.error('Error marking address as used:', error);
    },
  });

  return {
    entries: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addEntry: addMutation.mutate,
    updateEntry: updateMutation.mutate,
    deleteEntry: deleteMutation.mutate,
    markAsUsed: markAsUsedMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook to get recent addresses
 */
export function useRecentAddresses(limit: number = 5) {
  return useQuery({
    queryKey: ['recent-addresses', limit],
    queryFn: () => getRecentAddresses(limit),
    staleTime: 30000, // 30 seconds
  });
}
