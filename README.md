To run the project, you need to install the Internet Computer SDK.

```bash
curl -sL https://internetcomputer.org/install.sh | sh
```


Initialize the project.
```bash
git clone https://github.com/cosmicrafts/cosmicrafts-dao.git
cd cosmicrafts-dao
chmod +x init.sh
./init.sh
```

# Cosmicrafts Backend Documentation

## Overview
The Cosmicrafts canister is a comprehensive backend for a blockchain-based gaming application on the Internet Computer. It combines game mechanics, player management, NFT functionality (ICRC-7 token standard), cryptocurrency features (ICRC-1 token standard), missions, achievements, and social features in a single canister.

## Architecture

The canister's architecture is organized into several key components:

1. **Core Game Functionality**
   - Player management
   - Game mechanics (matchmaking, game statistics)
   - Tournaments

2. **Token Standards**
   - ICRC-1 fungible token implementation
   - ICRC-7 NFT implementation

3. **Achievement & Mission System**
   - Daily/weekly missions
   - Achievement tracking
   - Rewards distribution

4. **Social Features**
   - Friend management
   - Notifications

5. **Admin Tools**
   - Mission creation
   - NFT minting/burning
   - Configuration management

## State Management

The canister maintains state through a combination of stable variables and HashMaps:

1. **Stable Variables**
   - Player data, missions, achievements, NFT ownership, etc.
   - These are preserved across canister upgrades

2. **HashMaps**
   - Used for runtime operations with efficient lookup
   - Serialized to stable variables during upgrades

## Key Functionality

### Player Management
- Player registration and profile management
- Friend request system with privacy settings
- Player statistics tracking

### NFT System (ICRC-7)
- Minting game NFTs with various attributes
- NFT upgrades with level-based enhancement
- Token ownership and transfer capabilities
- Token approval system for third-party transfers

### Token System (ICRC-1)
- Standard token implementation
- Used for in-game currency (Stardust)
- Transaction management with archive support

### Game Mechanics
- Match creation and status tracking
- Game statistics collection and analysis
- Player progress and ranking

### Missions & Achievements
- Time-based mission generation (hourly, daily, weekly)
- Achievement tracking across different categories
- Reward distribution for completed missions and achievements

## NFT Upgrade System

One of the core features is the NFT upgrade system:

1. **Upgrade Process**
   - The `upgradeNFT` function allows users to enhance their NFTs
   - Requires ownership verification of the NFT
   - Calculates cost based on current level using `Utils.calculateCost`
   - Burns tokens for the upgrade cost
   - Enhances NFT attributes (health and damage increased by 10%)
   - Updates achievements

2. **Cost Calculation**
   - The cost increases by approximately 33% per level
   - Implemented in `Utils.calculateCost` function

3. **Transaction Recording**
   - NFT upgrades are recorded in the canister's transaction history
   - The transaction type is marked as `#upgrade`

## Persistence During Upgrades

The canister implements comprehensive upgrade hooks:

1. **preupgrade**
   - Serializes all HashMaps to stable variables
   - Preserves canistergeek monitoring data
   - Ensures no state is lost during upgrades

2. **postupgrade**
   - Restores HashMaps from stable variables
   - Resets monitoring and logging configuration
   - Initializes any new data structures

## Achievement System

The achievement system tracks player progress:

1. **Achievement Types**
   - Individual achievements for specific actions
   - Achievement lines (collections of related achievements)
   - Achievement categories (broader groupings)

2. **Progress Tracking**
   - `updateUpgradeNFTAchievement` for tracking NFT upgrades
   - Similar functions for tracking friend additions, avatar changes, etc.
   - Progress manager for game-related achievements

3. **Reward Claiming**
   - Players can claim rewards for completed achievements
   - Rewards include tokens, NFTs, or in-game items

## Monitoring and Logging

The canister uses Canistergeek for comprehensive monitoring:

1. **Metrics Collection**
   - Tracks resource usage and performance
   - Monitors critical operations

2. **Logging**
   - Detailed logging of important operations
   - Error tracking and debugging support
   - Limited to 3000 messages to manage memory usage

## Security Measures

1. **Authorization**
   - Admin functions restricted to authorized principals
   - Owner-only NFT operations
   - Rate limiting for sensitive operations

2. **Transaction Validation**
   - Time-based duplicate transaction prevention
   - Ownership verification for NFT operations
   - Proper balance checking for token transfers

## Mission System

1. **Mission Types**
   - Hourly, daily, weekly missions
   - Achievement-based missions
   - Free reward missions

2. **Mission Generation**
   - Random selection from templates
   - Scheduled generation using Timer functionality
   - Shuffled indices to ensure variety

3. **Mission Completion**
   - Progress tracking for each mission type
   - Reward distribution upon completion

## Conclusion

The Cosmicrafts canister is a sophisticated smart contract that implements a complete gaming ecosystem on the Internet Computer blockchain. It combines token standards with game mechanics, social features, and achievement systems to create an engaging player experience. The canister's architecture ensures data persistence across upgrades while providing efficient runtime operations.

Key innovations include the NFT upgrade system with level-based enhancements, the comprehensive achievement tracking system, and the integration of multiple token standards within a single canister. 


### License

MIT License

Copyright (c) 2024 World of Unreal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# Federation Missions System

This module implements a WoW Garrison-style mission system for Cosmicrafts DAO, where users join a global federation and take on community missions.

## Key Features

- **Global Mission Board**: Unlike personal missions, these are federation-wide with limited slots
- **Real-time Competition**: Players can see other commanders working on the same missions
- **Tiered Rewards**: Mission rewards scale based on rarity and difficulty
- **Time-based Mechanics**: Missions have set durations, creating a check-in gameplay loop

## Components

### Frontend

- **FederationMissions.vue**: Main mission board interface showing available missions
- **FederationMissionCard.vue**: Individual mission display with requirements and rewards
- **MissionsSection.vue**: Integration into existing missions interface

### Backend

- **federation_missions.mo**: Separate canister to handle mission data and gameplay

## Implementation Notes

The Federation Missions system is designed to create an immediate engagement loop in the first minute of gameplay, followed by longer-term engagement through progressively unlocked content. Key elements:

1. **First-minute engagement**: Quick missions with fast rewards keep new users hooked
2. **Community competition**: Limited slots create urgency (FOMO)
3. **Progressive difficulty**: Starter missions lead to more complex, rewarding tasks
4. **Visual feedback**: Rarity tiers and time countdowns drive engagement

## Setup Instructions

1. Deploy the federation_missions canister:
   ```
   dfx deploy federation_missions
   ```

2. Initialize with starter missions:
   ```
   dfx canister call federation_missions initialize
   ```

3. Frontend will automatically connect to the canister and display available missions.

## Next Steps

- Add inter-canister calls to synchronize rewards with the main backend
- Implement mission-specific requirements (ship types, items, etc.)
- Create mission chains where completing one unlocks related missions
- Add mission outcomes with narrative elements
