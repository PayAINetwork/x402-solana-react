import { useMemo, useState, useRef } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { X402Paywall } from "../components/X402Paywall";
import { PaymentButton } from "../components/PaymentButton";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

// Import wallet adapter styles (must be BEFORE globals.css for proper override)
import "@solana/wallet-adapter-react-ui/styles.css";
type Theme =
  | "solana-light"
  | "solana-dark"
  | "dark"
  | "light"
  | "seeker"
  | "terminal"
  | "seeker-2";

function DemoContent() {
  const { publicKey, signTransaction, disconnect } = useWallet();
  const [currentTheme, setCurrentTheme] = useState<Theme>("solana-light");
  const walletButtonRef = useRef<HTMLDivElement>(null);

  // Theme is now managed entirely within X402Paywall
  // The currentTheme state is just for the demo UI theme switcher

  const walletAdapter = useMemo(() => {
    if (!publicKey || !signTransaction) return null;
    return {
      publicKey,
      signTransaction,
    };
  }, [publicKey, signTransaction]);

  // Theme-based styling configuration (from X402Paywall)
  const getThemeConfig = () => {
    switch (currentTheme) {
      case "solana-dark":
        return {
          container: "",
          card: "!bg-[#171719] border-0 text-white rounded-xl",
          icon: "bg-slate-600",
          title: "",
          button: "bg-solana-gradient hover:opacity-90 text-white rounded-full",
          paymentDetails:
            "bg-[#0000001F] border-slate-600 text-white rounded-lg",
          notice: "bg-amber-900/50 border-amber-700 text-white rounded-lg",
          securityMessage: "text-slate-400",
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
          securityMessage: "text-green-300",
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
          securityMessage: "text-slate-600",
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
          notice: "bg-amber-900/50 border-amber-700 text-white rounded-lg",
          securityMessage: "text-slate-400",
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
          securityMessage: "text-slate-600",
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
          securityMessage: "text-slate-400",
        };
    }
  };

  const themeConfig = getThemeConfig();

  // If no wallet is connected, show a simplified connect prompt
  if (!publicKey) {
    return (
      <>
        {/* Theme Switcher - Floating in top right */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  "solana-light",
                  "solana-dark",
                  "dark",
                  "light",
                  "seeker",
                  "terminal",
                  "seeker-2",
                ] as Theme[]
              ).map((theme) => (
                <Button
                  key={theme}
                  onClick={() => setCurrentTheme(theme)}
                  variant={currentTheme === theme ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${
                    currentTheme === theme
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-center min-h-screen p-4 ${themeConfig.container}`}
          style={
            currentTheme === "dark"
              ? {
                  background:
                    "radial-gradient(circle at center, #ec4899 0%, #3b82f6 50%, #9333ea 100%)",
                }
              : currentTheme === "seeker"
              ? {
                  background: "radial-gradient(25% 200% at 50% 50%, #6CCEC6 0%, rgba(19, 77, 128, 0) 30%), radial-gradient(20% 20% at 50% 100%, rgba(66, 202, 189, 0.8) 0%, rgba(33, 100, 94, 0.8) 0%), linear-gradient(180deg, #001214 5%, #0D2734 100%)",
                }
              : currentTheme === "seeker-2"
              ? {
                  background: "radial-gradient(25% 200% at 50% 50%, #6CCEC6 0%, rgba(19, 77, 128, 0) 30%), radial-gradient(20% 20% at 50% 100%, rgba(66, 202, 189, 0.8) 0%, rgba(33, 100, 94, 0.8) 0%), linear-gradient(180deg, #001214 5%, #0D2734 100%)",
                }
              : undefined
          }
        >
          <Card
            className={`w-full max-w-lg shadow-2xl border-0 ${themeConfig.card}`}
            style={
              currentTheme === "seeker"
                ? { backgroundColor: "#171719" }
                : currentTheme === "seeker-2"
                ? {
                    backgroundColor: "rgba(29, 35, 35, 1)",
                    backdropFilter: "blur(12px)",
                  }
                : undefined
            }
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
                    className={`text-l fw-bold pb-1 ${
                      currentTheme === "dark" ||
                      currentTheme === "solana-dark" ||
                      currentTheme === "seeker" ||
                      currentTheme === "seeker-2"
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    Premium Content XYZ
                  </CardTitle>
                  <CardDescription
                    className={`text-sm font-light ${
                      currentTheme === "terminal"
                        ? "text-green-300"
                        : currentTheme === "seeker" || currentTheme === "seeker-2"
                        ? "text-white"
                        : "text-[#71717A]"
                    }`}
                  >
                    content.xyz
                  </CardDescription>
                </div>
              </div>

              {/* Underline */}
              <div
                className={`border-b mb-6 ${
                  currentTheme === "dark" || currentTheme === "solana-dark"
                    ? "border-slate-600"
                    : currentTheme === "seeker" || currentTheme === "seeker-2"
                    ? ""
                    : "border-slate-200"
                }`}
                style={
                  currentTheme === "seeker" || currentTheme === "seeker-2"
                    ? { borderBottom: "1px solid #FFFFFF1F" }
                    : undefined
                }
              ></div>

              <div className="text-center">
                <h2
                  className={`text-2xl font-normal mb-2 ${
                    currentTheme === "dark" ||
                    currentTheme === "solana-dark" ||
                    currentTheme === "seeker" ||
                    currentTheme === "seeker-2"
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  Payment Required
                </h2>
                <p
                  className={`text-sm font-light ${
                    currentTheme === "dark" ||
                    currentTheme === "solana-dark" ||
                    currentTheme === "seeker" ||
                    currentTheme === "seeker-2"
                      ? "text-white"
                      : "text-slate-600"
                  }`}
                >
                  Access to protected content on base-sepolia. To access this
                  content, please pay $0.01 Base Sepolia USDC
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Payment Details Preview */}
              <div
                className={`p-6 ${themeConfig.paymentDetails}`}
                style={
                  currentTheme === "seeker" || currentTheme === "seeker-2"
                    ? { backgroundColor: "rgba(0, 0, 0, 0.12)" }
                    : currentTheme === "dark" || currentTheme === "solana-dark"
                    ? { boxShadow: "0px 0px 16px 4px #000000 inset" }
                    : undefined
                }
              >
                {/* Amount Section - Top Row */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-sm ${
                      currentTheme === "dark" ||
                      currentTheme === "solana-dark" ||
                      currentTheme === "seeker" ||
                      currentTheme === "seeker-2"
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    Amount
                  </span>
                  <div
                    className={`text-xl font-bold ${
                      currentTheme === "light" || currentTheme === "solana-light"
                        ? "text-purple-600"
                        : currentTheme === "seeker" || currentTheme === "seeker-2"
                        ? ""
                        : "text-[#21ECAB]"
                    }`}
                    style={
                      currentTheme === "seeker" || currentTheme === "seeker-2"
                        ? { color: "#95D2E6" }
                        : undefined
                    }
                  >
                    $0.01
                  </div>
                </div>

                {/* Separator Line */}
                <div
                  className={`border-t mb-4 ${
                    currentTheme === "dark" || currentTheme === "solana-dark"
                      ? "border-slate-600"
                      : currentTheme === "seeker" || currentTheme === "seeker-2"
                      ? ""
                      : "border-slate-200"
                  }`}
                  style={
                    currentTheme === "seeker" || currentTheme === "seeker-2"
                      ? { borderTop: "1px solid #FFFFFF1F" }
                      : undefined
                  }
                ></div>

                {/* Other Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        currentTheme === "dark" ||
                        currentTheme === "solana-dark" ||
                        currentTheme === "seeker" ||
                        currentTheme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      Currency
                    </span>
                    <div
                      className={`text-sm ${
                        currentTheme === "dark" ||
                        currentTheme === "solana-dark" ||
                        currentTheme === "seeker" ||
                        currentTheme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      USDC
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        currentTheme === "dark" ||
                        currentTheme === "solana-dark" ||
                        currentTheme === "seeker" ||
                        currentTheme === "seeker-2"
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      Network
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span
                        className={`text-sm ${
                          currentTheme === "dark" ||
                          currentTheme === "solana-dark" ||
                          currentTheme === "seeker" ||
                          currentTheme === "seeker-2"
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        Solana
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                <span className={`text-sm ${themeConfig.securityMessage}`}>
                  Secure payment powered by Solana
                </span>
              </div>

              {/* Connect Button - using PaymentButton style */}
              <div className="relative">
                {/* Hidden WalletMultiButton to trigger wallet modal */}
                <div ref={walletButtonRef} className="absolute opacity-0 pointer-events-none -z-10">
                  <WalletMultiButton />
                </div>
                <PaymentButton
                  amount={0.01}
                  description="Demo"
                  customText="Connect Wallet"
                  onClick={() => {
                    // Trigger the wallet connection modal
                    const button = walletButtonRef.current?.querySelector('button') as HTMLElement;
                    button?.click();
                  }}
                  className={`w-full h-12 ${
                    currentTheme === "dark" || currentTheme === "solana-dark"
                      ? currentTheme === "dark"
                        ? "bg-[#FFFFFF1F] rounded-full"
                        : "bg-solana-gradient rounded-full"
                      : currentTheme === "terminal"
                      ? "bg-green-400 text-black font-mono rounded-full"
                      : themeConfig.button
                  }`}
                  style={
                    currentTheme === "dark"
                      ? {
                          backgroundColor: "#FFFFFF1F",
                          boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.3) inset",
                        }
                      : currentTheme === "seeker"
                      ? {
                          background: "linear-gradient(0deg, #39A298, #39A298), radial-gradient(101.17% 101.67% at 50.28% 134.17%, rgba(255, 255, 255, 0.6) 0%, rgba(22, 188, 174, 0.6) 100%)",
                          backgroundColor: "transparent",
                        }
                      : currentTheme === "seeker-2"
                      ? {
                          background: "linear-gradient(0deg, #39A298, #39A298), radial-gradient(101.17% 101.67% at 50.28% 134.17%, rgba(255, 255, 255, 0.6) 0%, rgba(22, 188, 174, 0.6) 100%)",
                          backgroundColor: "transparent",
                        }
                      : undefined
                  }
                />
              </div>

              {/* Helper Text */}
              <div className="text-center">
                <p
                  className={`text-sm ${
                    currentTheme === "dark" ||
                    currentTheme === "solana-dark" ||
                    currentTheme === "seeker" ||
                    currentTheme === "seeker-2"
                      ? "text-white"
                      : "text-slate-600"
                  }`}
                >
                  Don't have USDC?{" "}
                  <a
                    href="#"
                    className="font-medium text-[#4ADE80] underline"
                  >
                    Get it here
                    <svg
                      className="inline w-3 h-3 ml-1 text-[#4ADE80]"
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
      </>
    );
  }

  // If wallet is connected, show the paywall directly
  if (!walletAdapter) return null;

  return (
    <>
      {/* Theme Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Theme</h3>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                "solana-light",
                "solana-dark",
                "dark",
                "light",
                "seeker",
                "terminal",
                "seeker-2",
              ] as Theme[]
            ).map((theme) => (
              <Button
                key={theme}
                onClick={() => setCurrentTheme(theme)}
                variant={currentTheme === theme ? "default" : "outline"}
                size="sm"
                className={`text-xs ${
                  currentTheme === theme
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <X402Paywall
        amount={0.01}
        description="Premium Demo Content Access"
        wallet={walletAdapter}
        network="solana"
        theme={currentTheme}
        rpcUrl={`https://mainnet.helius-rpc.com/?api-key=${
          (import.meta as any).env?.VITE_HELIUS_API_KEY || "public"
        }`}
        showBalance={true}
        showNetworkInfo={true}
        onDisconnect={() => {
          console.log("Disconnecting wallet...");
          disconnect();
        }}
        onPaymentSuccess={(txId) => {
          console.log("Payment successful!", txId);
          alert(`Payment successful! Transaction ID: ${txId}`);
        }}
        onPaymentError={(error) => {
          console.error("Payment failed:", error);
          alert(`Payment failed: ${error.message}`);
        }}
      >
        {/* Premium Content */}
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎉 Welcome to Premium!
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 mt-2">
                You've successfully unlocked exclusive content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="bg-gradient-to-r from-emerald-100 via-blue-100 to-purple-100 p-6 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 text-lg">
                  🚀 Premium Features Unlocked:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-700">Advanced Analytics</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">Priority Support</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-slate-700">Exclusive Content</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-slate-700">API Access</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-slate-600">
                  Thank you for supporting our project! Your payment helps us
                  build better Web3 tools.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    Reset Demo
                  </Button>
                  <WalletMultiButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </X402Paywall>
    </>
  );
}

function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  // Theme management is now handled entirely within X402Paywall component
  // Users can simply pass theme="dark" to X402Paywall and it will handle:
  // - Paywall component styling
  // - Wallet modal styling (via body class)
  // - All theme-related logic

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <DemoContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
