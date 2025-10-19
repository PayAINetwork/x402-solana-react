import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { PaymentStatusProps } from '@/types';
import { cn } from '@/lib/utils';

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  message,
  progress,
  className,
  style,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          label: 'Ready',
          color: 'bg-gray-100 text-gray-800',
          icon: null,
        };
      case 'connecting':
        return {
          label: 'Connecting',
          color: 'bg-blue-100 text-blue-800',
          icon: <Spinner size="sm" variant="default" />,
        };
      case 'pending':
        return {
          label: 'Processing',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Spinner size="sm" variant="solana" />,
        };
      case 'success':
        return {
          label: 'Paid',
          color: 'bg-green-100 text-green-800',
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
        };
      case 'error':
        return {
          label: 'Failed',
          color: 'bg-red-100 text-red-800',
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn('flex flex-col gap-2', className)} style={style}>
      <div className="flex items-center gap-2">
        <Badge className={cn('flex items-center gap-1.5', config.color)}>
          {config.icon}
          <span>{config.label}</span>
        </Badge>
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
      
      {progress !== undefined && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-solana-gradient h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

PaymentStatus.displayName = 'PaymentStatus';
