# ICRC7 NFT Marketplace Canister

This canister implements a decentralized marketplace for ICRC7 NFTs on the Internet Computer. It enables users to list, buy, and sell NFTs in a secure, decentralized manner.

## Architecture

The marketplace is designed with security and decentralization as core principles:

### Security Features
- **Atomic transactions**: NFT transfers happen as a single atomic operation
- **Ownership verification**: All operations verify the caller's permissions
- **Error handling**: Comprehensive error handling for all operations
- **Transparent fee structure**: Clear fee calculation that can be audited

### Core Components

1. **Listing Management**
   - List NFTs for sale
   - Update listing prices
   - Cancel listings
   - Query listings by various parameters

2. **Transaction Processing**
   - Purchase NFTs
   - Record all transaction history
   - Calculate and collect fees
   - Transfer NFTs between accounts

3. **Data Management**
   - Stable variable support for canister upgrades
   - Efficient data structures for querying and updates
   - User-specific transaction history
   - Marketplace statistics

## How to Use

### For NFT Owners

1. **Listing NFTs**
   ```motoko
   let listingResult = await marketplace.listNFT(tokenId, price);
   ```

2. **Updating Listing Price**
   ```motoko
   let updateResult = await marketplace.updateListingPrice(listingId, newPrice);
   ```

3. **Cancelling Listings**
   ```motoko
   let cancelResult = await marketplace.cancelListing(listingId);
   ```

### For NFT Buyers

1. **Viewing Available NFTs**
   ```motoko
   let listings = await marketplace.getAllActiveListings();
   ```

2. **Purchasing NFTs**
   ```motoko
   let purchaseResult = await marketplace.buyNFT(listingId);
   ```

### For All Users

1. **Viewing Transaction History**
   ```motoko
   let history = await marketplace.getTransactionHistory(20, 0); // limit 20, offset 0
   ```

2. **Checking Marketplace Statistics**
   ```motoko
   let stats = await marketplace.getMarketplaceStats();
   ```

## Security Considerations

1. **Ownership Verification**
   - Only token owners can list their NFTs
   - Only listing owners can update or cancel listings
   - Only marketplace owner can update settings or withdraw fees

2. **Transaction Integrity**
   - Atomic transactions prevent partial execution
   - Comprehensive error handling
   - Transaction records for all activities

3. **Fees and Transparency**
   - Clear fee structure (currently 2.5%)
   - Fee calculation is transparent and can be verified
   - Stats and analytics are publicly accessible

## Future Enhancements

1. **Payment Integration**
   - Direct ICP payment integration
   - Support for ICRC1 token payments
   - Escrow mechanism for conditional payments

2. **Advanced Features**
   - Auctions with time-based ending
   - Offers/bids on NFTs that aren't listed
   - Collection-based listings and batch sales

3. **Governance**
   - DAO-based governance for fee structure
   - Community proposals for marketplace features
   - Decentralized administration

## Integration with ICRC7

This marketplace is designed to work with any compliant ICRC7 NFT canister. It interfaces with the ICRC7 canister through the following methods:

1. `icrc7_transfer`: For transferring NFTs between accounts
2. `icrc7_owner_of`: For verifying token ownership before listing

The marketplace doesn't hold or escrow NFTs - it only facilitates the discovery, listing, and transaction processing. 