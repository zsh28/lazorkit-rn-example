// Wallet and account types
export interface WalletAccount {
  address: string;
  publicKey: string;
}

export interface WalletBalance {
  sol: number; // Native SOL balance
  usd?: number; // Optional USD value (we won't use this per requirements)
}

export interface LazorContextValue {
  wallet: WalletAccount | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: any) => Promise<string>;
}
