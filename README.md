# Lazor Kit Examples

A collection of examples and demos showcasing **Lazor Kit SDK** integration across different platforms and frameworks.

## Repository Structure

This is a monorepo containing multiple example projects:

```
lazor-kit-examples/
├── examples/
│   └── mobile/          # React Native mobile wallet demo
├── package.json         # Root package.json with workspace config
├── tsconfig.json        # Shared TypeScript configuration
└── README.md           # This file
```

## Available Examples

### Mobile Wallet Demo

A production-ready Solana mobile wallet built with React Native, Expo Router, and Tailwind CSS (via Uniwind).

**Location:** `examples/mobile/`

**Features:**
- Smart Wallet Integration with WebAuthn passkey authentication
- Token Management (SOL and SPL tokens)
- Send & Receive functionality
- Gasless Transactions via Kora paymaster
- Biometric Security (Face ID/Touch ID/PIN)
- Transaction History
- Address Book
- Devnet Airdrop

**Quick Start:**
```bash
# From root
npm run mobile

# Or from the mobile directory
cd examples/mobile
npm start
```

See [examples/mobile/README.md](./examples/mobile/README.md) for detailed documentation.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- For mobile development:
  - iOS Simulator (macOS) or Android Emulator
  - Expo CLI: `npm install -g expo-cli`

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd lazor-kit-examples
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

   This will install dependencies for the root workspace and all example projects.

### Running Examples

#### Mobile Wallet

```bash
# Start the mobile app
npm run mobile

# Or with specific commands
npm run mobile:dev      # Dev client
npm run mobile:ios      # iOS simulator
npm run mobile:android  # Android emulator
npm run mobile:web      # Web browser
```

#### Alternative: Run from example directory

```bash
cd examples/mobile
npm start
```

## Workspace Commands

The root `package.json` provides convenient scripts to manage the monorepo:

```bash
# Run the mobile example
npm run mobile

# Clean all build artifacts and node_modules
npm run clean

# Reinstall all dependencies
npm run install:all
```

## Adding New Examples

To add a new example project:

1. Create a new directory in `examples/`:
   ```bash
   mkdir examples/your-example-name
   cd examples/your-example-name
   ```

2. Initialize the project:
   ```bash
   npm init -y
   ```

3. Update the package name in `package.json`:
   ```json
   {
     "name": "@lazorkit/example-your-name",
     "version": "1.0.0",
     "private": true
   }
   ```

4. The workspace will automatically pick it up (workspaces: `examples/*`)

5. Add convenience scripts to root `package.json`:
   ```json
   {
     "scripts": {
       "your-example": "npm run start --workspace=@lazorkit/example-your-name"
     }
   }
   ```

6. Update this README with your new example documentation

## Monorepo Benefits

- **Shared Dependencies**: Common dependencies are hoisted to the root
- **Consistent Tooling**: Shared TypeScript config and development tools
- **Easy Cross-Example Development**: Work on multiple examples simultaneously
- **Simplified CI/CD**: Build and test all examples together
- **Better Organization**: Clear separation between different example types

## Project Structure

```
lazor-kit-examples/
├── examples/                    # All example projects
│   └── mobile/                 # Mobile wallet example
│       ├── src/                # Source code
│       ├── assets/             # Images, fonts, etc.
│       ├── package.json        # Mobile-specific dependencies
│       ├── tsconfig.json       # Mobile-specific TS config
│       └── README.md           # Mobile documentation
├── node_modules/               # Shared dependencies (hoisted)
├── package.json                # Root workspace config
├── tsconfig.json               # Base TypeScript config
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Technologies Used

- **npm workspaces** - Monorepo management
- **TypeScript** - Type safety across all examples
- **React Native** - Mobile framework (mobile example)
- **Expo** - React Native development platform
- **Lazor Kit SDK** - Smart wallet integration
- **Solana Web3.js** - Blockchain interactions

## Development Workflow

### Working on a specific example

```bash
# Option 1: Use workspace scripts from root
npm run mobile

# Option 2: Navigate to example and run directly
cd examples/mobile
npm start
```

### Installing dependencies

```bash
# Install a dependency in a specific example
npm install <package> --workspace=@lazorkit/example-mobile

# Or from within the example directory
cd examples/mobile
npm install <package>

# Install a dev dependency at the root level
npm install -D <package> --workspace-root
```

### Cleaning and rebuilding

```bash
# Clean everything
npm run clean

# Reinstall all dependencies
npm run install:all

# Or clean and reinstall specific example
cd examples/mobile
npm run clean
npm install
```

## Troubleshooting

### Metro Bundler Issues (Mobile)
```bash
cd examples/mobile
npx expo start --clear
```

### Hoisting Issues
If a package doesn't work correctly when hoisted, add it to `package.json` nohoist config or install directly in the example.

### TypeScript Errors
```bash
# Check TypeScript errors across all examples
npx tsc --noEmit

# Check specific example
cd examples/mobile
npx tsc --noEmit
```

### Dependency Conflicts
```bash
# Clean and reinstall everything
npm run clean
npm install
```

## Contributing

When contributing new examples:

1. Follow the existing project structure
2. Use the `@lazorkit/example-*` naming convention
3. Include a comprehensive README in your example directory
4. Add TypeScript support
5. Update the root README with your example details
6. Ensure all dependencies are properly declared

## Future Examples

Planned examples to be added:

- [ ] Web wallet (Next.js)
- [ ] Chrome extension wallet
- [ ] React Native CLI example (without Expo)
- [ ] Desktop wallet (Electron)
- [ ] dApp integration examples
- [ ] Multi-wallet support example
- [ ] NFT marketplace integration

## Resources

- **Lazor Docs**: [docs.lazor.io](https://docs.lazor.io)
- **Solana Docs**: [docs.solana.com](https://docs.solana.com)
- **Expo Docs**: [docs.expo.dev](https://docs.expo.dev)
- **npm Workspaces**: [docs.npmjs.com/cli/v8/using-npm/workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)

## Support

For issues related to:
- **Lazor Kit SDK**: Open an issue with the Lazor team
- **Specific examples**: Open an issue in this repository
- **General questions**: Check the example's README for specific guidance

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with Lazor Kit SDK**

*These are demo applications for educational purposes. Use at your own risk for production deployments.*
