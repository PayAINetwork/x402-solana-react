import * as React from "react";
import { useState, useEffect } from "react";
import { fetchUSDCBalance } from "@/lib/balance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentButton } from "./PaymentButton";
import { PaymentStatus } from "./PaymentStatus";
import { WalletSection } from "./WalletSection";
import { useX402Payment } from "@/hooks/useX402Payment";
import { X402PaywallProps } from "@/types";
import { cn } from "@/lib/utils";

export const X402Paywall: React.FC<X402PaywallProps> = ({
  amount,
  description,
  wallet,
  network = "solana-devnet",
  rpcUrl,
  apiEndpoint,
  treasuryAddress,
  facilitatorUrl,
  theme = "solana-light",
  showPaymentDetails = true,
  onDisconnect,
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
  const [walletBalance, setWalletBalance] = useState<string>("0.00");

  const { pay, isLoading, status, error, transactionId } = useX402Payment({
    wallet,
    network,
    rpcUrl,
    apiEndpoint,
    treasuryAddress,
    facilitatorUrl,
    maxPaymentAmount,
  });

  // Fetch balance when wallet connects
  useEffect(() => {
    const walletAddress = wallet.publicKey?.toString() || wallet.address;
    if (walletAddress) {
      onWalletConnect?.(walletAddress);

      // Fetch USDC balance
      fetchUSDCBalance(walletAddress, network, rpcUrl).then(setWalletBalance);
    }
  }, [wallet, network, onWalletConnect]);

  // Handle payment success
  useEffect(() => {
    if (status === "success" && transactionId) {
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

  // Theme-based styling configuration
  const getThemeConfig = () => {
    switch (theme) {
      case "solana-dark":
        return {
          container: "",
          card: "!bg-[#171719] border-0 text-white rounded-xl",
          icon: "bg-slate-600",
          title: "",
          button: "bg-solana-gradient hover:opacity-90 text-white rounded-full",
          paymentDetails:
            "bg-[#0000001F] border-slate-600 text-white rounded-lg",
          walletSection:
            "bg-[#0000001F] border-slate-600 text-white rounded-lg",
          notice: "bg-amber-900/50 border-amber-700 text-white rounded-lg",
          securityMessage: "text-slate-400",
          helperText: "text-white",
          helperLink: undefined,
        };
      case "seeker":
        return {
          container:
            "bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900",
          card: "bg-white/95 backdrop-blur-sm border-emerald-200 rounded-xl",
          icon: "bg-gradient-to-r from-emerald-500 to-teal-500",
          title:
            "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
          button:
            "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white",
          paymentDetails:
            "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 rounded-lg",
          notice: "bg-cyan-50 border-cyan-200 text-cyan-800 rounded-lg",
        };
      case "terminal":
        return {
          container: "bg-gradient-to-br from-gray-900 via-black to-gray-800",
          card: "bg-black/90 backdrop-blur-sm border-green-400/30 text-green-400 rounded-xl",
          icon: "bg-green-400 text-black",
          title: "text-green-400 font-mono",
          button:
            "bg-green-400 text-black hover:bg-green-300 font-mono rounded-full",
          paymentDetails:
            "bg-gray-900/50 border-green-400/20 text-green-300 rounded-lg",
          notice:
            "bg-yellow-900/50 border-yellow-400/30 text-yellow-300 rounded-lg",
        };
      case "solana-light":
        return {
          container:
            "bg-gradient-to-b from-white via-pink-50 via-purple-50 via-blue-50 to-cyan-50",
          card: "bg-white/95 backdrop-blur-sm border border-slate-200 shadow-2xl rounded-2xl",
          icon: "bg-gradient-to-r from-blue-600 to-purple-600",
          title: "text-slate-900",
          button:
            "bg-solana-gradient hover:opacity-90 text-white font-light rounded-full",
          paymentDetails: "bg-slate-50 border border-slate-200 rounded-xl",
          notice: "text-slate-600",
          walletSection: "bg-slate-50 border border-slate-200 rounded-xl",
          securityMessage: "text-slate-600",
          helperText: "text-slate-600",
          helperLink: "text-purple-600 underline",
        };
      case "dark":
        return {
          container: "",
          card: "!bg-[#171719] border-slate-700 text-white rounded-xl",
          icon: "bg-slate-600",
          title: "",
          button: "bg-slate-600 hover:bg-slate-700 rounded-full",
          paymentDetails:
            "bg-[#0000001F] border-slate-600 text-white rounded-lg",
          walletSection:
            "bg-[#0000001F] border-slate-600 text-white rounded-lg",
          notice: "bg-amber-900/50 border-amber-700 text-white rounded-lg",
          securityMessage: "text-slate-400",
          helperText: "text-white",
          helperLink: undefined,
        };
      case "light":
        return {
          container:
            "bg-gradient-to-b from-white via-pink-50 via-purple-50 via-blue-50 to-cyan-50",
          card: "bg-white/95 backdrop-blur-sm border border-slate-200 shadow-2xl rounded-2xl",
          icon: "bg-gradient-to-r from-blue-600 to-purple-600",
          title: "text-slate-900",
          button:
            "bg-black hover:bg-gray-800 text-white font-light rounded-full",
          paymentDetails: "bg-slate-50 border border-slate-200 rounded-xl",
          notice: "text-slate-600",
          walletSection: "bg-slate-50 border border-slate-200 rounded-xl",
          securityMessage: "text-slate-600",
          helperText: "text-slate-600",
          helperLink: "text-purple-600 underline",
        };
      default:
        return {
          container:
            "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          card: "bg-white/95 backdrop-blur-sm rounded-xl",
          icon: "bg-slate-600",
          title: "text-slate-900",
          button: "bg-slate-600 hover:bg-slate-700 text-white rounded-full",
          paymentDetails: "bg-slate-50 border-slate-200 rounded-lg",
          notice: "bg-amber-50 border-amber-200 text-amber-800 rounded-lg",
        };
    }
  };

  const themeConfig = getThemeConfig();

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-screen p-4",
        themeConfig.container,
        classNames?.container
      )}
      style={
        theme === "dark"
          ? {
              background:
                "radial-gradient(circle at center, #ec4899 0%, #3b82f6 50%, #9333ea 100%)",
              ...customStyles?.container,
            }
          : customStyles?.container
      }
    >
      <div
        className={cn(
          "w-full max-w-lg",
          theme === "solana-dark" && "p-[2px] bg-solana-gradient rounded-xl"
        )}
      >
        <Card
          className={cn(
            "w-full shadow-2xl border-0",
            themeConfig.card,
            classNames?.card
          )}
          style={customStyles?.card}
        >
          <CardHeader className="pb-6">
            {/* Header with icon, title, and subtitle in top left */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-auto h-auto rounded-full p-[2px] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <img
                    src="/src/components/ui/SolanaLogo.svg"
                    alt="Solana"
                    className="w-12 h-auto"
                  />
                </div>
              </div>
              <div>
                <CardTitle
                  className={cn(
                    "text-l fw-bold pb-1",
                    themeConfig.title,
                    classNames?.text
                  )}
                  style={customStyles?.text}
                >
                  Premium Content XYZ
                </CardTitle>
                <CardDescription
                  className={cn(
                    "text-sm font-light",
                    theme === "terminal" ? "text-green-300" : "text-[#71717A]"
                  )}
                >
                  content.xyz
                </CardDescription>
              </div>
            </div>

            {/* Underline */}
            <div
              className={cn(
                "border-b mb-6",
                theme === "dark" || theme === "solana-dark"
                  ? "border-slate-600"
                  : "border-slate-200"
              )}
            ></div>

            <div className="text-center">
              <h2
                className={cn(
                  "text-2xl font-normal mb-2",
                  theme === "dark" || theme === "solana-dark"
                    ? "text-white"
                    : "text-slate-900"
                )}
              >
                Payment Required
              </h2>
              <p
                className={cn(
                  "text-sm font-light",
                  theme === "dark" || theme === "solana-dark"
                    ? "text-white"
                    : "text-slate-600"
                )}
              >
                Access to protected content on base-sepolia. To access this
                content, please pay $0.01 Base Sepolia USDC
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Wallet Info */}
            <WalletSection
              wallet={wallet}
              onDisconnect={onDisconnect}
              theme={theme}
              className={cn(
                "mb-4",
                (theme === "dark" || theme === "solana-dark") &&
                  "bg-[#0000001F] border-slate-600 text-white"
              )}
              style={
                theme === "dark" || theme === "solana-dark"
                  ? { boxShadow: "0px 0px 16px 4px #000000 inset" }
                  : undefined
              }
            />

            {/* Payment Details */}
            {showPaymentDetails && (
              <div
                className={cn("p-6", themeConfig.paymentDetails)}
                style={
                  theme === "dark" || theme === "solana-dark"
                    ? { boxShadow: "0px 0px 16px 4px #000000 inset" }
                    : undefined
                }
              >
                {/* Amount Section - Top Row */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={cn(
                      "text-sm",
                      theme === "dark" || theme === "solana-dark"
                        ? "text-white"
                        : "text-black"
                    )}
                  >
                    Amount
                  </span>
                  <div
                    className={cn(
                      "text-xl font-bold",
                      theme === "light" || theme === "solana-light"
                        ? "text-purple-600"
                        : "text-[#21ECAB]"
                    )}
                  >
                    $0.01
                  </div>
                </div>

                {/* Separator Line */}
                <div
                  className={cn(
                    "border-t mb-4",
                    theme === "dark" || theme === "solana-dark"
                      ? "border-slate-600"
                      : "border-slate-200"
                  )}
                ></div>

                {/* Other Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" || theme === "solana-dark"
                          ? "text-white"
                          : "text-black"
                      )}
                    >
                      Wallet
                    </span>
                    <div
                      className={cn(
                        "text-sm",
                        theme === "dark" || theme === "solana-dark"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      0x288D...2bD1
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" || theme === "solana-dark"
                          ? "text-white"
                          : "text-black"
                      )}
                    >
                      Available Balance
                    </span>
                    <div
                      className={cn(
                        "text-sm",
                        theme === "dark" || theme === "solana-dark"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      $5.210
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" || theme === "solana-dark"
                          ? "text-white"
                          : "text-black"
                      )}
                    >
                      Currency
                    </span>
                    <div
                      className={cn(
                        "text-sm",
                        theme === "dark" || theme === "solana-dark"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      USDC
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" || theme === "solana-dark"
                          ? "text-white"
                          : "text-black"
                      )}
                    >
                      Network
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span
                        className={cn(
                          "text-sm",
                          theme === "dark" || theme === "solana-dark"
                            ? "text-white"
                            : "text-slate-900"
                        )}
                      >
                        Solana
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status */}
            {status !== "idle" && (
              <PaymentStatus
                status={status}
                message={error?.message}
                className={classNames?.status}
                style={customStyles?.status}
              />
            )}

            {/* Security Message */}
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                <path
                  d="M9 12l2 2 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={cn("text-sm", themeConfig.securityMessage)}>
                Secure payment powered by Solana
              </span>
            </div>

            {/* Payment Button */}
            <PaymentButton
              amount={amount}
              description={description}
              onClick={handlePayment}
              loading={isLoading}
              disabled={isLoading}
              className={cn(
                "w-full h-12",
                theme === "dark" || theme === "solana-dark"
                  ? theme === "dark"
                    ? "bg-[#FFFFFF1F] rounded-full"
                    : "bg-solana-gradient rounded-full"
                  : themeConfig.button,
                classNames?.button
              )}
              style={
                theme === "dark"
                  ? {
                      backgroundColor: "#FFFFFF1F",
                      boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.3) inset",
                      ...customStyles?.button,
                    }
                  : customStyles?.button
              }
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 text-center">
                  <span className="font-semibold">Payment Error:</span>{" "}
                  {error.message}
                </p>
              </div>
            )}

            {/* Helper Text */}
            <div className="text-center">
              <p className={cn("text-sm", themeConfig.helperText)}>
                Don't have USDC?{" "}
                <a
                  href="#"
                  className={cn(
                    "font-medium text-[#4ADE80]",
                    themeConfig.helperLink
                  )}
                >
                  Get it here
                  <svg
                    className={cn(
                      "inline w-3 h-3 ml-1",
                      theme === "light" ? "text-purple-600" : "text-[#4ADE80]"
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

X402Paywall.displayName = "X402Paywall";
