# Lazor Kit React Native Demo Wallet

A production-ready Solana mobile wallet demo built with **Lazor Kit SDK**, **Expo Router**, and **Tailwind CSS** (via Uniwind). This app demonstrates smart wallet functionality with biometric authentication, gasless transactions, and a beautiful, modern UI.

## Features

### Core Functionality
- **Smart Wallet Integration** - Powered by Lazor Kit SDK with biometric authentication
- **Token Management** - View SOL and all SPL token balances with real-time updates
- **Send & Receive** - Transfer SOL and SPL tokens with intuitive UX
- **Gasless Transactions** - Optional paymaster support for zero-fee transactions
- **Devnet Airdrop** - Request test SOL directly from the app
- **Hidden Tokens** - Hide unwanted tokens from your main view
- **Address Book** - Save frequently used addresses for quick sending

### Advanced Features
- **Biometric Security** - Face ID/Touch ID app lock
- **Pull-to-Refresh** - Refresh balances with native pull gesture
- **Auto-Refresh** - Token balances update every 10 seconds
- **Recent Recipients** - Quick access to recently used addresses
- **QR Code Sharing** - Share wallet address via QR code (placeholder)
- **Transaction Validation** - Smart amount and address validation
- **Error Handling** - Comprehensive error states and retry logic

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
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout with providers
│   ├── index.tsx            # Dashboard (210 lines)
│   ├── send.tsx             # Send screen (330 lines)
│   ├── receive.tsx          # Receive screen (150 lines)
│   └── settings.tsx         # Settings screen (293 lines)
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── IconButton.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   └── wallet/              # Wallet-specific components
│       ├── BalanceCard.tsx
│       ├── NetworkBadge.tsx
│       ├── QuickActions.tsx
│       ├── TokenDropdown.tsx
│       └── TokenListItem.tsx
├── hooks/                   # Custom React hooks
│   ├── useAddressBook.ts   # Address management
│   ├── useAirdrop.ts       # Devnet SOL airdrop
│   ├── useHiddenTokens.ts  # Hide/unhide tokens
│   ├── useSendTransaction.ts # Transaction sending
│   └── useTokenBalances.ts # Token balance queries
├── providers/               # React Context providers
│   ├── LazorProvider.tsx   # Lazor SDK wrapper
│   ├── SecurityProvider.tsx # Biometric auth
│   └── ToastProvider.tsx   # Toast notifications
├── services/                # Business logic & utilities
│   ├── blockchain/
│   │   └── tokens.ts       # Solana RPC interactions
│   ├── formatters/
│   │   ├── address.ts      # Address formatting
│   │   └── amount.ts       # Token amount parsing
│   └── storage/
│       ├── addressBook.ts  # Address persistence
│       └── tokens.ts       # Hidden tokens storage
├── types/                   # TypeScript type definitions
│   ├── toast.ts
│   ├── tokens.ts
│   ├── transaction.ts
│   └── wallet.ts
├── constants/               # App configuration
│   ├── animations.ts       # Moti animation configs
│   ├── config.ts           # RPC URLs, intervals
│   └── theme.ts            # Color constants
└── global.css              # Tailwind directives

Config Files:
├── app.json                # Expo configuration
├── tailwind.config.js      # Custom Lazor theme
├── metro.config.js         # Metro bundler config
└── tsconfig.json           # TypeScript config
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
- **Biometric Lock**: Toggle Face ID/Touch ID requirement
- **Hidden Tokens**: View and unhide previously hidden tokens
- **Address Book**: Manage saved addresses
- **Clear Cache**: Force refresh all cached data
- **About**: App version, wallet address, connection status

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

### Adding a New Screen

1. Create file in `src/app/` (e.g., `src/app/history.tsx`)
2. Export default React component
3. Use existing hooks and components
4. Navigate with `router.push('/history')`

Example:
```typescript
// src/app/history.tsx
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function HistoryScreen() {
  const router = useRouter();
  
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold">Transaction History</Text>
    </View>
  );
}
```

### Creating a Custom Hook

Example pattern used throughout the app:

```typescript
// src/hooks/useExample.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useExample() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['example'],
    queryFn: async () => {
      // Fetch data
    },
    staleTime: 60000,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Mutate data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['example'] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    mutate: mutation.mutate,
  };
}
```

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

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing patterns for hooks and components
- Use Tailwind CSS classes (via `className` prop)
- Add JSDoc comments for public functions
- Keep components under 300 lines

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Lazor Kit** - Smart wallet infrastructure
- **Expo Team** - Amazing development platform
- **Solana Foundation** - Blockchain infrastructure
- **Uniwind** - Tailwind CSS integration
- **TanStack** - Query library

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/lazor-kit-rn-demo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/lazor-kit-rn-demo/discussions)
- **Lazor Docs**: [docs.lazor.io](https://docs.lazor.io)
- **Expo Docs**: [docs.expo.dev](https://docs.expo.dev)

---

**Built with ❤️ using Lazor Kit SDK**

*This is a demo application for educational purposes. Use at your own risk for production deployments.*
