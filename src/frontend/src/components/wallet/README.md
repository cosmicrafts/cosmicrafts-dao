# Wallet Component Architecture

This directory contains the components used to build the multi-network, multi-currency cryptocurrency wallet for CosmicRafts.

## Component Structure

The wallet follows a modular component architecture, allowing for easy extensibility and maintenance:

### Core Components

1. **Wallet.vue** - The main wallet page that orchestrates all the components
2. **AccountHeader.vue** - Shows account/network information and balance
3. **TokenList.vue** - Displays all tokens with balances
4. **NetworkSelector.vue** - For switching between different blockchain networks
5. **CurrencySelector.vue** - For changing display currency

### Form Components

1. **SendTokenForm.vue** - Form to send tokens to other accounts
2. **ReceiveTokenInfo.vue** - Shows account/principal ID for receiving tokens
3. **AddTokenForm.vue** - Form to add custom tokens
4. **SwapTokenForm.vue** - Interface for swapping between tokens
5. **BuyTokenForm.vue** - Interface for buying tokens with fiat

### UI Components

1. **ChestOpeningModal.vue** - Animation for opening NFT chests
2. **ActivityLog.vue** - Shows transaction history and wallet activity

## Features

- **Multi-network Support**: ICP, Ethereum, Solana (extensible)
- **Multi-currency Display**: USD, EUR, MXN, INR, GBP, JPY, etc.
- **Multi-account Management**: Create and switch between accounts
- **Local Storage Cache**: Balance/token data cached for performance
- **Real-time Balance Updates**: Periodic refresh of balances

## Data Flow

1. **Authentication** - User identity comes from auth.js store
2. **Network Selection** - Determines which blockchain to interact with
3. **Account Management** - Multiple accounts per network
4. **Token Operations** - Send/receive/swap tokens on selected network

## Adding a New Network

To add support for a new blockchain network:

1. Add the network to the `availableNetworks` array in NetworkSelector.vue
2. Add token support in TokenList.vue's network-specific sections
3. Create network-specific address calculation in AccountHeader.vue
4. Add the network icon mapping in the iconUtils.js file

## Component Interactions

- **AccountHeader** emits events for network/currency/account changes
- **TokenList** shows tokens for the currently selected network
- **Wallet.vue** orchestrates all components and maintains global state

## Asset Management

Icons are managed through the centralized iconUtils system:

1. All icon paths are defined in a single location (src/utils/iconUtils.js)
2. Components use helper functions like `getNetworkIcon()` and `getTokenIcon()`
3. Default fallback icons are provided if a specific icon isn't found

## Future Enhancements

- Transaction History API integration
- Hardware wallet support
- DApp browser integration
- Cross-chain swaps
- Staking/lending integrations 