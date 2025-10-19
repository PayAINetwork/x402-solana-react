// Main components
export { X402Paywall } from './components/X402Paywall';
export { PaymentButton } from './components/PaymentButton';
export { PaymentStatus } from './components/PaymentStatus';
export { WalletSection } from './components/WalletSection';

// UI components
export { Button } from './components/ui/button';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
export { Badge } from './components/ui/badge';
export { Spinner } from './components/ui/spinner';

// Hooks
export { useX402Payment } from './hooks/useX402Payment';
export type { PaymentConfig, UseX402PaymentReturn } from './hooks/useX402Payment';

// Types
export type {
  SolanaNetwork,
  WalletAdapter,
  PaymentStatus,
  X402PaywallProps,
  PaymentButtonProps,
  PaymentStatusProps,
  WalletSectionProps,
  ThemePreset,
  ComponentClassNames,
  ComponentStyles,
  ThemeConfig,
} from './types';

// Utilities
export { cn } from './lib/utils';

// Styles
import './styles/globals.css';
