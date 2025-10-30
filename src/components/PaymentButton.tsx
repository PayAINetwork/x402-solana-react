import * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PaymentButtonProps } from "@/types";
import { cn } from "@/lib/utils";

export const PaymentButton = React.forwardRef<
  HTMLButtonElement,
  PaymentButtonProps
>(
  (
    {
      amount,
      description: _description,
      onClick,
      disabled = false,
      loading = false,
      className,
      style,
      customText,
      ...props
    },
    ref
  ) => {
    const formatAmount = (value: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(value);
    };

    return (
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          "w-full hover:opacity-90 text-white font-normal shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-xl",
          // Only apply bg-solana-gradient if no custom style is provided
          !style && "bg-solana-gradient",
          disabled || loading ? "opacity-50 cursor-not-allowed" : "",
          className
        )}
        style={style}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Spinner
              size="sm"
              variant="default"
              className="border-white/30 border-t-white"
            />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <span>{customText || `Pay ${formatAmount(amount)} USDC`}</span>
        )}
      </Button>
    );
  }
);

PaymentButton.displayName = "PaymentButton";
