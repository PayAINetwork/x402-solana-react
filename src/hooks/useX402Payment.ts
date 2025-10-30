import { useState, useCallback } from 'react';
import { createX402Client } from 'x402-solana/client';
import { WalletAdapter, SolanaNetwork, PaymentStatus } from '@/types';

export interface PaymentConfig {
  wallet: WalletAdapter;
  network: SolanaNetwork;
  rpcUrl?: string;
  apiEndpoint?: string;
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

        // Create x402 client
        const x402Client = createX402Client({
          wallet: config.wallet,
          network: config.network,
          rpcUrl: config.rpcUrl,
          maxPaymentAmount: config.maxPaymentAmount
            ? BigInt(Math.floor(config.maxPaymentAmount * 1_000_000))
            : undefined,
        });

        // Determine API endpoint
        // Default to PayAI Echo Merchant (free test endpoint that refunds payments)
        // Users can override with their own 402-protected endpoint
        const defaultEndpoint = 'https://x402.payai.network/api/solana/paid-content';
        const apiEndpoint = config.apiEndpoint || defaultEndpoint;
        const isEchoMerchant = apiEndpoint === defaultEndpoint;

        console.log('Initiating x402 payment:', {
          endpoint: apiEndpoint,
          isDemo: isEchoMerchant,
          amount,
          description,
          wallet: walletAddress,
          network: config.network,
        });

        // Make the 402-protected request
        // x402Client.fetch() automatically handles the full payment flow:
        // 1. Makes initial request → receives 402 with payment requirements
        // 2. Creates and signs payment transaction
        // 3. Retries with X-PAYMENT header containing signed payment
        // 4. Merchant verifies, settles, and fulfills the request
        const response = await x402Client.fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: description,
            amount,
          }),
        });

        if (!response.ok) {
          throw new Error(`Payment request failed: ${response.statusText}`);
        }

        // Try to parse as JSON, but handle HTML responses gracefully
        let result;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          // For HTML or other content types, just get the text
          const text = await response.text();
          result = { content: text };
        }
        console.log('Payment successful:', result);

        // Extract transaction ID from response
        const paymentResponse = response.headers.get('X-PAYMENT-RESPONSE');
        let txId = `tx_${Date.now()}`;

        if (paymentResponse) {
          try {
            const decoded = JSON.parse(atob(paymentResponse));
            txId = decoded.transactionId || decoded.signature || txId;
            console.log('Payment details:', decoded);
          } catch (e) {
            console.warn('Could not decode payment response:', e);
          }
        }

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
