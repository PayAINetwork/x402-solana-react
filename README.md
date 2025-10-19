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

## 📦 Installation

```bash
npm install x402-solana-react
# or
yarn add x402-solana-react
# or  
pnpm add x402-solana-react
```

## 🎯 Quick Start

```tsx
import { X402Paywall } from 'x402-solana-react';

function App() {
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

```tsx
<X402Paywall
  amount={5.00}
  description="Premium Features"
  wallet={wallet}
  theme="custom"
  classNames={{
    container: "bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-xl",
    button: "bg-white text-purple-600 hover:bg-gray-50 font-bold"
  }}
  customStyles={{
    container: { boxShadow: '0 20px 40px rgba(153, 69, 255, 0.3)' }
  }}
>
  <AdvancedFeatures />
</X402Paywall>
```

## 📚 Documentation

- [API Reference](./docs/API_REFERENCE.md) - Complete API documentation
- [Examples](./examples/) - Usage examples and demos

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

- [x402-solana](../x402-solana/) - Base Solana payment protocol implementation
- [x402](../x402/) - Core x402 payment protocol
- [PayAI Network](https://payai.network) - x402 payment infrastructure

---

Built with ❤️ for the Solana ecosystem