import { useState, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { X402Paywall } from '../components/X402Paywall';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

function DemoContent() {
  const { publicKey, signTransaction } = useWallet();

  const walletAdapter = useMemo(() => {
    if (!publicKey || !signTransaction) return null;
    return {
      publicKey,
      signTransaction,
    };
  }, [publicKey, signTransaction]);

  // If no wallet is connected, show a simplified connect prompt
  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md mx-auto">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-solana-gradient bg-clip-text text-transparent">
              x402 Solana React
            </h1>
            <p className="text-xl text-slate-300">
              Seamless Web3 Paywall Component
            </p>
            <p className="text-slate-400 text-sm">
              Connect your wallet to experience the demo paywall
            </p>
          </div>

          {/* Features */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold text-slate-200 mb-4">Features</h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-solana-secondary rounded-full"></div>
                <span>USDC Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-solana-secondary rounded-full"></div>
                <span>Balance Display</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-solana-secondary rounded-full"></div>
                <span>TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-solana-secondary rounded-full"></div>
                <span>Custom Themes</span>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <WalletMultiButton className="!bg-solana-gradient hover:!opacity-90 !border-0 !text-white font-semibold !py-3 !px-8 !rounded-xl" />
        </div>
      </div>
    );
  }

  // If wallet is connected, show the paywall directly
  return (
    <X402Paywall
      amount={1}
      description="Premium Demo Content Access"
      wallet={walletAdapter}
      network="solana-devnet"
      showBalance={true}
      showNetworkInfo={true}
      onPaymentSuccess={(txId) => {
        console.log('Payment successful!', txId);
        alert(`Payment successful! Transaction ID: ${txId}`);
      }}
      onPaymentError={(error) => {
        console.error('Payment failed:', error);
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
              <h3 className="font-semibold text-slate-800 mb-4 text-lg">🚀 Premium Features Unlocked:</h3>
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
                Thank you for supporting our project! Your payment helps us build better Web3 tools.
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
  );
}

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <DemoContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
