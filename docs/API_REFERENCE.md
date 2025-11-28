# API Reference

## Components

### X402Paywall

The main paywall component that wraps protected content.

```tsx
<X402Paywall
  amount={number}
  description={string}
  wallet={WalletAdapter}
  network?={'solana' | 'solana-devnet'}
  treasuryAddress?={string}
  facilitatorUrl?={string}
  theme?={'solana' | 'dark' | 'light' | 'seeker-2'}
  showBalance?={boolean}
  showNetworkInfo?={boolean}
  showPaymentDetails?={boolean}
  classNames?={ComponentClassNames}
  customStyles?={ComponentStyles}
  maxPaymentAmount?={number}
  onPaymentStart?={() => void}
  onPaymentSuccess?={(txId: string) => void}
  onPaymentError?={(error: Error) => void}
  onWalletConnect?={(address: string) => void}
>
  {children}
</X402Paywall>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `amount` | `number` | **required** | Payment amount in USD |
| `description` | `string` | **required** | Description of what the payment is for |
| `wallet` | `WalletAdapter` | **required** | Solana wallet adapter |
| `network` | `'solana' \| 'solana-devnet'` | `'solana-devnet'` | Solana network to use |
| `treasuryAddress` | `string` | `undefined` | Treasury wallet address for payments |
| `facilitatorUrl` | `string` | `undefined` | x402 facilitator service URL |
| `rpcUrl`| `string` | `undefined` | Custom RPC URL (recommended to avoid rate limits) |
| `apiEndpoint` | `string` | `https://x402.payai.network/api/solana/paid-content` | Custom API endpoint |
| `logoUrl` | `string` | - | Custom logo URL to display |
| `autoSetupProviders` | `boolean` | `true` | Automatically setup wallet providers |
| `providerNetwork` | `WalletAdapterNetwork` | `undefined` | Network for auto-setup providers |
| `providerEndpoint` | `string` | `undefined` | Custom endpoint for auto-setup providers |
| `theme` | `'solana' \| 'dark' \| 'light' \| 'seeker-2'` | `'solana'` | Visual theme preset |
| `showBalance` | `boolean` | `true` | Show wallet balance |
| `showNetworkInfo` | `boolean` | `true` | Show network information |
| `showPaymentDetails` | `boolean` | `true` | Show payment amount details |
| `classNames` | `ComponentClassNames` | `{}` | Custom Tailwind classes |
| `customStyles` | `ComponentStyles` | `{}` | Custom inline CSS styles |
| `maxPaymentAmount` | `number` | `undefined` | Maximum allowed payment amount |
| `onPaymentStart` | `() => void` | `undefined` | Callback when payment starts |
| `onPaymentSuccess` | `(txId: string) => void` | `undefined` | Callback when payment succeeds |
| `onPaymentError` | `(error: Error) => void` | `undefined` | Callback when payment fails |
| `onWalletConnect` | `(address: string) => void` | `undefined` | Callback when wallet connects |
| `onDisconnect`| `() => void` | `undefined` | Callback when wallet disconnects |

---

### PaymentButton

Standalone payment button component.

```tsx
<PaymentButton
  amount={number}
  description={string}
  onClick?={() => void}
  disabled?={boolean}
  loading?={boolean}
  className?={string}
  style?={React.CSSProperties}
/>
```

---

### PaymentStatus

Payment status indicator component.

```tsx
<PaymentStatus
  status={'idle' | 'connecting' | 'pending' | 'success' | 'error'}
  message?={string}
  progress?={number}
  className?={string}
  style?={React.CSSProperties}
/>
```

---

### WalletSection

Wallet information display component.

```tsx
<WalletSection
  wallet?={WalletAdapter}
  balance?={string}
  network?={'solana' | 'solana-devnet'}
  showBalance?={boolean}
  className?={string}
  style?={React.CSSProperties}
/>
```

---

## Hooks

### useX402Payment

Hook for managing x402 payments.

```tsx
const {
  pay,
  isLoading,
  status,
  error,
  transactionId,
  reset
} = useX402Payment({
  wallet,
  network,
  treasuryAddress?,
  facilitatorUrl?,
  maxPaymentAmount?
});
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `pay` | `(amount: number, description: string) => Promise<string \| null>` | Function to initiate payment |
| `isLoading` | `boolean` | Whether payment is in progress |
| `status` | `PaymentStatusType` | Current payment status |
| `error` | `Error \| null` | Payment error if any |
| `transactionId` | `string \| null` | Transaction ID if successful |
| `reset` | `() => void` | Reset payment state |

---

## Types

### WalletAdapter

```typescript
interface WalletAdapter {
  publicKey?: { toString(): string };
  address?: string;
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}
```

### ComponentClassNames

```typescript
interface ComponentClassNames {
  container?: string;
  button?: string;
  card?: string;
  text?: string;
  status?: string;
  spinner?: string;
}
```

### ComponentStyles

```typescript
interface ComponentStyles {
  container?: React.CSSProperties;
  button?: React.CSSProperties;
  card?: React.CSSProperties;
  text?: React.CSSProperties;
  status?: React.CSSProperties;
  spinner?: React.CSSProperties;
}
```

### PaymentStatusType

```typescript
type PaymentStatusType = 'idle' | 'connecting' | 'pending' | 'success' | 'error';
```

### SolanaNetwork

```typescript
type SolanaNetwork = 'solana' | 'solana-devnet';
```

---

## Styling

### Theme Presets

- **solana**: Purple/green gradient with Solana branding (default)
- **dark**: Dark theme with Solana accents
- **light**: Light theme with subtle Solana colors
- **seeker-2**: Fully customizable via `classNames` and `customStyles`

### Custom Styling

You can customize the appearance using:

1. **Tailwind classes** via `classNames` prop
2. **Inline styles** via `customStyles` prop
3. **Theme preset** via `theme` prop

Example:

```tsx
<X402Paywall
  classNames={{
    container: "bg-purple-900",
    button: "bg-gradient-to-r from-pink-500 to-purple-500"
  }}
  customStyles={{
    container: { minHeight: '100vh' },
    button: { boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)' }
  }}
  theme="seeker-2"
  {...otherProps}
/>
```

---

## Solana Colors

The library includes Solana brand colors in Tailwind:

```css
--solana-primary: #9945FF
--solana-secondary: #14F195
--solana-dark: #000212
--solana-success: #00D18C
--solana-error: #FF6B6B
--solana-warning: #FFB800
```

Use in Tailwind: `bg-solana-primary`, `text-solana-secondary`, `border-solana-success`, etc.

Use gradients: `bg-solana-gradient`, `bg-solana-gradient-vertical`, `bg-solana-gradient-radial`
