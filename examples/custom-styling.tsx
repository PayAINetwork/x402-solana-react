import { X402Paywall } from 'x402-solana-react';
import type { WalletAdapter } from 'x402-solana-react';

// Example: Custom styling with Tailwind and inline styles
function CustomStyledPaywall() {
  const wallet: WalletAdapter = {
    publicKey: {
      toString: () => 'YourWalletAddressHere...',
    },
    signTransaction: async (tx) => tx,
  };

  return (
    <X402Paywall
      amount={5.00}
      description="Premium Features Access"
      wallet={wallet}
      network="solana-devnet"
      theme="custom"
      // Custom Tailwind classes
      classNames={{
        container: 'bg-gradient-to-br from-purple-900 to-blue-900',
        card: 'border-2 border-purple-400 shadow-2xl',
        button: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
        text: 'text-purple-100',
      }}
      // Custom inline styles
      customStyles={{
        container: {
          minHeight: '100vh',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(153, 69, 255, 0.1) 0%, transparent 50%)',
        },
        button: {
          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
        },
      }}
      onPaymentSuccess={(txId) => {
        console.log('Payment successful!', txId);
      }}
    >
      <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
        <h1 className="text-4xl font-bold text-purple-900 mb-4">
          Premium Features Unlocked!
        </h1>
        <p className="text-gray-700">
          You now have access to all premium features.
        </p>
      </div>
    </X402Paywall>
  );
}

export default CustomStyledPaywall;
