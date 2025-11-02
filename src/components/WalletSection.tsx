import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletSectionProps } from "@/types";
import { cn } from "@/lib/utils";

export const WalletSection: React.FC<WalletSectionProps> = ({
  wallet,
  balance,
  network,
  showBalance = true,
  onDisconnect,
  theme,
  className,
  style,
}) => {
  const walletAddress = wallet?.publicKey?.toString() || wallet?.address;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getNetworkLabel = () => {
    return network === "solana" ? "Mainnet" : "Devnet";
  };

  if (!wallet || !walletAddress) {
    return (
      <Card className={cn("border-dashed", className)} style={style}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <p className="text-sm">No wallet connected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        theme === "terminal" ? "rounded-none" : "rounded-lg",
        "p-4",
        className
      )}
      style={style}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Wallet Picture */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                theme === "terminal"
                  ? "bg-green-400"
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              )}
            >
              <span
                className={cn(
                  "font-semibold text-sm",
                  theme === "terminal"
                    ? "text-black font-vt323"
                    : "text-white font-mono"
                )}
              >
                {walletAddress.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div
                className={cn(
                  "text-xs font-medium",
                  theme === "light" || theme === "solana-light"
                    ? "text-[#71717A]"
                    : theme === "terminal"
                    ? ""
                    : "text-[#FFFFFF66]"
                )}
                style={
                  theme === "terminal" ? { color: "#FFFFFF66" } : undefined
                }
              >
                Connected Wallet
              </div>
              <div
                className={cn(
                  "text-sm",
                  theme === "light" || theme === "solana-light"
                    ? "text-black"
                    : theme === "terminal"
                    ? "text-white font-vt323"
                    : "text-white font-mono"
                )}
              >
                {formatAddress(walletAddress)}
              </div>
            </div>
          </div>
          <button
            onClick={onDisconnect}
            className={cn(
              "text-sm font-medium transition-colors",
              theme === "light" || theme === "solana-light"
                ? "text-red-500 hover:text-red-700"
                : theme === "terminal"
                ? "hover:opacity-80 font-vt323"
                : "text-[#FFFFFF66] hover:opacity-80"
            )}
            style={theme === "terminal" ? { color: "#FFFFFF66" } : undefined}
          >
            Disconnect
          </button>
        </div>

        {showBalance && balance && (
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-sm font-medium",
                theme === "terminal" ? "text-white" : "text-slate-600"
              )}
            >
              USDC Balance
            </span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-lg font-bold",
                  theme === "terminal"
                    ? "text-white font-vt323"
                    : "text-slate-900"
                )}
              >
                {balance}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-md",
                  theme === "terminal"
                    ? "text-white bg-green-400 font-vt323"
                    : "text-slate-500 bg-slate-200"
                )}
              >
                USDC
              </span>
            </div>
          </div>
        )}

        {network && (
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-sm font-medium",
                theme === "terminal" ? "text-white" : "text-slate-600"
              )}
            >
              Network
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                theme === "terminal"
                  ? "border-green-400/30 text-white font-vt323"
                  : "border-slate-300 text-slate-700"
              )}
            >
              {getNetworkLabel()}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

WalletSection.displayName = "WalletSection";
