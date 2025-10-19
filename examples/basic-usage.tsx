import { X402Paywall } from 'x402-solana-react';
import type { WalletAdapter } from 'x402-solana-react';

// Example: Basic usage with mock wallet
function App() {
  // Your wallet from wallet adapter or other provider
  const wallet: WalletAdapter = {
    publicKey: {
      toString: () => 'YourWalletAddressHere...',
    },
    signTransaction: async (tx) => {
      // Wallet signing logic
      return tx;
    },
  };

  return (
    <X402Paywall
      amount={2.50}
      description="Premium AI Chat Access"
      wallet={wallet}
      network="solana-devnet"
      onPaymentSuccess={(txId) => {
        console.log('Payment successful!', txId);
      }}
      onPaymentError={(error) => {
        console.error('Payment failed:', error);
      }}
    >
      {/* Your protected content goes here */}
      <div className="p-8">
        <h1 className="text-3xl font-bold">Premium Content</h1>
        <p>This content is only visible after payment.</p>
      </div>
    </X402Paywall>
  );
}

export default App;
