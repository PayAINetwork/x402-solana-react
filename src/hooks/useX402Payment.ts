import { useState, useCallback } from 'react';
import { createX402Client } from 'x402-solana/client';
import { WalletAdapter, SolanaNetwork, PaymentStatus } from '@/types';

export interface PaymentConfig {
  wallet: WalletAdapter;
  network: SolanaNetwork;
  rpcUrl?: string;
  treasuryAddress?: string;
  facilitatorUrl?: string;
  maxPaymentAmount?: number;
}

export interface PaymentResult {
  transactionId: string | null;
  status: PaymentStatus;
  error: Error | null;
}

export interface UseX402PaymentReturn {
  pay: (amount: number, description: string) => Promise<string | null>;
  isLoading: boolean;
  status: PaymentStatus;
  error: Error | null;
  transactionId: string | null;
  reset: () => void;
}

/**
 * Hook for managing x402 payments on Solana
 */
export function useX402Payment(config: PaymentConfig): UseX402PaymentReturn {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setTransactionId(null);
    setIsLoading(false);
  }, []);

  const pay = useCallback(
    async (amount: number, description: string): Promise<string | null> => {
      try {
        setIsLoading(true);
        setStatus('pending');
        setError(null);

        // Validate amount against max if set
        if (config.maxPaymentAmount && amount > config.maxPaymentAmount) {
          throw new Error(
            `Payment amount ${amount} exceeds maximum allowed ${config.maxPaymentAmount}`
          );
        }

        // Get wallet address
        const walletAddress =
          config.wallet.publicKey?.toString() || config.wallet.address;

        if (!walletAddress) {
          throw new Error('Wallet not connected');
        }

        // Convert amount to micro-USDC (6 decimals)
        const microUsdcAmount = BigInt(Math.floor(amount * 1_000_000));

        // Create x402 client with real implementation
        // TODO: Use x402Client.fetch() with actual API endpoint
        createX402Client({
          wallet: config.wallet,
          network: config.network,
          rpcUrl: config.rpcUrl,
          maxPaymentAmount: config.maxPaymentAmount
            ? BigInt(Math.floor(config.maxPaymentAmount * 1_000_000))
            : undefined,
        });

        // Make a mock API call that would return 402
        // In real usage, this would be the actual API endpoint
        // For now, we'll just validate the setup
        console.log('x402 payment initiated:', {
          amount: microUsdcAmount.toString(),
          description,
          wallet: walletAddress,
          network: config.network,
        });

        // TODO: This needs actual API endpoint to test against
        // For now, simulate success
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const txId = `tx_${Date.now()}`;
        setTransactionId(txId);
        setStatus('success');
        setIsLoading(false);

        return txId;
      } catch (err) {
        const paymentError =
          err instanceof Error ? err : new Error('Payment failed');
        setError(paymentError);
        setStatus('error');
        setIsLoading(false);
        return null;
      }
    },
    [config]
  );

  return {
    pay,
    isLoading,
    status,
    error,
    transactionId,
    reset,
  };
}
