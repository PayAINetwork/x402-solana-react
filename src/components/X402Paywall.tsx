import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentButton } from './PaymentButton';
import { PaymentStatus } from './PaymentStatus';
import { WalletSection } from './WalletSection';
import { useX402Payment } from '@/hooks/useX402Payment';
import { X402PaywallProps } from '@/types';
import { cn } from '@/lib/utils';

export const X402Paywall: React.FC<X402PaywallProps> = ({
  amount,
  description,
  wallet,
  network = 'solana-devnet',
  treasuryAddress,
  facilitatorUrl,
  theme = 'solana',
  showBalance = true,
  showNetworkInfo = true,
  showPaymentDetails = true,
  classNames,
  customStyles,
  maxPaymentAmount,
  // enablePaymentCaching = false, // TODO: Implement in future
  // autoRetry = false, // TODO: Implement in future
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
  onWalletConnect,
  children,
}) => {
  const [isPaid, setIsPaid] = useState(false);
  const walletBalance = '0.00'; // TODO: Fetch real balance

  const { pay, isLoading, status, error, transactionId } = useX402Payment({
    wallet,
    network,
    treasuryAddress,
    facilitatorUrl,
    maxPaymentAmount,
  });

  // Notify when wallet connects
  useEffect(() => {
    const walletAddress = wallet.publicKey?.toString() || wallet.address;
    if (walletAddress && onWalletConnect) {
      onWalletConnect(walletAddress);
    }
  }, [wallet, onWalletConnect]);

  // Handle payment success
  useEffect(() => {
    if (status === 'success' && transactionId) {
      setIsPaid(true);
      onPaymentSuccess?.(transactionId);
    }
  }, [status, transactionId, onPaymentSuccess]);

  // Handle payment error
  useEffect(() => {
    if (error) {
      onPaymentError?.(error);
    }
  }, [error, onPaymentError]);

  const handlePayment = async () => {
    onPaymentStart?.();
    await pay(amount, description);
  };

  // If payment is successful, show the protected content
  if (isPaid) {
    return <>{children}</>;
  }

  // Theme-based container classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'solana':
        return 'border-solana-primary/20';
      case 'dark':
        return 'bg-card';
      case 'light':
        return 'bg-background';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn('flex items-center justify-center min-h-screen p-4', classNames?.container)}
      style={customStyles?.container}
    >
      <Card
        className={cn('w-full max-w-md', getThemeClasses(), classNames?.card)}
        style={customStyles?.card}
      >
        <CardHeader className="text-center">
          <CardTitle className={cn('text-2xl font-bold', classNames?.text)} style={customStyles?.text}>
            Payment Required
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Wallet Info */}
          <WalletSection
            wallet={wallet}
            balance={showBalance ? walletBalance : undefined}
            network={showNetworkInfo ? network : undefined}
            showBalance={showBalance}
          />

          {/* Payment Details */}
          {showPaymentDetails && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-lg font-bold">${amount.toFixed(2)} USDC</span>
                </div>
                {maxPaymentAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Maximum</span>
                    <span className="text-xs">${maxPaymentAmount.toFixed(2)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Status */}
          {status !== 'idle' && (
            <PaymentStatus
              status={status}
              message={error?.message}
              className={classNames?.status}
              style={customStyles?.status}
            />
          )}

          {/* Payment Button */}
          <PaymentButton
            amount={amount}
            description={description}
            onClick={handlePayment}
            loading={isLoading}
            disabled={isLoading}
            className={classNames?.button}
            style={customStyles?.button}
          />

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center">
              {error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

X402Paywall.displayName = 'X402Paywall';
