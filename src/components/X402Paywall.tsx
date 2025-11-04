import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  useWallet,
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { fetchUSDCBalance } from "@/lib/balance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentButton } from "./PaymentButton";
import { WalletSection } from "./WalletSection";
import { useX402Payment } from "@/hooks/useX402Payment";
import { X402PaywallProps, WalletAdapter } from "@/types";
import { cn } from "@/lib/utils";
import { useRef } from "react";
// Internal component that actually uses the wallet context
const X402PaywallContent: React.FC<
  Omit<
    X402PaywallProps,
    "autoSetupProviders" | "providerNetwork" | "providerEndpoint"
  >
> = ({
  amount,
  description,
  wallet: walletProp,
  network = "solana-devnet",
  rpcUrl,
  apiEndpoint,
  treasuryAddress,
  facilitatorUrl,
  theme = "solana-light",
  logoUrl = "https://raw.githubusercontent.com/PayAINetwork/x402-solana-react/main/src/components/ui/SolanaLogo.svg",
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
  // Use provided wallet or get from context
  const walletContext = useWallet();

  // Create reactive wallet object that updates when context changes
  const reactiveWallet: WalletAdapter = useMemo(() => {
    if (walletProp) return walletProp;
    return {
      publicKey: walletContext.publicKey
        ? { toString: () => walletContext.publicKey!.toString() }
        : undefined,
      signTransaction: walletContext.signTransaction!,
    };
  }, [walletProp, walletContext.publicKey, walletContext.signTransaction]);

  const [isPaid, setIsPaid] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>("0.00");
  const walletButtonRef = useRef<HTMLDivElement>(null);
  const networkLabel = network === "solana" ? "Mainnet" : "Devnet";

  const { pay, isLoading, status, error, transactionId, reset } =
    useX402Payment({
      wallet: reactiveWallet,
      network,
      rpcUrl,
      apiEndpoint,
      treasuryAddress,
      facilitatorUrl,
      maxPaymentAmount,
    });

  // Handle disconnect using context if no custom handler
  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
    } else if (!walletProp && walletContext.disconnect) {
      walletContext.disconnect();
    }
  };

  // Check if wallet is connected (either from prop or context)
  // Use a permissive check so we transition as soon as the adapter reports connected
  const isWalletConnected = walletProp
    ? Boolean(walletProp.publicKey || walletProp.address)
    : Boolean(walletContext.connected || walletContext.publicKey);

  // Apply theme class to body for wallet modal styling
  useEffect(() => {
    // Remove old theme classes
    document.body.className = document.body.className
      .replace(/wallet-modal-theme-\w+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Add new theme class
    if (theme) {
      document.body.className += ` wallet-modal-theme-${theme}`;
    }

    // Cleanup: remove theme class when component unmounts
    return () => {
      document.body.className = document.body.className
        .replace(/wallet-modal-theme-\w+/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };
  }, [theme]);

  // Fetch balance when wallet connects - react to walletContext changes
  useEffect(() => {
    const walletAddress =
      walletContext.publicKey?.toString() ||
      walletProp?.publicKey?.toString() ||
      walletProp?.address;
    if (walletAddress && walletContext.connected) {
      console.log("Wallet connected:", walletAddress);
      onWalletConnect?.(walletAddress);

      // Fetch USDC balance
      fetchUSDCBalance(walletAddress, network, rpcUrl).then(setWalletBalance);
    }
    // Reset balance if wallet disconnects
    if (!walletContext.connected && !walletProp) {
      setWalletBalance("0.00");
    }
  }, [
    walletContext.publicKey,
    walletContext.connected,
    walletContext.connecting,
    walletProp,
    network,
    rpcUrl,
    onWalletConnect,
  ]);

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

  // Show failure screen when there's an error (for all themes)
  const showFailureScreen =
    error &&
    (theme === "dark" ||
      theme === "solana-dark" ||
      theme === "light" ||
      theme === "solana-light" ||
      theme === "seeker" ||
      theme === "seeker-2" ||
      theme === "seeker-light" ||
      theme === "terminal" ||
      theme === "terminal-light");

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
          container: "",
          card: "backdrop-blur-sm border-emerald-200 rounded-xl",
          icon: "bg-gradient-to-r from-emerald-500 to-teal-500",
          title: "text-white",
          button:
            "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full",
          paymentDetails: "rounded-lg",
          notice: "bg-cyan-50 border-cyan-200 text-cyan-800 rounded-lg",
          securityMessage: "text-white",
          helperText: "text-white",
        };
      case "seeker-2":
        return {
          container: "",
          card: "backdrop-blur-sm border-emerald-200 rounded-xl",
          icon: "bg-gradient-to-r from-emerald-500 to-teal-500",
          title: "text-white",
          button:
            "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full",
          paymentDetails: "rounded-lg",
          notice: "bg-cyan-50 border-cyan-200 text-cyan-800 rounded-lg",
          securityMessage: "text-white",
          helperText: "text-white",
        };
      case "seeker-light":
        return {
          container: "",
          card: "backdrop-blur-sm border-emerald-200 rounded-xl",
          icon: "bg-gradient-to-r from-emerald-500 to-teal-500",
          title: "text-black",
          button:
            "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full",
          paymentDetails: "rounded-lg",
          notice: "bg-cyan-50 border-cyan-200 text-cyan-800 rounded-lg",
          securityMessage: "text-black",
          helperText: "text-black",
        };
      case "terminal":
        return {
          container: "",
          card: "backdrop-blur-sm border-green-400/30 text-white rounded-none font-vt323",
          icon: "bg-green-400 text-black",
          title: "text-white font-vt323",
          button: "text-black hover:opacity-90 font-vt323 rounded-none",
          paymentDetails:
            "bg-gray-900/50 border-green-400/20 text-white rounded-none font-vt323",
          notice:
            "bg-yellow-900/50 border-yellow-400/30 text-white rounded-none font-vt323",
        };
      case "terminal-light":
        return {
          container: "",
          card: "backdrop-blur-sm border-[#E4E4E7] text-black rounded-none font-vt323",
          icon: "bg-[#E4E4E7] text-black",
          title: "text-black font-vt323",
          button: "text-black hover:opacity-90 font-vt323 rounded-none",
          paymentDetails:
            "bg-white/50 border-[#E4E4E7] text-black rounded-none font-vt323",
          notice:
            "bg-yellow-50 border-yellow-200 text-yellow-800 rounded-none font-vt323",
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

  // If wallet is not connected, show the connect wallet UI
  if (!isWalletConnected) {
    // Theme config for connect wallet screen
    const getConnectWalletThemeConfig = () => {
      switch (theme) {
        case "solana-dark":
          return {
            container: "",
            card: "!bg-[#171719] border-0 text-white rounded-xl",
            button:
              "bg-solana-gradient hover:opacity-90 text-white rounded-full",
            paymentDetails:
              "bg-[#0000001F] border-slate-600 text-white rounded-lg",
            securityMessage: "text-slate-400",
            helperText: "text-white",
          };
        case "seeker":
          return {
            container: "",
            card: "backdrop-blur-sm border-emerald-200 rounded-xl",
            button:
              "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full",
            paymentDetails: "rounded-lg",
            securityMessage: "text-white",
            helperText: "text-white",
          };
        case "seeker-2":
          return {
            container: "",
            card: "backdrop-blur-sm border-emerald-200 rounded-xl",
            button:
              "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full",
            paymentDetails: "rounded-lg",
            securityMessage: "text-white",
            helperText: "text-white",
          };
        case "seeker-light":
          return {
            container: "",
            card: "backdrop-blur-sm border-emerald-200 rounded-xl",
            button:
              "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full",
            paymentDetails: "rounded-lg",
            securityMessage: "text-black",
            helperText: "text-black",
          };
        case "terminal":
          return {
            container: "",
            card: "backdrop-blur-sm border-green-400/30 text-white rounded-none font-vt323",
            button: "text-black hover:opacity-90 font-vt323 rounded-none",
            paymentDetails:
              "bg-gray-900/50 border-green-400/20 text-white rounded-none font-vt323",
            securityMessage: "text-white font-vt323",
            helperText: "text-white font-vt323",
          };
        case "terminal-light":
          return {
            container: "",
            card: "backdrop-blur-sm border-[#E4E4E7] text-black rounded-none font-vt323",
            button: "text-black hover:opacity-90 font-vt323 rounded-none",
            paymentDetails:
              "bg-white/50 border-[#E4E4E7] text-black rounded-none font-vt323",
            securityMessage: "text-black font-vt323",
            helperText: "text-black font-vt323",
          };
        case "solana-light":
          return {
            container:
              "bg-gradient-to-b from-white via-pink-50 via-purple-50 via-blue-50 to-cyan-50",
            card: "bg-white/95 backdrop-blur-sm border border-slate-200 shadow-2xl rounded-2xl",
            button:
              "bg-solana-gradient hover:opacity-90 text-white font-light rounded-full",
            paymentDetails: "bg-slate-50 border border-slate-200 rounded-xl",
            securityMessage: "text-slate-600",
            helperText: "text-slate-600",
          };
        case "dark":
          return {
            container: "",
            card: "!bg-[#171719] border-slate-700 text-white rounded-xl",
            button: "bg-slate-600 hover:bg-slate-700 rounded-full",
            paymentDetails:
              "bg-[#0000001F] border-slate-600 text-white rounded-lg",
            securityMessage: "text-slate-400",
            helperText: "text-white",
          };
        case "light":
          return {
            container:
              "bg-gradient-to-b from-white via-pink-50 via-purple-50 via-blue-50 to-cyan-50",
            card: "bg-white/95 backdrop-blur-sm border border-slate-200 shadow-2xl rounded-2xl",
            button:
              "bg-black hover:bg-gray-800 text-white font-light rounded-full",
            paymentDetails: "bg-slate-50 border border-slate-200 rounded-xl",
            securityMessage: "text-slate-600",
            helperText: "text-slate-600",
          };
        default:
          return {
            container:
              "bg-gradient-to-b from-white via-pink-50 via-purple-50 via-blue-50 to-cyan-50",
            card: "bg-white/95 backdrop-blur-sm border border-slate-200 shadow-2xl rounded-2xl",
            button:
              "bg-solana-gradient hover:opacity-90 text-white font-light rounded-full",
            paymentDetails: "bg-slate-50 border border-slate-200 rounded-xl",
            securityMessage: "text-slate-600",
            helperText: "text-slate-600",
          };
      }
    };

    const connectThemeConfig = getConnectWalletThemeConfig();

    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-screen p-4",
          connectThemeConfig.container,
          classNames?.container
        )}
        style={
          theme === "dark"
            ? {
                background:
                  "linear-gradient(to bottom left, #db2777 0%, #9333ea 50%, #1e40af 100%)",
                ...customStyles?.container,
              }
            : theme === "solana-dark"
            ? {
                background:
                  "linear-gradient(to bottom left, #db2777 0%, #9333ea 50%, #1e40af 100%)",
                ...customStyles?.container,
              }
            : theme === "light"
            ? {
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(236, 72, 153, 0.4) 33%, rgba(147, 51, 234, 0.4) 66%, rgba(34, 211, 238, 0.4) 100%)",
                ...customStyles?.container,
              }
            : theme === "solana-light"
            ? {
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(236, 72, 153, 0.4) 33%, rgba(147, 51, 234, 0.4) 66%, rgba(34, 211, 238, 0.4) 100%)",
                ...customStyles?.container,
              }
            : theme === "seeker"
            ? {
                background:
                  "linear-gradient(to top,#21645E 0%, #0D2734 50%, #001214 100%)",
                ...customStyles?.container,
              }
            : theme === "seeker-2"
            ? {
                background: "#0D1615",
                ...customStyles?.container,
              }
            : theme === "seeker-light"
            ? {
                background:
                  "linear-gradient(240.08deg, #B8CCD3 -0.56%, #FFFFFF 119.23%)",
                ...customStyles?.container,
              }
            : theme === "terminal"
            ? {
                backgroundColor: "#0D1615",
                position: "relative",
                ...customStyles?.container,
              }
            : theme === "terminal-light"
            ? {
                backgroundColor: "#F4F4F4",
                position: "relative",
                ...customStyles?.container,
              }
            : customStyles?.container
        }
      >
        {(theme === "terminal" || theme === "terminal-light") && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              backgroundImage:
                theme === "terminal"
                  ? `
                linear-gradient(to right, #22EBAD33 1px, transparent 1px),
                linear-gradient(to bottom, #22EBAD33 1px, transparent 1px)
              `
                  : `
                linear-gradient(to right, #E4E4E7 1px, transparent 1px),
                linear-gradient(to bottom, #E4E4E7 1px, transparent 1px)
              `,
              backgroundSize: `calc(100% / 6) calc(100% / 6)`,
            }}
          />
        )}
        <Card
          className={cn(
            "w-full max-w-lg shadow-2xl border-0",
            connectThemeConfig.card,
            classNames?.card
          )}
          style={
            theme === "seeker"
              ? { backgroundColor: "#171719", ...customStyles?.card }
              : theme === "seeker-2"
              ? {
                  backgroundColor: "rgba(29, 35, 35, 1)",
                  backdropFilter: "blur(12px)",
                  ...customStyles?.card,
                }
              : theme === "seeker-light"
              ? {
                  backgroundColor: "#FFFFFF",
                  ...customStyles?.card,
                }
              : theme === "terminal"
              ? {
                  backgroundColor: "#0D1615",
                  border: "1px solid rgba(34, 235, 173, 0.2)",
                  borderRadius: 0,
                  ...customStyles?.card,
                }
              : theme === "terminal-light"
              ? {
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                  borderRadius: 0,
                  ...customStyles?.card,
                }
              : customStyles?.card
          }
        >
          <CardHeader className="pb-6">
            <div
              className={cn(
                "flex items-center space-x-4 mb-6 p-4",
                theme === "terminal" || theme === "terminal-light"
                  ? "-mx-6 -mt-6 relative"
                  : theme === "light"
                  ? "mb-3"
                  : "mb-6"
              )}
              style={
                theme === "terminal"
                  ? {
                      backgroundColor: "#1682601A",
                      borderBottom: "1px solid rgba(34, 235, 173, 0.12)",
                    }
                  : theme === "terminal-light"
                  ? {
                      backgroundColor: "#FAFAFA",
                      borderBottom: "1px solid #E4E4E7",
                    }
                  : undefined
              }
            >
              <div
                className={cn(
                  "w-auto p-[2px] flex items-center justify-center",
                  theme === "terminal" || theme === "terminal-light"
                    ? "pr-4 mr-4 self-stretch -my-4"
                    : "h-auto rounded-full overflow-hidden"
                )}
                style={
                  theme === "terminal"
                    ? { borderRight: "1px solid rgba(34, 235, 173, 0.25)" }
                    : theme === "terminal-light"
                    ? { borderRight: "1px solid #E4E4E7" }
                    : undefined
                }
              >
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <img src={logoUrl} alt="Logo" className="w-12 h-auto" />
                </div>
              </div>
              <div>
                <CardTitle
                  className={cn(
                    "text-l fw-bold pb-1",
                    theme === "dark" ||
                      theme === "solana-dark" ||
                      theme === "seeker" ||
                      theme === "seeker-2"
                      ? "text-white"
                      : theme === "terminal"
                      ? "text-white font-vt323"
                      : theme === "terminal-light"
                      ? "text-black font-vt323"
                      : "text-slate-900",
                    classNames?.text
                  )}
                >
                  Premium Content XYZ
                </CardTitle>
                <CardDescription
                  className={cn(
                    "text-sm font-light",
                    theme === "terminal"
                      ? ""
                      : theme === "seeker" || theme === "seeker-2"
                      ? "text-white"
                      : theme === "seeker-light"
                      ? "text-black"
                      : theme === "dark" || theme === "solana-dark"
                      ? "text-white"
                      : "text-[#71717A]",
                    classNames?.text
                  )}
                  style={
                    theme === "terminal" ? { color: "#FFFFFF99" } : undefined
                  }
                >
                  content.xyz
                </CardDescription>
              </div>
            </div>

            {theme !== "terminal" && theme !== "terminal-light" && (
              <div
                className={cn(
                  "border-b",
                  theme === "light" ? "" : "mb-6",
                  theme === "dark" || theme === "solana-dark"
                    ? "border-slate-600"
                    : theme === "seeker" || theme === "seeker-2"
                    ? ""
                    : theme === "seeker-light"
                    ? ""
                    : "border-slate-200"
                )}
                style={
                  theme === "seeker" || theme === "seeker-2"
                    ? {
                        borderBottom: "1px solid #FFFFFF1F",
                        marginBottom: "1rem",
                      }
                    : theme === "light" || theme === "solana-light"
                    ? { marginBottom: "1rem" }
                    : theme === "dark" || theme === "solana-dark"
                    ? { marginBottom: "1rem" }
                    : undefined
                }
              ></div>
            )}

            <div className="text-center">
              <h2
                className={cn(
                  "text-2xl font-normal mb-2",
                  theme === "dark" ||
                    theme === "solana-dark" ||
                    theme === "seeker" ||
                    theme === "seeker-2"
                    ? "text-white"
                    : theme === "seeker-light"
                    ? "text-black"
                    : theme === "terminal"
                    ? "text-white font-vt323"
                    : "text-slate-900"
                )}
              >
                Payment Required
              </h2>
              <p
                className={cn(
                  "text-sm font-light",
                  theme === "dark" ||
                    theme === "solana-dark" ||
                    theme === "seeker" ||
                    theme === "seeker-2"
                    ? "text-white"
                    : theme === "terminal"
                    ? ""
                    : "text-slate-600"
                )}
                style={
                  theme === "terminal" ? { color: "#FFFFFF99" } : undefined
                }
              >
                Access to protected content. To access this content, please pay
                ${amount.toFixed(2)} USDC
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Payment Details Preview */}
            <div
              className={cn(
                "p-6",
                theme === "light" || theme === "solana-light"
                  ? "bg-[#F4F4F5] border-none rounded-xl"
                  : connectThemeConfig.paymentDetails
              )}
              style={
                theme === "seeker"
                  ? { backgroundColor: "rgba(0, 0, 0, 0.12)" }
                  : theme === "seeker-2"
                  ? { backgroundColor: "#171A1A" }
                  : theme === "seeker-light"
                  ? { backgroundColor: "#F4F4F5" }
                  : theme === "terminal"
                  ? {
                      backgroundColor: "#0B2D2D",
                      border: "1px solid #22EBAD33",
                    }
                  : theme === "dark" || theme === "solana-dark"
                  ? { boxShadow: "0px 0px 16px 4px #000000 inset" }
                  : theme === "light" || theme === "solana-light"
                  ? { backgroundColor: "#F4F4F5", border: "none" }
                  : undefined
              }
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={cn(
                    "text-sm",
                    theme === "dark" ||
                      theme === "solana-dark" ||
                      theme === "seeker" ||
                      theme === "seeker-2"
                      ? "text-white"
                      : theme === "seeker-light"
                      ? "text-black"
                      : theme === "terminal"
                      ? "text-white"
                      : "text-slate-900"
                  )}
                >
                  Amount
                </span>
                <div
                  className={cn(
                    "text-xl font-bold",
                    theme === "light" || theme === "solana-light"
                      ? "text-purple-600"
                      : theme === "seeker" || theme === "seeker-2"
                      ? ""
                      : theme === "seeker-light"
                      ? ""
                      : theme === "terminal"
                      ? ""
                      : "text-[#21ECAB]"
                  )}
                  style={
                    theme === "seeker" || theme === "seeker-2"
                      ? { color: "#95D2E6" }
                      : theme === "seeker-light"
                      ? { color: "#00BECC" }
                      : theme === "terminal"
                      ? { color: "#32FEFF" }
                      : undefined
                  }
                >
                  {"$" + amount.toFixed(2)}
                </div>
              </div>

              <div
                className={cn(
                  "border-t mb-4",
                  theme === "dark" || theme === "solana-dark"
                    ? "border-slate-600"
                    : theme === "seeker" || theme === "seeker-2"
                    ? ""
                    : theme === "terminal"
                    ? "border-green-400/20"
                    : "border-slate-200"
                )}
                style={
                  theme === "seeker" || theme === "seeker-2"
                    ? { borderTop: "1px solid #FFFFFF1F" }
                    : undefined
                }
              ></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm",
                      theme === "dark" ||
                        theme === "solana-dark" ||
                        theme === "seeker" ||
                        theme === "seeker-2"
                        ? "text-white"
                        : theme === "terminal"
                        ? "text-white"
                        : "text-slate-900"
                    )}
                  >
                    Currency
                  </span>
                  <div
                    className={cn(
                      "text-sm",
                      theme === "dark" ||
                        theme === "solana-dark" ||
                        theme === "seeker" ||
                        theme === "seeker-2"
                        ? "text-white"
                        : theme === "terminal"
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
                      theme === "dark" ||
                        theme === "solana-dark" ||
                        theme === "seeker" ||
                        theme === "seeker-2"
                        ? "text-white"
                        : theme === "terminal"
                        ? "text-white"
                        : "text-slate-900"
                    )}
                  >
                    Network
                  </span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        theme === "seeker-2" ||
                          theme === "seeker-light" ||
                          theme === "terminal" ||
                          theme === "terminal-light"
                          ? ""
                          : "bg-green-500"
                      )}
                      style={
                        theme === "seeker-2"
                          ? { backgroundColor: "#95D2E6" }
                          : theme === "seeker-light"
                          ? { backgroundColor: "#00BECC" }
                          : theme === "terminal"
                          ? { backgroundColor: "#32FEFF" }
                          : undefined
                      }
                    ></div>
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : theme === "terminal"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      {network === "solana" ? "Mainnet" : "Devnet"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Message */}
            <div className="flex items-center justify-center space-x-2">
              <svg
                className={cn(
                  "w-4 h-4",
                  theme === "terminal" || theme === "seeker-light"
                    ? ""
                    : "text-green-500"
                )}
                style={
                  theme === "terminal"
                    ? { color: "#32FEFF" }
                    : theme === "terminal-light"
                    ? { color: "#009192" }
                    : theme === "seeker-light"
                    ? { color: "#00BECC" }
                    : undefined
                }
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
              <span
                className={cn("text-sm", connectThemeConfig.securityMessage)}
                style={
                  theme === "terminal"
                    ? { color: "#FFFFFF99" }
                    : theme === "terminal-light"
                    ? { color: "#000000" }
                    : theme === "seeker-light"
                    ? { color: "#000000" }
                    : undefined
                }
              >
                Secure payment powered by Solana
              </span>
            </div>

            {/* Connect Button */}
            <div className="relative">
              <div
                ref={walletButtonRef}
                className="absolute opacity-0 pointer-events-none -z-10"
              >
                <WalletMultiButton />
              </div>
              <PaymentButton
                amount={amount}
                description={description}
                customText="Connect Wallet"
                onClick={() => {
                  const button = walletButtonRef.current?.querySelector(
                    "button"
                  ) as HTMLElement;
                  button?.click();
                }}
                className={cn("w-full h-12", connectThemeConfig.button)}
                style={
                  theme === "dark"
                    ? {
                        backgroundColor: "#FFFFFF1F",
                        boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.3) inset",
                      }
                    : theme === "terminal"
                    ? {
                        backgroundColor: "#32FEFF",
                        color: "#000000",
                      }
                    : theme === "seeker" || theme === "seeker-2"
                    ? {
                        background:
                          "linear-gradient(0deg, #39A298, #39A298), radial-gradient(101.17% 101.67% at 50.28% 134.17%, rgba(255, 255, 255, 0.6) 0%, rgba(22, 188, 174, 0.6) 100%)",
                        backgroundColor: "transparent",
                      }
                    : theme === "seeker-light"
                    ? {
                        background:
                          "linear-gradient(180deg, #00BECC -9.37%, #92F9FC 160.42%)",
                        backgroundColor: "transparent",
                      }
                    : undefined
                }
              />
            </div>

            {/* Helper Text */}
            <div className="text-center">
              <p
                className={cn("text-sm", connectThemeConfig.helperText)}
                style={
                  theme === "terminal" ? { color: "#FFFFFF99" } : undefined
                }
              >
                Don't have USDC?{" "}
                <a
                  href="#"
                  className={cn(
                    "font-medium underline",
                    theme === "seeker" || theme === "seeker-2"
                      ? "text-[#95D2E6]"
                      : theme === "seeker-light"
                      ? "hover:opacity-90"
                      : theme === "light" || theme === "solana-light"
                      ? "text-purple-600"
                      : theme === "terminal" || theme === "terminal-light"
                      ? "hover:opacity-90"
                      : "text-[#4ADE80]"
                  )}
                  style={
                    theme === "terminal"
                      ? { color: "#32FEFF" }
                      : theme === "terminal-light"
                      ? { color: "#009192" }
                      : theme === "seeker-light"
                      ? { color: "#00BECC" }
                      : undefined
                  }
                >
                  Get it here
                  <svg
                    className={cn(
                      "inline w-3 h-3 ml-1",
                      theme === "seeker" || theme === "seeker-2"
                        ? "text-[#95D2E6]"
                        : theme === "seeker-light"
                        ? ""
                        : theme === "light" || theme === "solana-light"
                        ? "text-purple-600"
                        : theme === "terminal" || theme === "terminal-light"
                        ? ""
                        : "text-[#4ADE80]"
                    )}
                    style={
                      theme === "terminal"
                        ? { color: "#32FEFF" }
                        : theme === "terminal-light"
                        ? { color: "#009192" }
                        : theme === "seeker-light"
                        ? { color: "#00BECC" }
                        : undefined
                    }
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
    );
  }

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
                "linear-gradient(to bottom left, #db2777 0%, #9333ea 50%, #1e40af 100%)",
              ...customStyles?.container,
            }
          : theme === "solana-dark"
          ? {
              background:
                "linear-gradient(to bottom left, #db2777 0%, #9333ea 50%, #1e40af 100%)",
              ...customStyles?.container,
            }
          : theme === "light"
          ? {
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(236, 72, 153, 0.4) 33%, rgba(147, 51, 234, 0.4) 66%, rgba(34, 211, 238, 0.4) 100%)",
              ...customStyles?.container,
            }
          : theme === "solana-light"
          ? {
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(236, 72, 153, 0.4) 33%, rgba(147, 51, 234, 0.4) 66%, rgba(34, 211, 238, 0.4) 100%)",
              ...customStyles?.container,
            }
          : theme === "seeker"
          ? {
              background:
                "linear-gradient(to top,#21645E 0%, #0D2734 50%, #001214 100%)",
              ...customStyles?.container,
            }
          : theme === "seeker-2"
          ? {
              background: "#0D1615",
              ...customStyles?.container,
            }
          : theme === "seeker-light"
          ? {
              background:
                "linear-gradient(240.08deg, #B8CCD3 -0.56%, #FFFFFF 119.23%)",
              ...customStyles?.container,
            }
          : theme === "terminal"
          ? {
              backgroundColor: "#0D1615",
              position: "relative",
              ...customStyles?.container,
            }
          : theme === "terminal-light"
          ? {
              backgroundColor: "#F4F4F4",
              position: "relative",
              ...customStyles?.container,
            }
          : customStyles?.container
      }
    >
      {(theme === "terminal" || theme === "terminal-light") && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            backgroundImage:
              theme === "terminal"
                ? `
              linear-gradient(to right, #22EBAD33 1px, transparent 1px),
              linear-gradient(to bottom, #22EBAD33 1px, transparent 1px)
            `
                : `
              linear-gradient(to right, #E4E4E7 1px, transparent 1px),
              linear-gradient(to bottom, #E4E4E7 1px, transparent 1px)
            `,
            backgroundSize: `calc(100% / 6) calc(100% / 6)`,
          }}
        />
      )}
      <Card
        className={cn(
          "w-full max-w-lg shadow-2xl border-0",
          themeConfig.card,
          classNames?.card
        )}
        style={
          theme === "seeker"
            ? {
                backgroundColor: "#171719",
                ...customStyles?.card,
              }
            : theme === "seeker-2"
            ? {
                backgroundColor: "rgba(29, 35, 35, 1)",
                backdropFilter: "blur(12px)",
                ...customStyles?.card,
              }
            : theme === "seeker-light"
            ? {
                backgroundColor: "#FFFFFF",
                ...customStyles?.card,
              }
            : theme === "terminal"
            ? {
                backgroundColor: "#0D1615",
                border: "1px solid rgba(34, 235, 173, 0.2)",
                borderRadius: 0,
                ...customStyles?.card,
              }
            : theme === "terminal-light"
            ? {
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: 0,
                ...customStyles?.card,
              }
            : customStyles?.card
        }
      >
        <CardHeader className="pb-6">
          {/* Header with icon, title, and subtitle in top left */}
          <div
            className={cn(
              "flex items-center space-x-4 mb-6 p-4",
              theme === "terminal" || theme === "terminal-light"
                ? "-mx-6 -mt-6 relative"
                : theme === "light"
                ? "mb-3"
                : "mb-6"
            )}
            style={
              theme === "terminal"
                ? {
                    backgroundColor: "#1682601A",
                    borderBottom: "1px solid rgba(34, 235, 173, 0.12)",
                  }
                : theme === "terminal-light"
                ? {
                    backgroundColor: "#FAFAFA",
                    borderBottom: "1px solid #E4E4E7",
                  }
                : undefined
            }
          >
            <div
              className={cn(
                "w-auto p-[2px] flex items-center justify-center",
                theme === "terminal" || theme === "terminal-light"
                  ? "pr-4 self-stretch -my-4"
                  : "h-auto rounded-full overflow-hidden"
              )}
              style={
                theme === "terminal"
                  ? { borderRight: "1px solid rgba(34, 235, 173, 0.25)" }
                  : theme === "terminal-light"
                  ? { borderRight: "1px solid #E4E4E7" }
                  : undefined
              }
            >
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <img src={logoUrl} alt="Logo" className="w-12 h-auto" />
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
                  theme === "terminal"
                    ? ""
                    : theme === "seeker" || theme === "seeker-2"
                    ? "text-white"
                    : theme === "seeker-light"
                    ? ""
                    : "text-[#71717A]"
                )}
                style={
                  theme === "terminal"
                    ? { color: "#FFFFFF99" }
                    : theme === "terminal-light"
                    ? { color: "#71717A" }
                    : theme === "seeker-light"
                    ? { color: "#71717A" }
                    : undefined
                }
              >
                content.xyz
              </CardDescription>
            </div>
          </div>

          {/* Underline */}
          {theme !== "terminal" && theme !== "terminal-light" && (
            <div
              className={cn(
                "border-b",
                theme === "light" ? "" : "mb-6",
                theme === "dark" || theme === "solana-dark"
                  ? "border-slate-600"
                  : theme === "seeker"
                  ? ""
                  : theme === "seeker-2"
                  ? ""
                  : theme === "seeker-light"
                  ? ""
                  : "border-slate-200"
              )}
              style={
                theme === "seeker" || theme === "seeker-2"
                  ? {
                      borderBottom: "1px solid #FFFFFF1F",
                      marginBottom: "1rem",
                    }
                  : theme === "light" || theme === "solana-light"
                  ? { marginBottom: "1rem" }
                  : theme === "dark" || theme === "solana-dark"
                  ? { marginBottom: "1rem" }
                  : undefined
              }
            ></div>
          )}

          {!showFailureScreen && (
            <div className="text-center">
              <h2
                className={cn(
                  "text-2xl font-normal mb-2",
                  theme === "dark" ||
                    theme === "solana-dark" ||
                    theme === "seeker"
                    ? "text-white"
                    : theme === "seeker-2"
                    ? "text-white"
                    : theme === "seeker-light"
                    ? "text-black"
                    : theme === "terminal"
                    ? "text-white font-vt323"
                    : "text-slate-900"
                )}
              >
                Payment Required
              </h2>
              <p
                className={cn(
                  "text-sm font-light",
                  theme === "dark" ||
                    theme === "solana-dark" ||
                    theme === "seeker"
                    ? "text-white"
                    : theme === "seeker-2"
                    ? "text-white"
                    : theme === "seeker-light"
                    ? ""
                    : theme === "terminal"
                    ? ""
                    : "text-slate-600"
                )}
                style={
                  theme === "terminal"
                    ? { color: "#FFFFFF99" }
                    : theme === "terminal-light"
                    ? { color: "#71717A" }
                    : theme === "seeker-light"
                    ? { color: "#71717A" }
                    : undefined
                }
              >
                Access to protected content on base-sepolia. To access this
                content, please pay $0.01 Base Sepolia USDC
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Failure Screen for all themes */}
          {showFailureScreen ? (
            <>
              {/* Failure Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>

              {/* Payment Failed Title */}
              <div className="text-center mb-2">
                <h3
                  className={cn(
                    "text-2xl font-semibold",
                    theme === "dark" ||
                      theme === "solana-dark" ||
                      theme === "seeker" ||
                      theme === "seeker-2"
                      ? "text-white"
                      : "text-slate-900"
                  )}
                >
                  Payment Failed
                </h3>
              </div>

              {/* Error Message */}
              <p
                className={cn(
                  "text-center text-sm mb-6",
                  theme === "dark" ||
                    theme === "solana-dark" ||
                    theme === "seeker" ||
                    theme === "seeker-2"
                    ? "text-gray-400"
                    : "text-slate-600"
                )}
              >
                {error?.message ||
                  "It looks like your wallet doesn't have enough funds or the transaction was declined. Please review the details and try again."}
              </p>

              {/* Payment Details Box */}
              <div
                className={cn(
                  "rounded-lg p-6",
                  theme === "dark" || theme === "solana-dark"
                    ? "bg-[#0000001F] border border-slate-600"
                    : theme === "seeker" || theme === "seeker-2"
                    ? "bg-[rgba(0,0,0,0.12)] border border-white/10"
                    : "bg-slate-50 border border-slate-200"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      Amount Paid
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        theme === "light" || theme === "solana-light"
                          ? "text-purple-600"
                          : "text-green-500"
                      )}
                    >
                      {"$" + amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      Wallet
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      {reactiveWallet?.publicKey?.toString()
                        ? `${reactiveWallet.publicKey
                            .toString()
                            .slice(0, 6)}...${reactiveWallet.publicKey
                            .toString()
                            .slice(-4)}`
                        : reactiveWallet?.address
                        ? `${reactiveWallet.address.slice(
                            0,
                            6
                          )}...${reactiveWallet.address.slice(-4)}`
                        : "Not connected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      Available Balance
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      ${walletBalance}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      Currency
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      USDC
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        theme === "dark" ||
                          theme === "solana-dark" ||
                          theme === "seeker" ||
                          theme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      )}
                    >
                      Network
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span
                        className={cn(
                          "text-sm",
                          theme === "dark" ||
                            theme === "solana-dark" ||
                            theme === "seeker" ||
                            theme === "seeker-2"
                            ? "text-white"
                            : "text-slate-900"
                        )}
                      >
                        {networkLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orange Warning Banner */}
              <div
                className={cn(
                  "rounded-lg p-4 flex items-start space-x-3",
                  theme === "dark" ||
                    theme === "solana-dark" ||
                    theme === "seeker" ||
                    theme === "seeker-2"
                    ? "bg-orange-900/50 border border-orange-700"
                    : "bg-orange-50 border border-orange-200"
                )}
              >
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <p
                  className={cn(
                    "text-sm",
                    theme === "dark" ||
                      theme === "solana-dark" ||
                      theme === "seeker" ||
                      theme === "seeker-2"
                      ? "text-white"
                      : "text-orange-800"
                  )}
                >
                  Make sure your Solana wallet has enough USDC to cover the
                  amount before retrying the transaction.
                </p>
              </div>

              {/* Try Again Button */}
              <PaymentButton
                amount={amount}
                description={description}
                onClick={() => {
                  // Reset error and retry
                  reset();
                  handlePayment();
                }}
                loading={isLoading}
                disabled={isLoading || !reactiveWallet?.publicKey}
                className={cn(
                  "w-full h-12",
                  theme === "dark" || theme === "solana-dark"
                    ? theme === "dark"
                      ? "bg-[#FFFFFF1F] rounded-full"
                      : "bg-solana-gradient rounded-full"
                    : theme === "light"
                    ? "bg-black hover:bg-gray-800 text-white font-light rounded-full"
                    : theme === "solana-light"
                    ? "bg-solana-gradient hover:opacity-90 text-white font-light rounded-full"
                    : theme === "seeker" || theme === "seeker-2"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full"
                    : theme === "seeker-light"
                    ? "text-white rounded-full"
                    : theme === "terminal" || theme === "terminal-light"
                    ? "text-black hover:opacity-90 font-vt323 rounded-none"
                    : "bg-solana-gradient rounded-full",
                  classNames?.button
                )}
                style={
                  theme === "terminal"
                    ? {
                        backgroundColor: "#32FEFF",
                        color: "#000000",
                        ...customStyles?.button,
                      }
                    : theme === "dark"
                    ? {
                        backgroundColor: "#FFFFFF1F",
                        boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.3) inset",
                        ...customStyles?.button,
                      }
                    : theme === "light"
                    ? customStyles?.button
                    : theme === "solana-light"
                    ? customStyles?.button
                    : theme === "seeker"
                    ? {
                        background:
                          "linear-gradient(0deg, #39A298, #39A298), radial-gradient(101.17% 101.67% at 50.28% 134.17%, rgba(255, 255, 255, 0.6) 0%, rgba(22, 188, 174, 0.6) 100%)",
                        backgroundColor: "transparent",
                        ...customStyles?.button,
                      }
                    : theme === "seeker-2"
                    ? {
                        background:
                          "linear-gradient(0deg, #39A298, #39A298), radial-gradient(101.17% 101.67% at 50.28% 134.17%, rgba(255, 255, 255, 0.6) 0%, rgba(22, 188, 174, 0.6) 100%)",
                        backgroundColor: "transparent",
                        ...customStyles?.button,
                      }
                    : theme === "seeker-light"
                    ? {
                        background:
                          "linear-gradient(180deg, #00BECC -9.37%, #92F9FC 160.42%)",
                        backgroundColor: "transparent",
                        ...customStyles?.button,
                      }
                    : customStyles?.button
                }
                customText="Try Again"
              />

              {/* Helper Text */}
              <div className="text-center">
                <p
                  className={cn(
                    "text-sm",
                    theme === "dark" ||
                      theme === "solana-dark" ||
                      theme === "seeker" ||
                      theme === "seeker-2"
                      ? "text-white"
                      : "text-slate-900"
                  )}
                >
                  <span
                    className={cn(
                      theme === "dark" ||
                        theme === "solana-dark" ||
                        theme === "seeker" ||
                        theme === "seeker-2"
                        ? "text-gray-400"
                        : "text-slate-600"
                    )}
                  >
                    Don't have USDC?{" "}
                  </span>
                  <a
                    href="https://www.coinbase.com/how-to-buy/usdc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "font-medium hover:opacity-80",
                      theme === "light" || theme === "solana-light"
                        ? "text-purple-600"
                        : theme === "seeker" || theme === "seeker-2"
                        ? "text-[#95D2E6] hover:text-[#95D2E6]"
                        : theme === "seeker-light"
                        ? "hover:opacity-90"
                        : theme === "terminal" || theme === "terminal-light"
                        ? "hover:opacity-90"
                        : "text-green-400 hover:text-green-300"
                    )}
                    style={
                      theme === "terminal"
                        ? { color: "#32FEFF" }
                        : theme === "terminal-light"
                        ? { color: "#000000" }
                        : theme === "seeker-light"
                        ? { color: "#00BECC" }
                        : undefined
                    }
                  >
                    Get it here
                    <svg
                      className={cn(
                        "inline w-3 h-3 ml-1",
                        theme === "light" || theme === "solana-light"
                          ? "text-purple-600"
                          : theme === "seeker" || theme === "seeker-2"
                          ? "text-[#95D2E6]"
                          : theme === "seeker-light"
                          ? ""
                          : theme === "terminal" || theme === "terminal-light"
                          ? ""
                          : "text-green-400"
                      )}
                      style={
                        theme === "terminal"
                          ? { color: "#32FEFF" }
                          : theme === "terminal-light"
                          ? { color: "#000000" }
                          : theme === "seeker-light"
                          ? { color: "#00BECC" }
                          : undefined
                      }
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
            </>
          ) : (
            <>
              {/* Wallet Info */}
              <WalletSection
                wallet={reactiveWallet}
                onDisconnect={handleDisconnect}
                theme={theme}
                className={cn(
                  "mb-4",
                  (theme === "dark" || theme === "solana-dark") &&
                    "bg-[#0000001F] border-slate-600 text-white",
                  (theme === "light" || theme === "solana-light") &&
                    "bg-[#F4F4F5] rounded-xl border-none"
                )}
                style={
                  theme === "terminal"
                    ? {
                        backgroundColor: "#0B2D2D",
                        border: "1px solid #22EBAD33",
                      }
                    : theme === "dark" || theme === "solana-dark"
                    ? { boxShadow: "0px 0px 16px 4px #000000 inset" }
                    : theme === "seeker"
                    ? {
                        backgroundColor: "rgba(0, 0, 0, 0.12)",
                      }
                    : theme === "seeker-2"
                    ? { backgroundColor: "#171A1A" }
                    : theme === "seeker-light"
                    ? {
                        backgroundColor: "#F4F4F5",
                      }
                    : theme === "light" || theme === "solana-light"
                    ? { backgroundColor: "#F4F4F5", border: "none" }
                    : undefined
                }
              />

              {/* Payment Details */}
              {showPaymentDetails &&
                (theme === "seeker" || theme === "seeker-2" ? (
                  <div
                    className={cn("p-6", themeConfig.paymentDetails)}
                    style={
                      theme === "seeker"
                        ? {
                            backgroundColor: "rgba(0, 0, 0, 0.12)",
                          }
                        : theme === "seeker-2"
                        ? { backgroundColor: "#171A1A" }
                        : undefined
                    }
                  >
                    {/* Amount Section - Top Row */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-white">Amount</span>
                      <div
                        className="text-xl font-bold"
                        style={{ color: "#95D2E6" }}
                      >
                        {"$" + amount.toFixed(2)}
                      </div>
                    </div>

                    {/* Separator Line */}
                    <div
                      className="border-t mb-4"
                      style={{ borderTop: "1px solid #FFFFFF1F" }}
                    ></div>

                    {/* Other Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Wallet</span>
                        <div className="text-sm text-white">
                          {reactiveWallet?.publicKey?.toString()
                            ? `${reactiveWallet.publicKey
                                .toString()
                                .slice(0, 6)}...${reactiveWallet.publicKey
                                .toString()
                                .slice(-4)}`
                            : reactiveWallet?.address
                            ? `${reactiveWallet.address.slice(
                                0,
                                6
                              )}...${reactiveWallet.address.slice(-4)}`
                            : "Not connected"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">
                          Available Balance
                        </span>
                        <div className="text-sm text-white">
                          ${walletBalance}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Currency</span>
                        <div className="text-sm text-white">USDC</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Network</span>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#95D2E6" }}
                          ></div>
                          <span className="text-sm text-white">
                            {networkLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "p-6",
                      theme === "light" || theme === "solana-light"
                        ? "bg-[#F4F4F5] border-none rounded-xl"
                        : themeConfig.paymentDetails
                    )}
                    style={
                      theme === "terminal"
                        ? {
                            backgroundColor: "#0B2D2D",
                            border: "1px solid #22EBAD33",
                          }
                        : theme === "dark" || theme === "solana-dark"
                        ? { boxShadow: "0px 0px 16px 4px #000000 inset" }
                        : theme === "light" || theme === "solana-light"
                        ? { backgroundColor: "#F4F4F5", border: "none" }
                        : theme === "seeker-light"
                        ? {
                            backgroundColor: "#F4F4F5",
                          }
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
                            : theme === "terminal-light"
                            ? "text-black"
                            : theme === "seeker-light"
                            ? "text-black"
                            : theme === "terminal"
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
                            : theme === "terminal"
                            ? ""
                            : theme === "terminal-light"
                            ? ""
                            : theme === "seeker-light"
                            ? ""
                            : "text-[#21ECAB]"
                        )}
                        style={
                          theme === "terminal"
                            ? { color: "#32FEFF" }
                            : theme === "terminal-light"
                            ? { color: "#009192" }
                            : theme === "seeker-light"
                            ? { color: "#00BECC" }
                            : undefined
                        }
                      >
                        {"$" + amount.toFixed(2)}
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
                              : theme === "terminal-light"
                              ? "text-black"
                              : theme === "seeker-light"
                              ? "text-black"
                              : theme === "terminal"
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
                              : theme === "terminal-light"
                              ? "text-black font-vt323"
                              : theme === "seeker-light"
                              ? "text-black"
                              : theme === "terminal"
                              ? "text-white font-vt323"
                              : "text-slate-900"
                          )}
                        >
                          {reactiveWallet?.publicKey?.toString()
                            ? `${reactiveWallet.publicKey
                                .toString()
                                .slice(0, 6)}...${reactiveWallet.publicKey
                                .toString()
                                .slice(-4)}`
                            : reactiveWallet?.address
                            ? `${reactiveWallet.address.slice(
                                0,
                                6
                              )}...${reactiveWallet.address.slice(-4)}`
                            : "Not connected"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-sm",
                            theme === "dark" || theme === "solana-dark"
                              ? "text-white"
                              : theme === "terminal-light"
                              ? "text-black"
                              : theme === "seeker-light"
                              ? "text-black"
                              : theme === "terminal"
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
                              : theme === "terminal-light"
                              ? "text-black font-vt323"
                              : theme === "seeker-light"
                              ? "text-black"
                              : theme === "terminal"
                              ? "text-white font-vt323"
                              : "text-slate-900"
                          )}
                        >
                          ${walletBalance}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-sm",
                            theme === "dark" || theme === "solana-dark"
                              ? "text-white"
                              : theme === "terminal-light"
                              ? "text-black"
                              : theme === "seeker-light"
                              ? "text-black"
                              : theme === "terminal"
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
                              : theme === "terminal-light"
                              ? "text-black font-vt323"
                              : theme === "seeker-light"
                              ? "text-black"
                              : theme === "terminal"
                              ? "text-white font-vt323"
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
                              : theme === "terminal-light"
                              ? "text-black"
                              : theme === "seeker-light"
                              ? "text-black"
                              : theme === "terminal"
                              ? "text-white"
                              : "text-black"
                          )}
                        >
                          Network
                        </span>
                        <div className="flex items-center space-x-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              theme === "terminal" ||
                                theme === "terminal-light" ||
                                theme === "seeker-light"
                                ? ""
                                : "bg-green-500"
                            )}
                            style={
                              theme === "terminal"
                                ? { backgroundColor: "#32FEFF" }
                                : theme === "terminal-light"
                                ? { backgroundColor: "#009192" }
                                : theme === "seeker-light"
                                ? { backgroundColor: "#00BECC" }
                                : undefined
                            }
                          ></div>
                          <span
                            className={cn(
                              "text-sm",
                              theme === "dark" || theme === "solana-dark"
                                ? "text-white"
                                : theme === "terminal-light"
                                ? "text-black font-vt323"
                                : theme === "seeker-light"
                                ? "text-black"
                                : theme === "terminal"
                                ? "text-white font-vt323"
                                : "text-slate-900"
                            )}
                          >
                            {networkLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Security Message */}
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className={cn(
                    "w-4 h-4",
                    theme === "terminal" ||
                      theme === "terminal-light" ||
                      theme === "seeker-light"
                      ? ""
                      : "text-green-500"
                  )}
                  style={
                    theme === "terminal"
                      ? { color: "#32FEFF" }
                      : theme === "terminal-light"
                      ? { color: "#009192" }
                      : theme === "seeker-light"
                      ? { color: "#00BECC" }
                      : undefined
                  }
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
                <span
                  className={cn("text-sm", themeConfig.securityMessage)}
                  style={
                    theme === "terminal"
                      ? { color: "#FFFFFF99" }
                      : theme === "seeker"
                      ? { color: "#FFFFFF66" }
                      : theme === "seeker-2"
                      ? { color: "#FFFFFF66" }
                      : theme === "terminal-light"
                      ? { color: "#000000" }
                      : theme === "seeker-light"
                      ? { color: "#000000" }
                      : undefined
                  }
                >
                  Secure payment powered by Solana
                </span>
              </div>

              {/* Payment Button */}
              <PaymentButton
                amount={amount}
                description={description}
                onClick={handlePayment}
                loading={isLoading}
                disabled={isLoading || !reactiveWallet?.publicKey}
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
                  theme === "terminal"
                    ? {
                        backgroundColor: "#32FEFF",
                        color: "#000000",
                        ...customStyles?.button,
                      }
                    : theme === "dark"
                    ? {
                        backgroundColor: "#FFFFFF1F",
                        boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.3) inset",
                        ...customStyles?.button,
                      }
                    : theme === "seeker"
                    ? {
                        background:
                          "linear-gradient(0deg, #39A298, #39A298), radial-gradient(101.17% 101.67% at 50.28% 134.17%, rgba(255, 255, 255, 0.6) 0%, rgba(22, 188, 174, 0.6) 100%)",
                        backgroundColor: "transparent",
                        ...customStyles?.button,
                      }
                    : theme === "seeker-2"
                    ? {
                        background:
                          "linear-gradient(0deg, #39A298, #39A298), radial-gradient(101.17% 101.67% at 50.28% 134.17%, rgba(255, 255, 255, 0.6) 0%, rgba(22, 188, 174, 0.6) 100%)",
                        backgroundColor: "transparent",
                        ...customStyles?.button,
                      }
                    : theme === "seeker-light"
                    ? {
                        background:
                          "linear-gradient(180deg, #00BECC -9.37%, #92F9FC 160.42%)",
                        backgroundColor: "transparent",
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
                  <span
                    style={
                      theme === "terminal"
                        ? { color: "#FFFFFF99" }
                        : theme === "seeker"
                        ? { color: "#FFFFFF66" }
                        : theme === "seeker-2"
                        ? { color: "#FFFFFF66" }
                        : undefined
                    }
                  >
                    Don't have USDC?{" "}
                  </span>
                  <a
                    href="#"
                    className={cn(
                      "font-medium",
                      theme === "seeker"
                        ? "text-[#95D2E6]"
                        : theme === "seeker-2"
                        ? "text-[#95D2E6]"
                        : theme === "seeker-light"
                        ? "hover:opacity-90"
                        : theme === "light" || theme === "solana-light"
                        ? "text-purple-600"
                        : theme === "terminal" || theme === "terminal-light"
                        ? "hover:opacity-90"
                        : themeConfig.helperLink || "text-[#4ADE80]"
                    )}
                    style={
                      theme === "terminal"
                        ? { color: "#32FEFF" }
                        : theme === "seeker"
                        ? { color: "#95D2E6" }
                        : theme === "seeker-2"
                        ? { color: "#95D2E6" }
                        : theme === "seeker-light"
                        ? { color: "#00BECC" }
                        : undefined
                    }
                  >
                    Get it here
                    <svg
                      className={cn(
                        "inline w-3 h-3 ml-1",
                        theme === "light" || theme === "solana-light"
                          ? "text-purple-600"
                          : theme === "seeker"
                          ? "text-[#95D2E6]"
                          : theme === "seeker-2"
                          ? "text-[#95D2E6]"
                          : theme === "seeker-light"
                          ? ""
                          : theme === "terminal" || theme === "terminal-light"
                          ? ""
                          : "text-[#4ADE80]"
                      )}
                      style={
                        theme === "terminal"
                          ? { color: "#32FEFF" }
                          : theme === "terminal-light"
                          ? { color: "#009192" }
                          : theme === "seeker-light"
                          ? { color: "#00BECC" }
                          : undefined
                      }
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main exported component - automatically sets up providers if needed
export const X402Paywall: React.FC<X402PaywallProps> = ({
  autoSetupProviders = true,
  providerNetwork,
  providerEndpoint,
  ...props
}) => {
  // Auto-detect provider network from the network prop if not explicitly set
  const detectedProviderNetwork =
    providerNetwork ??
    (props.network === "solana"
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet);

  // Hooks must be called unconditionally
  const endpoint = useMemo(
    () =>
      providerEndpoint ||
      props.rpcUrl ||
      clusterApiUrl(detectedProviderNetwork),
    [providerEndpoint, props.rpcUrl, detectedProviderNetwork]
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  // If auto-setup is enabled, wrap with providers
  if (autoSetupProviders) {
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            <X402PaywallContent {...props} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }

  // Auto-setup disabled - just render content (assumes providers exist)
  return <X402PaywallContent {...props} />;
};

X402Paywall.displayName = "X402Paywall";
