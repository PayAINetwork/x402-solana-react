import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PaymentButtonProps } from '@/types';
import { cn } from '@/lib/utils';

export const PaymentButton = React.forwardRef<
  HTMLButtonElement,
  PaymentButtonProps
>(
  (
    {
      amount,
      description,
      onClick,
      disabled = false,
      loading = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const formatAmount = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(value);
    };

    return (
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'w-full bg-solana-gradient hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all',
          className
        )}
        style={style}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner size="sm" variant="solana" />
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Pay {formatAmount(amount)}</span>
          </div>
        )}
      </Button>
    );
  }
);

PaymentButton.displayName = 'PaymentButton';
