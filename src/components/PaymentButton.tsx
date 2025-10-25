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
          'w-full bg-solana-gradient hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-xl',
          disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
          className
        )}
        style={style}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Spinner size="sm" variant="default" className="border-white/30 border-t-white" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8.5 16L12 13.5 15.5 16 12 18.5 8.5 16z"/>
            </svg>
            <span>Pay {formatAmount(amount)} USDC</span>
          </div>
        )}
      </Button>
    );
  }
);

PaymentButton.displayName = 'PaymentButton';
