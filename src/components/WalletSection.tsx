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
    <div className={cn('bg-slate-50 rounded-lg p-4 border border-slate-200', className)} style={style}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-600">
              Connected Wallet
            </span>
          </div>
          <code className="text-sm font-mono bg-white px-3 py-1.5 rounded-md border border-slate-300 text-slate-800">
            {formatAddress(walletAddress)}
          </code>
        </div>

        {showBalance && balance && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              USDC Balance
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">{balance}</span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-md">USDC</span>
            </div>
          </div>
        )}

        {network && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Network
            </span>
            <Badge variant="outline" className="text-xs border-slate-300 text-slate-700">
              {getNetworkLabel()}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

WalletSection.displayName = 'WalletSection';
