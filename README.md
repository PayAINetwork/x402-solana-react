# x402 Solana React Paywall

A reusable React component library that provides drop-in paywall functionality for Solana-based applications using the x402 payment protocol.

## 🚀 Features

- ✅ **Drop-in React Components**: Easy integration with existing apps
- ✅ **Solana Native**: Built specifically for Solana blockchain
- ✅ **Multi-Wallet Support**: Works with Phantom, Solflare, and more  
- ✅ **Tailwind CSS**: Utility-first styling with customization
- ✅ **shadcn/ui**: Accessible, beautiful components
- ✅ **TypeScript**: Full type safety and IntelliSense
- ✅ **Solana Theming**: Beautiful purple/green gradients by default

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **React**: v18.0.0 or higher
- **Solana Wallet**: Phantom, Solflare, or any Solana wallet adapter compatible wallet
- **USDC Balance**: For mainnet payments (devnet for testing)

## 📦 Installation

```bash
npm install x402-solana-react
# or
yarn add x402-solana-react
# or  
pnpm add x402-solana-react
```

### Install Peer Dependencies

You'll also need Solana wallet adapter packages:

```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

## ⚙️ Setup

### 1. Import Styles

Import the component styles in your main file (e.g., `main.tsx` or `App.tsx`):

```tsx
import 'x402-solana-react/styles';
```

### 2. Wallet Provider Setup

Wrap your app with Solana wallet providers:

```tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* Your app components */}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

## 🎯 Quick Start

```tsx
import { X402Paywall } from 'x402-solana-react';
import { useWallet } from '@solana/wallet-adapter-react';

function PremiumPage() {
  const wallet = useWallet();

  return (
    <X402Paywall
      amount={2.50}
      description="Premium AI Chat Access"
      wallet={wallet}
      network="solana-devnet"
      onPaymentSuccess={(txId) => console.log('Payment successful!', txId)}
    >
      <PremiumContent />
    </X402Paywall>
  );
}
```

## 🎨 Custom Styling

The component comes with built-in Solana-themed styles. You can customize using props:

```tsx
<X402Paywall
  amount={5.00}
  description="Premium Features"
  wallet={wallet}
  theme="seeker-2"
  classNames={{
    container: "bg-gradient-to-r from-purple-600 to-blue-600",
    button: "bg-white text-purple-600 hover:bg-gray-50 font-bold"
  }}
  customStyles={{
    button: { boxShadow: '0 10px 30px rgba(153, 69, 255, 0.4)' }
  }}
>
  <AdvancedFeatures />
</X402Paywall>
```

## 📚 API Reference

### X402Paywall Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `amount` | `number` | ✅ | - | Payment amount in USD |
| `description` | `string` | ✅ | - | Payment description |
| `wallet` | `WalletAdapter` | ✅ | - | Solana wallet adapter instance |
| `network` | `'solana' \| 'solana-devnet'` | ❌ | `'solana-devnet'` | Network to use |
| `rpcUrl` | `string` | ❌ | - | Custom RPC URL |
| `treasuryAddress` | `string` | ❌ | - | Custom treasury address |
| `facilitatorUrl` | `string` | ❌ | - | Custom facilitator URL |
| `theme` | `'solana' \| 'dark' \| 'light' \| 'seeker-2'` | ❌ | `'solana'` | Visual theme |
| `showBalance` | `boolean` | ❌ | `true` | Show wallet balance |
| `showNetworkInfo` | `boolean` | ❌ | `true` | Show network info |
| `maxPaymentAmount` | `number` | ❌ | - | Maximum payment amount |
| `onPaymentSuccess` | `(txId: string) => void` | ❌ | - | Success callback |
| `onPaymentError` | `(error: Error) => void` | ❌ | - | Error callback |

See [full API documentation](./docs/API_REFERENCE.md) for complete reference.

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/payainetwork/x402-solana-react.git
cd x402-solana-react

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your Helius API key

# Start development server
npm run dev
```

### Build

```bash
# Build library
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

## 🐛 Troubleshooting

### Common Issues

**"Wallet not connected"**
- Ensure wallet provider is properly configured
- Check that wallet extension is installed and unlocked
- Verify network matches (mainnet vs devnet)

**"Insufficient USDC balance"**
- Check wallet has enough USDC for payment + gas
- On devnet: Use [Solana Faucet](https://faucet.solana.com/) for SOL
- Get devnet USDC from test token faucets like [Circle](https://faucet.circle.com/)

**"RPC rate limit exceeded"**
- Add Helius API key to `.env` file
- Use custom RPC URL via `rpcUrl` prop

**"Transaction failed"**
- Verify network connectivity
- Check Solana network status
- Ensure sufficient SOL for transaction fees

**Styling not working**
- Make sure you imported `x402-solana-react/styles` in your main file
- Check browser console for CSS loading errors

## ✅ Status

**Ready for Production** - Fully functional x402 paywall components with PayAI facilitator integration.

### Features Complete
- ✅ Core paywall component with Solana integration
- ✅ Payment processing via x402 protocol
- ✅ Multi-wallet support (Phantom, Solflare, etc.)
- ✅ Beautiful Solana-themed UI with Tailwind CSS
- ✅ TypeScript support with full type safety
- ✅ Devnet integration with PayAI facilitator
- ✅ Responsive design and accessibility

## 🤝 Contributing

This project is currently in early development. Contributions welcome!

## 📄 License

MIT License

## 🔗 Related Projects

- [x402-solana](https://github.com/payainetwork/x402-solana) - Base Solana payment protocol implementation
- [x402](https://github.com/payainetwork/x402) - Core x402 payment protocol
- [PayAI Network](https://payai.network) - x402 payment infrastructure

---

Built with ❤️ for the Solana ecosystem