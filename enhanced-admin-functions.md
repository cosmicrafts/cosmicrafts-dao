# Enhanced Admin Functions for Cosmicrafts DAO

This document outlines the enhanced administrative capabilities added to the Cosmicrafts DAO canister.

## New Admin Functions

The following new admin functions have been added to the `AdminFunction` type:

```motoko
public type AdminFunction = {
    // Existing functions
    #CreateMission : (Text, MissionCategory, MissionType, RewardType, Nat, Nat, Nat64);
    #CreateMissionsPeriodically : ();
    #MintChest : (Principal, Nat);
    #BurnToken : (?TypesICRC7.Account, TypesICRC7.Account, TypesICRC7.TokenId, Nat64);
    #GetCollectionOwner : TypesICRC7.Account;
    #GetInitArgs : TypesICRC7.CollectionInitArgs;
    
    // New admin functions
    #MintNFTForPlayer : (Principal, TypesICRC7.MintArgs);
    #UpdatePlayerELO : (Principal, Float);
    #ResetPlayerStats : (Principal);
    #GetPlayerDetails : (Principal);
    #SetSystemParameters : (Text, Nat64); // parameter name and value
    #GetSystemParameters : ();
    #ManageAchievements : (Nat, Text, Text); // achievementId, action, value
    #GetAllTokens : ();
    #GetTransactionHistory : (Principal, Nat); // principal, limit
    #GetMatchParticipants : (MatchID);
    #GetRegisteredUsers : (Nat);
};
```

## Function Descriptions

### NFT Management

- **MintNFTForPlayer**: Mint a new NFT and assign it to a specific player
  - Parameters: `Principal` (player ID), `TypesICRC7.MintArgs` (NFT minting arguments)
  - Returns: Success/failure status and token ID or error message

### Player Management

- **UpdatePlayerELO**: Update a player's ELO rating
  - Parameters: `Principal` (player ID), `Float` (new ELO rating)
  - Returns: Success/failure status and confirmation message

- **ResetPlayerStats**: Reset a player's game statistics
  - Parameters: `Principal` (player ID)
  - Returns: Success/failure status and confirmation message

- **GetPlayerDetails**: Retrieve detailed information about a player
  - Parameters: `Principal` (player ID)
  - Returns: Player profile and statistics

### System Configuration

- **SetSystemParameters**: Update system parameters like time windows and durations
  - Parameters: `Text` (parameter name), `Nat64` (parameter value)
  - Returns: Success/failure status and confirmation message

- **GetSystemParameters**: Retrieve current system parameters
  - Parameters: None
  - Returns: Current system parameters

### Achievement Management

- **ManageAchievements**: Perform operations on achievements (get details, update name, etc.)
  - Parameters: `Nat` (achievement ID), `Text` (action), `Text` (value)
  - Returns: Success/failure status and achievement details or confirmation message

### Data Retrieval

- **GetAllTokens**: Retrieve information about all tokens in the system
  - Parameters: None
  - Returns: List of tokens with their metadata

- **GetTransactionHistory**: Retrieve transaction history for a specific principal
  - Parameters: `Principal` (user ID), `Nat` (limit)
  - Returns: List of transactions

- **GetMatchParticipants**: Retrieve participants for a specific match
  - Parameters: `MatchID` (match ID)
  - Returns: List of participants

- **GetRegisteredUsers**: Retrieve registered users for a specific tournament
  - Parameters: `Nat` (tournament ID)
  - Returns: List of registered users

## Usage Examples

### Minting an NFT for a Player

```motoko
let playerPrincipal = Principal.fromText("abc123...");
let mintArgs = {
    to = { owner = playerPrincipal; subaccount = null };
    token_id = 12345;
    metadata = {
        category = "Character";
        general = {
            name = "Space Warrior";
            description = "A powerful warrior from the Andromeda galaxy";
            image = null;
            rarity = ?3;
            faction = ?1;
            id = 12345;
        };
        basic = ?{
            level = 1;
            health = 100;
            damage = 20;
        };
        skills = null;
        skins = null;
        soul = null;
    };
};

let result = await admin(#MintNFTForPlayer(playerPrincipal, mintArgs));
```

### Updating System Parameters

```motoko
// Update the permitted drift to 5 minutes (in nanoseconds)
let result = await admin(#SetSystemParameters("PERMITTED_DRIFT", 5 * 60 * 1_000_000_000));
```

### Getting Player Details

```motoko
let playerPrincipal = Principal.fromText("abc123...");
let result = await admin(#GetPlayerDetails(playerPrincipal));
```

## Security Considerations

All admin functions are restricted to the authorized admin principal. The canister includes comprehensive logging of all admin operations for audit purposes. 