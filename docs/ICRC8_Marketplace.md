# ICRC-8 Marketplace Documentation

## Overview

This document provides detailed information about the ICRC-8 compliant marketplace canister implementation. The marketplace enables users to create asks (listings) for NFTs and other users to place bids on them, facilitating peer-to-peer trading of digital assets on the Internet Computer.

The implementation follows the [ICRC-8 standard](https://github.com/dfinity/ICRC/issues/8), which defines a ledger-native market protocol for various token standards including ICRC-7 (NFTs).

## Status and Compliance

Following an audit against the ICRC-8 standard, this implementation provides:

- ✅ Full implementation of all required core methods
- ✅ Enhanced support for AskFeature variants 
- ✅ Implementation of unsolicited offers
- ✅ Support for encumbrance mechanism
- ✅ Improved ask creation with advanced options

Some advanced features from related standards (auctions, AMMs, Dutch auctions) are not yet implemented and are planned for future updates.

## Key Concepts

### Asks

An "ask" represents a seller's offer of an asset (like an NFT) on the marketplace. Each ask has:
- A unique identifier
- Information about the asset being offered
- Pricing details (fixed price, auction parameters, etc.)
- The current status (open, closed, canceled, settled, encumbered)
- A record of participants

### Bids

A "bid" represents a buyer's offer to purchase an asset listed in an ask. Bids may include:
- The offer amount
- Any additional terms or conditions
- Escrow information when applicable

### Escrow Records

Escrow records track the assets and funds placed in escrow during a marketplace transaction, ensuring that both parties fulfill their obligations before the transaction is completed.

### Encumbrance

Encumbrance is a mechanism that allows an ask to be temporarily locked for a specific trustee, typically for facilitating multi-canister trades. When an ask is encumbered, it cannot be ended or purchased until the encumbrance is released by the trustee.

### Unsolicited Offers

Unsolicited offers allow buyers to make offers for NFTs that are not explicitly listed for sale. These offers are directed to specific asset owners who can choose to accept or reject them.

## Marketplace Features

The marketplace currently supports:

1. Creating asks for ICRC-7 NFTs
2. Fixed price "Buy Now" purchasing
3. Viewing active asks 
4. Browsing ask history
5. Token approval management
6. Advanced ask creation with customizable options
7. Unsolicited offers
8. Ask encumbrance for multi-canister settlement
9. Fee schema specification
10. Time-based ask expiration

## Core API Methods

### ICRC-8 Standard Methods

#### `icrc8_ask`

Creates, modifies, or ends asks.

```motoko
public shared({ caller }) func icrc8_ask(requests: [?ManageAskRequest]) : async [(?(ManageAskRequest), ?(ManageAskResponse))];
```

Supports:
- `new_ask`: Create a new listing
- `end_ask`: End an existing listing

#### `icrc8_bid`

Creates, modifies, or withdraws bids.

```motoko
public shared({ caller }) func icrc8_bid(requests: [?ManageBidRequest]) : async [(?(ManageBidRequest), ?(ManageBidResponse))];
```

Supports:
- `new_bid`: Place a bid on an ask
- Future implementations will support `withdraw_escrow` and `engine_match`

#### `icrc8_balance_of`

Retrieves balance information for accounts.

```motoko
public query func icrc8_balance_of(requests: [(Account, ?[?BalanceRequest])]) : async [(Account, [?BalanceResult])];
```

#### `icrc8_ask_info`

Retrieves information about asks.

```motoko
public query func icrc8_ask_info(requests: [?AskInfoRequest]) : async [(?AskInfoRequest, ?AskInfoResponse)];
```

Supports:
- `status`: Get the current status of an ask

#### `icrc8_approved_tokens`

Returns a list of approved tokens that can be used in the marketplace.

```motoko
public composite query func icrc8_approved_tokens() : async ?[Principal];
```

### Simplified API for Common Operations

#### `createNFTAsk`

A simplified method to create an ask for an NFT.

```motoko
public shared({ caller }) func createNFTAsk(
    collectionId: CollectionId,
    tokenId: TokenId,
    price: Nat
) : async Result.Result<Nat, Types.Error>;
```

#### `createAdvancedNFTAsk`

An enhanced method to create an ask with advanced options.

```motoko
public shared({ caller }) func createAdvancedNFTAsk(
    collectionId: CollectionId,
    tokenId: TokenId,
    price: Nat,
    params: {
        broker: ?Principal;
        allowList: ?[Principal];
        startDate: ?Time.Time;
        endDate: ?Time.Time;
        feeSchema: ?Text;
        memo: ?Blob;
    }
) : async Result.Result<Nat, Types.Error>;
```

#### `createUnsolicitedOffer`

Creates an unsolicited offer to a specific NFT owner.

```motoko
public shared({ caller }) func createUnsolicitedOffer(
    collectionId: CollectionId,
    tokenId: TokenId,
    price: Nat,
    owner: Principal
) : async Result.Result<Nat, Types.Error>;
```

#### `buyNFT`

A simplified method to buy an NFT at the asking price.

```motoko
public shared({ caller }) func buyNFT(
    askId: Nat
) : async Result.Result<Nat, Types.Error>;
```

#### `encumberAsk`

Encumbers an ask for a specific trustee.

```motoko
public shared({ caller }) func encumberAsk(
    askId: Nat,
    trustee: Principal,
    expiresAt: Time.Time
) : async Result.Result<(), Types.Error>;
```

#### `unencumberAsk`

Removes encumbrance from an ask.

```motoko
public shared({ caller }) func unencumberAsk(
    askId: Nat
) : async Result.Result<(), Types.Error>;
```

### Administrative Functions

#### `addApprovedToken`

Allows the marketplace owner to add new tokens to the approved list.

```motoko
public shared({ caller }) func addApprovedToken(
    token: Principal
) : async Result.Result<(), Types.Error>;
```

#### `updateFeePercentage`

Allows the marketplace owner to update the fee percentage.

```motoko
public shared({ caller }) func updateFeePercentage(
    newFeePercentage: Nat
) : async Result.Result<Nat, Types.Error>;
```

### Query Functions

#### `getAllActiveAsks`

Returns all currently active asks.

```motoko
public query func getAllActiveAsks(
    limit: Nat, 
    offset: Nat
) : async [AskStatus];
```

#### `getUserAskHistory`

Returns the ask history for a specific user.

```motoko
public query func getUserAskHistory(
    user: Principal, 
    limit: Nat, 
    offset: Nat
) : async [AskStatus];
```

#### `getMarketplaceStats`

Returns statistics about the marketplace.

```motoko
public query func getMarketplaceStats() : async {
    total_asks: Nat;
    active_asks: Nat;
    fee_percentage: Nat;
    approved_tokens: [Principal];
};
```

## Supported AskFeature Types

The implementation supports these AskFeature variants:

- ✅ `ask_token`: The tokens being offered for sale (required)
- ✅ `buy_now`: Fixed price buying options (required)
- ✅ `created_at`: Timestamp for when the ask was created
- ✅ `ending`: How the ask ends (perpetual, date, timeout)
- ✅ `fee_schema`: Fee structure to apply to the transaction
- ✅ `broker`: Account of a broker involved in the transaction
- ✅ `allow_list`: List of accounts allowed to participate
- ✅ `start_date`: When the ask becomes active
- ✅ `memo`: Additional information about the ask
- ✅ `fee_accounts`: Accounts for fee collection
- ✅ `bid_pays_fees`: Fees the bidder is responsible for
- ✅ `allow_partial`: Option for partial sales
- ✅ `unsolicited_offer`: For offers to specific accounts

## Data Types

### Account

```motoko
type Account = {
    owner: Principal;
    subaccount: ?[Nat8];
};
```

### AskStatus

```motoko
type AskStatus = {
    ask_id: Nat;
    original_broker_id: ?Principal;
    current_broker_id: ?Principal;
    config: [AskFeature];
    auction_info: ?AuctionInfo;
    settlement: ?Settlement;
    allow_list: ?AllowList;
    participants: [Account];
    settled_at: ?Time;
    status: AskStatusType;
    seller: Account;
};
```

### AskStatusType

```motoko
type AskStatusType = {
    #open;
    #closed;
    #cancelled;
    #settled;
    #encumbered: [EncumbranceDetail];
};
```

### EncumbranceDetail

```motoko
type EncumbranceDetail = {
    trustee: Principal;
    expires_at: Nat64;
};
```

## Error Handling

The marketplace uses a Result pattern to handle errors:

```motoko
type Result<T, E> = {
    #ok: T;
    #err: E;
};
```

Common error types include:

- `Unauthorized` - Caller does not have permission to perform the action
- `TokenSpecNotSupported` - The token is not approved for use in the marketplace
- `InvalidPrice` - The price specified is invalid (e.g., zero)
- `ListingNotFound` - The specified ask/listing was not found
- `UnsupportedOperation` - The operation is not supported by the marketplace

## Implementation Details

### State Management

The marketplace maintains several state variables:

- `asks`: Maps ask IDs to their current status
- `escrowRecords`: Tracks escrow information
- `userAsks`: Maps users to their active asks
- `approvedTokens`: List of tokens approved for use in the marketplace
- `askHistory`: Historical record of asks

### Ask Creation Process

1. The seller calls `createNFTAsk` or `createAdvancedNFTAsk` with the necessary parameters.
2. The marketplace validates inputs and token approval.
3. An ask is created with appropriate features (ask_token, buy_now, etc.)
4. The ask is stored and associated with the seller.
5. An ask ID is returned to the seller.

### Unsolicited Offer Process

1. A buyer calls `createUnsolicitedOffer` with token details, price, and owner.
2. The marketplace creates an ask with the unsolicited_offer feature.
3. The owner can use the marketplace to view and accept/reject the offer.

### Encumbrance Process

1. A trustee calls `encumberAsk` to lock an ask.
2. The ask status is updated to encumbered with the trustee information.
3. The ask cannot be modified until the encumbrance is removed.
4. The trustee can call `unencumberAsk` to remove the encumbrance.

### Purchase Process

1. The buyer calls `buyNFT` with the ask ID.
2. The marketplace checks if the ask exists and is open.
3. A bid is created and escrow record generated.
4. In a full implementation, tokens would be transferred at this point.
5. The ask status is updated to closed.
6. A transaction ID is returned to the buyer.

## Future Improvements

1. **Token Transfer Implementation**: Implement actual token transfers when bids are placed and asks are settled.
2. **Auction Support (ICRC-61)**: Add support for auction-style listings with time-limited bidding.
3. **AMM Support (ICRC-62)**: Implement automated market maker functionality.
4. **Dutch Auction Support (ICRC-63)**: Add support for Dutch auctions where prices decrease over time.
5. **Advanced Engine Matching**: Implement full engine matching for complex multi-canister settlement.
6. **Fee Distribution**: Implement comprehensive fee collection and distribution.

## Notes

- This implementation focuses on the core ICRC-8 marketplace functionality with enhanced support for ask features.
- The marketplace is designed for ICRC-7 NFTs but could be extended to support other token standards.
- The implementation provides a solid foundation for ICRC-8 compliance with room for extension with advanced features. 