// Transaction types
export type TransactionType = 'send' | 'receive' | 'unknown';
export type TransactionStatus = 'confirmed' | 'failed' | 'pending';

export interface ParsedTransaction {
  signature: string;
  blockTime: number | null;
  slot: number;
  type: TransactionType;
  amount: number;
  mint: string; // Native SOL or SPL token mint
  symbol: string;
  decimals: number;
  from: string;
  to: string;
  status: TransactionStatus;
  fee: number;
  err: any;
}

export interface SolanaTransaction {
  signature: string;
  blockTime: number | null;
  slot: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
  err: any;
  memo: string | null;
  transaction: {
    message: {
      accountKeys: Array<{ pubkey: string; signer: boolean; writable: boolean }>;
      instructions: any[];
      recentBlockhash: string;
    };
    signatures: string[];
  };
  meta: {
    err: any;
    fee: number;
    preBalances: number[];
    postBalances: number[];
    preTokenBalances?: any[];
    postTokenBalances?: any[];
  };
}

export interface AddressBookEntry {
  id: string;
  address: string;
  label: string;
  createdAt: number;
  lastUsed?: number;
}
