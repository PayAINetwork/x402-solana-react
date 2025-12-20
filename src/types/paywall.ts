import { ReactNode } from 'react';
import { VersionedTransaction } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ComponentClassNames, ComponentStyles, ThemePreset } from './theme';

/**
 * Solana network types
 */
export type SolanaNetwork = 'solana' | 'solana-devnet';

/**
 * Wallet adapter interface - compatible with major Solana wallets
 */
export interface WalletAdapter {
  publicKey?: { toString(): string };
  address?: string;
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}

/**
 * Payment status states
 */
export type PaymentStatus = 'idle' | 'connecting' | 'pending' | 'success' | 'error';

/**
 * Main X402Paywall component props
 */
export interface X402PaywallProps {
  // Core payment configuration
  amount: number;
  description: string;
  wallet?: WalletAdapter; // Optional - will use useWallet() if not provided
  network?: SolanaNetwork;
  rpcUrl?: string;
  apiEndpoint?: string;
  facilitatorUrl?: string;

  // Auto-setup wallet providers (only used if providers don't exist)
  autoSetupProviders?: boolean; // Default: true - automatically set up providers if missing
  providerNetwork?: WalletAdapterNetwork; // Network for auto-setup providers
  providerEndpoint?: string; // Custom endpoint for auto-setup providers

  // UI Configuration
  theme?: ThemePreset;
  logoUrl?: string; // Custom logo URL or path (defaults to Solana logo)
  showBalance?: boolean;
  showNetworkInfo?: boolean;
  showPaymentDetails?: boolean;
  onDisconnect?: () => void;

  // Styling Options
  classNames?: ComponentClassNames;
  customStyles?: ComponentStyles;

  // Behavior
  maxPaymentAmount?: number;
  enablePaymentCaching?: boolean;
  autoRetry?: boolean;

  // Callbacks
  onPaymentStart?: () => void;
  /** Called when payment succeeds. Receives transaction ID and optional response content from server. */
  onPaymentSuccess?: (transactionId: string, responseContent?: string | null) => void;
  onPaymentError?: (error: Error) => void;
  onWalletConnect?: (publicKey: string) => void;

  // Content
  children: ReactNode;
}

/**
 * Payment button component props
 */
export interface PaymentButtonProps {
  amount: number;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  customText?: string;
}

/**
 * Payment status component props
 */
export interface PaymentStatusProps {
  status: PaymentStatus;
  message?: string;
  progress?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wallet section component props
 */
export interface WalletSectionProps {
  wallet?: WalletAdapter;
  balance?: string;
  network?: SolanaNetwork;
  showBalance?: boolean;
  onDisconnect?: () => void;
  theme?: ThemePreset;
  className?: string;
  style?: React.CSSProperties;
}
