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
  const [showPaywall, setShowPaywall] = useState(false);

  const walletAdapter = useMemo(() => {
    if (!publicKey || !signTransaction) return null;
    return {
      publicKey,
      signTransaction,
    };
  }, [publicKey, signTransaction]);

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-solana-gradient bg-clip-text text-transparent">
              x402 Solana React
            </CardTitle>
            <CardDescription className="text-lg">
              Demo Paywall Component
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Connect your Solana wallet to try the demo.
            </p>
            <WalletMultiButton className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPaywall && walletAdapter) {
    return (
      <X402Paywall
        amount={2.50}
        description="Premium Demo Content"
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-purple-900">
                🎉 Premium Content Unlocked!
              </CardTitle>
              <CardDescription>
                You have successfully paid to access this content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                This is the protected content that appears after a successful payment.
              </p>
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">What you get:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Access to premium features</li>
                  <li>✓ Exclusive content</li>
                  <li>✓ Priority support</li>
                  <li>✓ Advanced analytics</li>
                </ul>
              </div>
              <Button 
                onClick={() => setShowPaywall(false)}
                variant="outline"
                className="w-full"
              >
                Back to Demo
              </Button>
            </CardContent>
          </Card>
        </div>
      </X402Paywall>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            x402 Solana React Paywall Demo
          </CardTitle>
          <CardDescription>
            Connected: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Component Features:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Automatic 402 payment handling</li>
              <li>✓ USDC balance display</li>
              <li>✓ Solana network integration</li>
              <li>✓ Custom styling support</li>
              <li>✓ TypeScript type safety</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> Payment simulation only.
              <br />• Real payments require x402 facilitator API
              <br />• USDC balance needed for actual transactions
              <br />• Currently on Solana Devnet
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => setShowPaywall(true)}
              className="flex-1 bg-solana-gradient hover:opacity-90"
            >
              View Paywall Demo
            </Button>
            <WalletMultiButton />
          </div>
        </CardContent>
      </Card>
    </div>
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
