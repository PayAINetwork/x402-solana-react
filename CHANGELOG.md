# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-canary.1] - 2025-06-XX

### ⚠️ BREAKING CHANGES

This release upgrades to x402 protocol v2 via the new `x402-solana` package.

### Changed

- **Protocol Version**: Upgraded from x402 v1 to v2 (via `x402-solana`)
- **Dependency**: Now uses `x402-solana` for payment handling
- **Payment Header**: Internally uses `PAYMENT-SIGNATURE` instead of `X-PAYMENT` (handled automatically)
- **Network Format**: Uses CAIP-2 internally (`solana:chainId`) - simple names (`solana`, `solana-devnet`) still work in props

### Added

- **Verbose Logging**: Added optional `verbose` prop for debugging payment flows
- **Response Content**: `onPaymentSuccess` callback now receives optional `responseContent` parameter with server response
- **v2 Protocol Support**: Full support for x402 v2 protocol features:
  - CAIP-2 network identifiers (converted automatically from simple names)
  - `PAYMENT-SIGNATURE` header (v2 standard)
  - `PAYMENT-RESPONSE` header parsing for transaction details

### Compatibility

The component API remains largely unchanged. Your existing code should work without modifications:

```tsx
// This still works exactly as before
<X402Paywall
  amount={0.01}
  description="Premium Content"
  network="solana-devnet" // Simple format still works
>
  <YourContent />
</X402Paywall>
```

### What's New in x402 v2

The underlying x402 protocol v2 brings several improvements:

| Feature               | v1                        | v2                                        |
| --------------------- | ------------------------- | ----------------------------------------- |
| **Network Format**    | `solana`, `solana-devnet` | CAIP-2 (`solana:chainId`)                 |
| **Payment Header**    | `X-PAYMENT`               | `PAYMENT-SIGNATURE`                       |
| **Amount Field**      | `maxAmountRequired`       | `amount`                                  |
| **Payload Structure** | Flat                      | Includes `resource` and `accepted` fields |

For more details, see the [x402-solana CHANGELOG](https://github.com/payainetwork/x402-solana/blob/main/CHANGELOG.md).

### Migration from v1.x

If you're upgrading from a v1.x version:

1. **Update dependency**: `npm install @payai/x402-solana-react@latest`
2. **No code changes required** for basic usage - the component handles v2 internally
3. **Optional**: Use the new `verbose` prop for debugging:

```tsx
<X402Paywall
  amount={0.01}
  description="Debug payment"
  network="solana-devnet"
  verbose // Enable debug logging
>
  <Content />
</X402Paywall>
```

---

## [1.0.0]

Initial release with x402 v1 support.

### Features

- Drop-in React paywall component for Solana
- Multiple theme presets (light, dark, solana, seeker, terminal)
- Auto-setup wallet providers
- TypeScript support with full type safety
- Tailwind CSS styling with customization options
- Support for Phantom, Solflare, and other Solana wallets
