import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletSectionProps } from '@/types';
import { cn } from '@/lib/utils';

export const WalletSection: React.FC<WalletSectionProps> = ({
  wallet,
  balance,
  network,
  showBalance = true,
  className,
  style,
}) => {
  const walletAddress = wallet?.publicKey?.toString() || wallet?.address;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getNetworkLabel = () => {
    return network === 'solana' ? 'Mainnet' : 'Devnet';
  };

  if (!wallet || !walletAddress) {
    return (
      <Card className={cn('border-dashed', className)} style={style}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <p className="text-sm">No wallet connected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)} style={style}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Wallet
          </span>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {formatAddress(walletAddress)}
          </code>
        </div>

        {showBalance && balance && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Balance
            </span>
            <span className="text-sm font-semibold">{balance} USDC</span>
          </div>
        )}

        {network && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Network
            </span>
            <Badge variant="outline" className="text-xs">
              {getNetworkLabel()}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

WalletSection.displayName = 'WalletSection';
