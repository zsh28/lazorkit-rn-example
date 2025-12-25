# Lazor Kit React Native Demo Wallet

A production-ready Solana mobile wallet demo built with **Lazor Kit SDK**, **Expo Router**, and **Tailwind CSS** (via Uniwind). This app demonstrates smart wallet functionality with biometric authentication, gasless transactions, and a beautiful, modern UI.

> **For Developers**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for detailed architecture, patterns, and contribution guidelines.

## Features

### Core Functionality
- **Smart Wallet Integration** - Powered by Lazor Kit SDK with WebAuthn passkey authentication
- **Token Management** - View SOL and all SPL token balances with real-time updates
- **Send & Receive** - Transfer SOL and SPL tokens with intuitive UX
- **Gasless Transactions** - Kora paymaster support for zero-fee transactions on devnet
- **Devnet Airdrop** - Request test SOL directly from the app
- **Hidden Tokens** - Hide unwanted tokens from your main view
- **Address Book** - Save frequently used addresses for quick sending
- **Transaction History** - View recent transactions with full details
- **Session Management** - Auto-logout after 24 hours of inactivity

### Security Features  
- **Biometric Security** - Face ID/Touch ID/PIN app lock with configurable timeout
- **Self-Custodial** - You always control your keys via WebAuthn passkeys
- **No Seed Phrases** - Secure authentication without memorizing 12/24 words
- **Secure Storage** - All sensitive data encrypted with AsyncStorage
- **Session Timeout** - Configurable auto-lock (immediate, 1/5/15/30 min, never)

### User Experience
- **Modern UI** - Built with Tailwind CSS for consistent, beautiful design
- **Smooth Animations** - Moti-powered animations throughout
- **Haptic Feedback** - Tactile responses for all interactions
- **Toast Notifications** - Non-intrusive success/error messages
- **Loading States** - Skeleton loaders and spinners for all async operations
- **Empty States** - Helpful messages when lists are empty

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React Native** | Mobile framework |
| **Expo** | Development platform & build tools |
| **Expo Router** | File-based navigation |
| **Lazor Kit SDK** | Solana smart wallet integration |
| **Solana Web3.js** | Blockchain interactions |
| **Tailwind CSS (Uniwind)** | Styling & theming |
| **TanStack Query** | Data fetching & caching |
| **Moti** | Animations |
| **AsyncStorage** | Local persistence |
| **TypeScript** | Type safety |

## Project Structure

```
src/
├── app/                      # Expo Router screens (file-based routing)
│   ├── _layout.tsx          # Root layout with providers & error boundary
│   ├── index.tsx            # Entry screen with route guard
│   ├── welcome.tsx          # Sign in screen
│   ├── onboarding.tsx       # First-time user onboarding
│   ├── dashboard.tsx        # Main wallet screen
│   ├── send.tsx             # Send tokens screen
│   ├── receive.tsx          # Receive tokens screen
│   ├── settings.tsx         # Settings screen with logout
│   └── transaction-*.tsx    # Transaction screens
│
├── components/               # Reusable components
│   ├── ui/                  # UI primitives (Button, Card, Input, Modal, etc.)
│   ├── wallet/              # Wallet-specific components
│   ├── onboarding/          # Onboarding components
│   └── ErrorBoundary.tsx    # Error boundaries
│
├── hooks/                    # Custom React hooks
│   ├── useTokenBalances.ts        # Token balance queries
│   ├── useSendTransaction.ts      # Send transaction logic
│   ├── useTransactions.ts         # Transaction history
│   ├── useHaptics.ts              # Haptic feedback utility
│   ├── useNavigationWithFeedback.ts  # Navigation with haptics & logging
│   ├── useAddressBook.ts          # Address management
│   ├── useAirdrop.ts              # Devnet SOL airdrop
│   └── useHiddenTokens.ts         # Hide/unhide tokens
│
├── providers/                # React Context providers
│   ├── LazorProvider.tsx         # Wallet connection & session management
│   ├── SecurityProvider.tsx      # Biometric lock & app security
│   └── ToastProvider.tsx         # Toast notifications
│
├── services/                 # Business logic & utilities
│   ├── blockchain/              # Solana blockchain interactions
│   │   └── tokens.ts            # Token metadata & operations
│   ├── formatters/              # Data formatting utilities
│   │   ├── address.ts           # Address formatting
│   │   └── amount.ts            # Token amount formatting
│   ├── logger/                  # Logging service
│   │   └── index.ts             # Logger with analytics hooks
│   ├── platform/                # Platform-specific services
│   │   └── haptics.ts           # Haptic feedback service
│   ├── storage/                 # AsyncStorage wrappers
│   │   ├── addressBook.ts       # Saved addresses
│   │   ├── rpc.ts               # RPC configuration
│   │   ├── session.ts           # Session & activity tracking
│   │   ├── tokens.ts            # Hidden tokens
│   │   └── transactions.ts      # Transaction cache
│   └── validators/              # Input validation
│       ├── address.ts           # Solana address validation
│       ├── amount.ts            # Token amount validation
│       ├── types.ts             # Validation types
│       └── index.ts             # Centralized exports
│
├── types/                    # TypeScript type definitions
│   ├── toast.ts             # Toast notification types
│   ├── tokens.ts            # Token & metadata types
│   ├── transaction.ts       # Transaction types
│   └── wallet.ts            # Wallet types
│
└── constants/                # App configuration
    ├── config.ts            # RPC URLs, app settings
    ├── theme.ts             # Theme colors & values
    └── animations.ts        # Animation configurations
```

## Installation

### Prerequisites
- Node.js 18+ and npm
- iOS Simulator (macOS) or Android Emulator
- Expo CLI: `npm install -g expo-cli`

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd lazor-kit-rn-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Lazor Kit** (Optional)
   
   Update `src/constants/config.ts` with your Lazor client ID:
   ```typescript
   export const LAZOR_CONFIG = {
     cluster: 'devnet' as const,
     clientId: 'your-client-id', // Replace with your Lazor client ID
     redirectUrl: 'lazordemo://connected',
     paymaster: true,
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## Usage

### Dashboard
- View your SOL balance and all SPL tokens
- Pull down to refresh balances
- Tap **Send** or **Receive** for quick actions
- Long-press any token to hide it
- Tap the **gear icon** (⚙) in the top-right to access Settings
- Request airdrop when SOL balance is low (< 0.01)

### Send Transaction
1. Select token from dropdown (SOL or any SPL token)
2. Enter amount (or tap **MAX** for maximum)
3. Enter or select recipient address
4. Review transaction details and fees
5. Tap **Send** and confirm with biometric auth
6. Transaction executes via Lazor SDK

### Receive
- View your full wallet address
- Copy address to clipboard
- Share via native share sheet
- QR code display (placeholder - library not installed)

### Settings
- **Network**: View current network (Devnet)
- **RPC Endpoint**: Configure custom RPC URL or reset to default
- **Biometric Lock**: Toggle Face ID/Touch ID/PIN requirement
- **Session Timeout**: Configure auto-lock timing (immediate, 1/5/15/30 min, never)
- **Hidden Tokens**: View and unhide previously hidden tokens
- **Address Book**: Manage saved addresses
- **Maintenance**: Clear cache to force refresh
- **Wallet**: Logout button to disconnect wallet
- **About**: App version, wallet address, connection status

## Architecture

### Services Layer

The app uses a service-oriented architecture for better code reusability:

**Validation Services** (`src/services/validators/`)
```typescript
import { validateSolanaAddress, validateTokenAmount } from '@/services/validators';

const result = validateSolanaAddress(address);
if (!result.valid) {
  showError(result.error);
}
```

**Logger Service** (`src/services/logger/`)
```typescript
import { logger } from '@/services/logger';

logger.info('User action', { screen: 'Dashboard' });
logger.error('Transaction failed', error);
logger.transaction('send', { amount: 1.5, token: 'SOL' });
```

**Haptics Service** (`src/services/platform/haptics.ts`)
```typescript
import { useHaptics } from '@/hooks/useHaptics';

const { light, success, error } = useHaptics();
// Provides consistent tactile feedback
```

**Navigation with Feedback** (`src/hooks/useNavigationWithFeedback.ts`)
```typescript
import { useNavigationWithFeedback } from '@/hooks/useNavigationWithFeedback';

const { goBack, navigate } = useNavigationWithFeedback();
// Includes haptics and analytics logging
```

### State Management

1. **Server State** (React Query) - Token balances, transactions, blockchain data
2. **Global State** (Context) - Wallet connection, security settings, toasts
3. **Local State** (useState) - Form inputs, UI state

## Configuration

### RPC & Network

Edit `src/constants/config.ts`:

```typescript
export const SOLANA_RPC_URL = clusterApiUrl('devnet');
export const SOLANA_CLUSTER = 'devnet'; // 'devnet' | 'mainnet-beta'
```

### App Settings

```typescript
export const APP_CONFIG = {
  scheme: 'lazordemo',              // Deep link scheme
  airdropThreshold: 0.01,           // Show airdrop when SOL < 0.01
  tokenRefreshInterval: 10000,      // Refresh every 10 seconds
  metadataCacheTTL: 86400000,       // 24 hour cache
  maxRecentRecipients: 10,          // Number of recent addresses
};
```

### Theme Customization

Edit `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { /* Blue palette */ },
        devnet: '#f97316',    // Orange
        success: '#10b981',   // Green
        error: '#ef4444',     // Red
      },
    },
  },
};
```

## Development

### TypeScript Warnings

**IMPORTANT**: You will see TypeScript errors about `className` prop:
```
Property 'className' does not exist on type 'ViewProps'
```

**This is expected and normal** with Uniwind. These are TypeScript warnings, not runtime errors. Uniwind processes `className` at compile/build time and transforms them into React Native StyleSheet objects. Your app will run perfectly despite these warnings.

### Folder Structure Guidelines

1. **Screens** go in `src/app/` (Expo Router convention)
2. **Reusable UI components** go in `src/components/ui/`
3. **Domain-specific components** go in `src/components/{domain}/`
4. **Custom hooks** go in `src/hooks/`
5. **Business logic** goes in `src/services/`
6. **Type definitions** go in `src/types/`

### Adding New Features

1. **Create types** in `src/types/`
2. **Create service** in `src/services/` for business logic
3. **Create hook** in `src/hooks/` for React integration
4. **Create screen** in `src/app/` for UI
5. **Add navigation** from existing screens

Example workflow for adding a "Swap" feature:
```typescript
// 1. Types
// src/types/swap.ts
export interface SwapParams { ... }

// 2. Service  
// src/services/blockchain/swap.ts
export class SwapService { ... }

// 3. Hook
// src/hooks/useSwap.ts
export function useSwap() { ... }

// 4. Screen
// src/app/swap.tsx
export default function SwapScreen() { ... }
```

> See [DEVELOPER_GUIDE.md - Adding New Features](./DEVELOPER_GUIDE.md#adding-new-features) for detailed examples.

## Testing

### Manual Testing Checklist

**Dashboard**
- [ ] Balances load correctly
- [ ] Pull-to-refresh updates data
- [ ] Long-press hides token with confirmation
- [ ] Airdrop button appears when SOL < 0.01
- [ ] Settings button navigates to settings
- [ ] Send/Receive buttons navigate correctly

**Send Screen**
- [ ] Token dropdown shows all tokens
- [ ] Amount validation works (decimals, max balance)
- [ ] MAX button calculates correctly (SOL - 0.001 fee)
- [ ] Address validation catches invalid addresses
- [ ] Recent addresses appear and are clickable
- [ ] Transaction confirmation shows correct details
- [ ] Successful send navigates back

**Receive Screen**
- [ ] Wallet address displays correctly
- [ ] Copy button copies address
- [ ] Share opens native share sheet
- [ ] QR code placeholder appears

**Settings**
- [ ] Network badge shows DEVNET
- [ ] Biometric toggle persists across restarts
- [ ] Hidden tokens list updates when token hidden
- [ ] Unhide button works with confirmation
- [ ] Address book entries display correctly
- [ ] Delete address works with confirmation
- [ ] Clear cache refreshes all data
- [ ] Wallet address copies correctly
- [ ] Connection status badge accurate

### Integration Testing

```bash
# Install Detox (optional)
npm install --save-dev detox

# Run E2E tests
npx detox test
```

## Build & Deploy

### Development Build

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build

```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --profile production --platform ios

# Build for Android
eas build --profile production --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npx expo start --clear
```

### iOS Simulator Issues
```bash
# Reset simulator
xcrun simctl erase all
```

### Android Emulator Issues
```bash
# Clear Gradle cache
cd android && ./gradlew clean
```

### Dependency Conflicts
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
- Most `className` errors are expected (Uniwind)
- Check `tsconfig.json` for proper paths
- Run `npx tsc --noEmit` to check for real errors

## Architecture Decisions

### Why Uniwind over NativeWind?
- Uniwind is already configured and working
- Provides centralized theming with `tailwind.config.js`
- Compile-time processing for better performance
- Works seamlessly with Expo Router

### Why TanStack Query?
- Automatic caching and background refetching
- Built-in loading and error states
- Query invalidation for data consistency
- Optimistic updates for better UX

### Why Moti for Animations?
- Declarative API similar to Framer Motion
- Built on Reanimated 2 for native performance
- Easy spring animations and transitions
- Works well with React Native components

### Why Expo Router?
- File-based routing (like Next.js)
- Deep linking out of the box
- Type-safe navigation
- Easier to maintain than React Navigation

## Roadmap

### Planned Features
- [ ] Transaction history with filtering
- [ ] Token detail pages with price charts
- [ ] Network switching (Devnet ↔ Mainnet)
- [ ] Onboarding flow for new users
- [ ] QR code scanning for addresses
- [ ] Multi-wallet support
- [ ] NFT gallery and management
- [ ] Staking interface
- [ ] DApp browser
- [ ] Push notifications

### Future Enhancements
- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] Price alerts
- [ ] Portfolio analytics
- [ ] Transaction notes
- [ ] Recurring payments
- [ ] Spending limits
- [ ] Widget for iOS/Android home screen

### Code Style

- **TypeScript** for all new code
- **Follow existing patterns** - See DEVELOPER_GUIDE.md
- **JSDoc comments** for all public APIs
- **Validation services** for all user input
- **Logger service** instead of console.log
- **Keep components under 300 lines** - extract sub-components
- **Use TailwindCSS classes** via `className` prop

### Key Principles

1. **Separation of Concerns** - Keep business logic in services, not components
2. **Type Safety** - Avoid `any` types, use explicit interfaces
3. **Reusability** - Extract common patterns into hooks and services
4. **Documentation** - Add comments explaining "why" not "what"
5. **Testing** - Write tests for critical business logic (coming soon)

See [DEVELOPER_GUIDE.md - Code Style Guidelines](./DEVELOPER_GUIDE.md#code-style-guidelines) for detailed standards.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Lazor Kit** - Smart wallet infrastructure
- **Expo Team** - Amazing development platform
- **Solana Foundation** - Blockchain infrastructure
- **Uniwind** - Tailwind CSS integration
- **TanStack** - Query library

## Support

- **Lazor Docs**: [docs.lazor.io](https://docs.lazor.io)
- **Expo Docs**: [docs.expo.dev](https://docs.expo.dev)

---

**Built with ❤️ using Lazor Kit SDK**

*This is a demo application for educational purposes. Use at your own risk for production deployments.*
