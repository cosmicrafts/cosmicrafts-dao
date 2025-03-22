import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "./types";
import Utils "./utils";

actor class Marketplace() = this {

    // ================ Types ================
    type Account = Types.Account;
    type TokenId = Types.TokenId;
    type CollectionId = Types.CollectionId;
    type TokenKey = Types.TokenKey;
    type Collection = Types.Collection;
    type Listing = Types.Listing;
    type ListingId = Types.ListingId;
    type TransactionRecord = Types.TransactionRecord;
    type TransactionId = Types.TransactionId;
    type MarketplaceStats = Types.MarketplaceStats;
    type Error = Types.Error;
    type NFTBackend = actor {
        icrc7_transfer : shared (Types.TransferArgs) -> async Result.Result<Nat, Types.TransferError>;
        icrc7_owner_of : shared (TokenId) -> async Result.Result<Account, Types.CallError>;
        icrc7_name : shared query () -> async Text;
        icrc7_symbol : shared query () -> async Text;
    };

    // ================ State Variables ================
    private stable var owner : Principal = Principal.fromText("vam5o-bdiga-izgux-6cjaz-53tck-eezzo-fezki-t2sh6-xefok-dkdx7-pae");
    private stable var marketplaceFeePercentage : Nat = 250; // 2.5%
    private stable var nextListingId : ListingId = 1;
    private stable var nextTransactionId : TransactionId = 1;
    
    // ================ Private Helper Methods ================
    private func tokenKeyEqual(a : TokenKey, b : TokenKey) : Bool {
        return a.collectionId == b.collectionId and a.tokenId == b.tokenId;
    };

    private func tokenKeyHash(key : TokenKey) : Nat32 {
        let collectionHash = Principal.hash(key.collectionId);
        let tokenHash = Utils.natHash(key.tokenId);
        return collectionHash +% tokenHash;
    };
    
    // Stable storage for upgrades
    private stable var listingsEntries : [(ListingId, Listing)] = [];
    private stable var transactionsEntries : [(TransactionId, TransactionRecord)] = [];
    private stable var userListingsEntries : [(Principal, [ListingId])] = [];
    private stable var collectionsEntries : [(CollectionId, Collection)] = [];
    private stable var tokenToListingEntries : [(TokenKey, ListingId)] = [];

    // Runtime state
    private var listings = HashMap.HashMap<ListingId, Listing>(0, Nat.equal, Utils.natHash);
    private var transactions = HashMap.HashMap<TransactionId, TransactionRecord>(0, Nat.equal, Utils.natHash);
    private var userListings = HashMap.HashMap<Principal, [ListingId]>(0, Principal.equal, Principal.hash);
    private var collections = HashMap.HashMap<CollectionId, Collection>(0, Principal.equal, Principal.hash);
    private var tokenToListing = HashMap.HashMap<TokenKey, ListingId>(0, tokenKeyEqual, tokenKeyHash);

    // ================ System Functions ================
    system func preupgrade() {
        listingsEntries := Iter.toArray(listings.entries());
        transactionsEntries := Iter.toArray(transactions.entries());
        userListingsEntries := Iter.toArray(userListings.entries());
        collectionsEntries := Iter.toArray(collections.entries());
        tokenToListingEntries := Iter.toArray(tokenToListing.entries());
    };

    system func postupgrade() {
        listings := HashMap.fromIter<ListingId, Listing>(
            Iter.fromArray(listingsEntries), 
            listingsEntries.size(), 
            Nat.equal, 
            Utils.natHash
        );
        transactions := HashMap.fromIter<TransactionId, TransactionRecord>(
            Iter.fromArray(transactionsEntries), 
            transactionsEntries.size(), 
            Nat.equal, 
            Utils.natHash
        );
        userListings := HashMap.fromIter<Principal, [ListingId]>(
            Iter.fromArray(userListingsEntries), 
            userListingsEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        collections := HashMap.fromIter<CollectionId, Collection>(
            Iter.fromArray(collectionsEntries), 
            collectionsEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        tokenToListing := HashMap.fromIter<TokenKey, ListingId>(
            Iter.fromArray(tokenToListingEntries), 
            tokenToListingEntries.size(), 
            tokenKeyEqual, 
            tokenKeyHash
        );
        
        listingsEntries := [];
        transactionsEntries := [];
        userListingsEntries := [];
        collectionsEntries := [];
        tokenToListingEntries := [];
    };

    // ================ Private Helper Methods ================
    private func _verifyOwner(caller : Principal) : Bool {
        return caller == owner;
    };

    private func _addToUserListings(principal : Principal, listingId : ListingId) {
        let existingListings = switch (userListings.get(principal)) {
            case null { [] };
            case (?existing) { existing };
        };
        let updatedListings = Array.append<ListingId>(existingListings, [listingId]);
        userListings.put(principal, updatedListings);
    };

    private func _removeFromUserListings(principal : Principal, listingId : ListingId) {
        let existingListings = switch (userListings.get(principal)) {
            case null { return };
            case (?existing) { existing };
        };
        
        let updatedListings = Array.filter<ListingId>(
            existingListings,
            func(id : ListingId) : Bool { id != listingId }
        );
        
        if (updatedListings.size() == 0) {
            userListings.delete(principal);
        } else {
            userListings.put(principal, updatedListings);
        };
    };

    private func _recordTransaction(
        transactionType : Types.TransactionType,
        listingId : ListingId,
        collectionId : CollectionId,
        tokenId : TokenId,
        seller : Principal,
        buyer : ?Principal,
        price : Nat,
        timestamp : Time.Time
    ) : TransactionId {
        let transactionId = nextTransactionId;
        
        let transaction : TransactionRecord = {
            id = transactionId;
            transactionType = transactionType;
            listingId = listingId;
            collectionId = collectionId;
            tokenId = tokenId;
            seller = seller;
            buyer = buyer;
            price = price;
            timestamp = timestamp;
            fee = calculateFee(price);
        };
        
        transactions.put(transactionId, transaction);
        nextTransactionId += 1;
        
        return transactionId;
    };

    private func calculateFee(price : Nat) : Nat {
        return (price * marketplaceFeePercentage) / 10000;
    };

    private func isICRC7Compliant(canisterId: Principal) : async Bool {
        try {
            let nftCanister : NFTBackend = actor(Principal.toText(canisterId));
            // Call a few methods to verify it follows ICRC7 standard
            let _ = await nftCanister.icrc7_name();
            let _ = await nftCanister.icrc7_symbol();
            return true;
        } catch(_) {
            return false;
        };
    };

    // ================ Public API ================
    
    // === Admin Methods ===
    public shared({ caller }) func updateFeePercentage(newFeePercentage : Nat) : async Result.Result<Nat, Error> {
        if (not _verifyOwner(caller)) {
            return #err(#Unauthorized);
        };
        
        if (newFeePercentage > 3000) { // Max 30% fee
            return #err(#InvalidFeePercentage);
        };
        
        marketplaceFeePercentage := newFeePercentage;
        return #ok(marketplaceFeePercentage);
    };

    public shared({ caller }) func withdrawFees(_to : Account) : async Result.Result<Nat, Error> {
        if (not _verifyOwner(caller)) {
            return #err(#Unauthorized);
        };
        
        // This is where you would implement the fee withdrawal logic
        // For now, we just return success with 0 amount
        return #ok(0);
    };

    public shared({ caller }) func registerCollection(collectionId: CollectionId) : async Result.Result<(), Error> {
        if (not _verifyOwner(caller)) {
            return #err(#Unauthorized);
        };
        
        // Check if already registered
        switch (collections.get(collectionId)) {
            case (?_) { return #err(#CollectionAlreadyRegistered) };
            case null { };
        };
        
        // Verify it's ICRC7 compliant
        let isCompliant = await isICRC7Compliant(collectionId);
        if (not isCompliant) {
            return #err(#NotICRC7Compliant);
        };
        
        // Get collection metadata
        let nftCanister : NFTBackend = actor(Principal.toText(collectionId));
        let name = await nftCanister.icrc7_name();
        let symbol = await nftCanister.icrc7_symbol();
        
        // Add to collections
        let timestamp = Time.now();
        let collection : Collection = {
            id = collectionId;
            name = name;
            symbol = symbol;
            isVerified = true;
            createdAt = timestamp;
        };
        
        collections.put(collectionId, collection);
        
        // Record transaction
        let _ = _recordTransaction(
            #CollectionRegistered,
            0, // No listing ID for collection registration
            collectionId,
            0, // No token ID for collection registration
            caller,
            null,
            0, // No price for collection registration
            timestamp
        );
        
        return #ok();
    };
    
    // === Marketplace Core Methods ===
    
    // List an NFT for sale
    public shared({ caller }) func listNFT(
        collectionId : CollectionId,
        tokenId : TokenId,
        price : Nat
    ) : async Result.Result<ListingId, Error> {
        if (price == 0) {
            return #err(#InvalidPrice);
        };
        
        // Check if collection is registered
        switch (collections.get(collectionId)) {
            case null { return #err(#CollectionNotRegistered) };
            case (?_) { };
        };
        
        // Check if token is already listed
        let tokenKey : TokenKey = { collectionId = collectionId; tokenId = tokenId };
        switch (tokenToListing.get(tokenKey)) {
            case (?_) { return #err(#AlreadyListed) };
            case null { };
        };
        
        // Verify caller is the owner
        let nftBackend : NFTBackend = actor(Principal.toText(collectionId));
        let ownerResult = await nftBackend.icrc7_owner_of(tokenId);
        
        switch (ownerResult) {
            case (#err(_)) {
                return #err(#TokenNotFound);
            };
            case (#ok(owner)) {
                if (owner.owner != caller) {
                    return #err(#NotOwner);
                };
            };
        };
        
        // Create listing
        let listingId = nextListingId;
        let timestamp = Time.now();
        
        let listing : Listing = {
            id = listingId;
            collectionId = collectionId;
            tokenId = tokenId;
            seller = caller;
            price = price;
            status = #Active;
            createdAt = timestamp;
            updatedAt = timestamp;
        };
        
        listings.put(listingId, listing);
        tokenToListing.put(tokenKey, listingId);
        _addToUserListings(caller, listingId);
        
        // Record transaction
        let _ = _recordTransaction(
            #Listed,
            listingId,
            collectionId,
            tokenId,
            caller,
            null,
            price,
            timestamp
        );
        
        nextListingId += 1;
        
        return #ok(listingId);
    };
    
    // Cancel a listing (only available to the seller)
    public shared({ caller }) func cancelListing(
        listingId : ListingId
    ) : async Result.Result<(), Error> {
        switch (listings.get(listingId)) {
            case null {
                return #err(#ListingNotFound);
            };
            case (?listing) {
                if (listing.seller != caller) {
                    return #err(#NotSeller);
                };
                
                if (listing.status != #Active) {
                    return #err(#ListingNotActive);
                };
                
                // Update listing
                let updatedListing : Listing = {
                    id = listing.id;
                    collectionId = listing.collectionId;
                    tokenId = listing.tokenId;
                    seller = listing.seller;
                    price = listing.price;
                    status = #Cancelled;
                    createdAt = listing.createdAt;
                    updatedAt = Time.now();
                };
                
                listings.put(listingId, updatedListing);
                let tokenKey : TokenKey = { 
                    collectionId = listing.collectionId; 
                    tokenId = listing.tokenId 
                };
                tokenToListing.delete(tokenKey);
                _removeFromUserListings(caller, listingId);
                
                // Record transaction
                let _ = _recordTransaction(
                    #Cancelled,
                    listingId,
                    listing.collectionId,
                    listing.tokenId,
                    caller,
                    null,
                    listing.price,
                    Time.now()
                );
                
                return #ok();
            };
        };
    };
    
    // Buy an NFT (available to anyone with sufficient funds)
    public shared({ caller }) func buyNFT(
        listingId : ListingId
    ) : async Result.Result<TransactionId, Error> {
        switch (listings.get(listingId)) {
            case null {
                return #err(#ListingNotFound);
            };
            case (?listing) {
                if (listing.status != #Active) {
                    return #err(#ListingNotActive);
                };
                
                // Here is where you would handle the payment
                // For now, we assume payment is handled off-chain or in a separate step
                
                // Verify caller is not the seller
                if (caller == listing.seller) {
                    return #err(#CannotBuyOwnNFT);
                };
                
                // Transfer NFT from seller to buyer
                let nftBackend : NFTBackend = actor(Principal.toText(listing.collectionId));
                
                let transferArgs : Types.TransferArgs = {
                    spender_subaccount = null;
                    from = ?{ owner = listing.seller; subaccount = null };
                    to = { owner = caller; subaccount = null };
                    token_ids = [listing.tokenId];
                    memo = null;
                    created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
                    is_atomic = ?true;
                };
                
                let transferResult = await nftBackend.icrc7_transfer(transferArgs);
                
                switch (transferResult) {
                    case (#err(error)) {
                        return #err(#TransferFailed(error));
                    };
                    case (#ok(_)) {
                        // Update listing
                        let updatedListing : Listing = {
                            id = listing.id;
                            collectionId = listing.collectionId;
                            tokenId = listing.tokenId;
                            seller = listing.seller;
                            price = listing.price;
                            status = #Sold;
                            createdAt = listing.createdAt;
                            updatedAt = Time.now();
                        };
                        
                        listings.put(listingId, updatedListing);
                        let tokenKey : TokenKey = { 
                            collectionId = listing.collectionId; 
                            tokenId = listing.tokenId 
                        };
                        tokenToListing.delete(tokenKey);
                        _removeFromUserListings(listing.seller, listingId);
                        
                        // Record transaction
                        let transactionId = _recordTransaction(
                            #Sold,
                            listingId,
                            listing.collectionId,
                            listing.tokenId,
                            listing.seller,
                            ?caller,
                            listing.price,
                            Time.now()
                        );
                        
                        return #ok(transactionId);
                    };
                };
            };
        };
    };
    
    // Update listing price (only available to the seller)
    public shared({ caller }) func updateListingPrice(
        listingId : ListingId,
        newPrice : Nat
    ) : async Result.Result<(), Error> {
        if (newPrice == 0) {
            return #err(#InvalidPrice);
        };
        
        switch (listings.get(listingId)) {
            case null {
                return #err(#ListingNotFound);
            };
            case (?listing) {
                if (listing.seller != caller) {
                    return #err(#NotSeller);
                };
                
                if (listing.status != #Active) {
                    return #err(#ListingNotActive);
                };
                
                // Update listing
                let updatedListing : Listing = {
                    id = listing.id;
                    collectionId = listing.collectionId;
                    tokenId = listing.tokenId;
                    seller = listing.seller;
                    price = newPrice;
                    status = #Active;
                    createdAt = listing.createdAt;
                    updatedAt = Time.now();
                };
                
                listings.put(listingId, updatedListing);
                
                // Record transaction
                let _ = _recordTransaction(
                    #PriceChanged,
                    listingId,
                    listing.collectionId,
                    listing.tokenId,
                    caller,
                    null,
                    newPrice,
                    Time.now()
                );
                
                return #ok();
            };
        };
    };
    
    // === Query Methods ===
    
    // Get all collections
    public query func getAllCollections() : async [Collection] {
        return Iter.toArray(collections.vals());
    };
    
    // Get collection by ID
    public query func getCollection(collectionId : CollectionId) : async ?Collection {
        return collections.get(collectionId);
    };
    
    // Get all active listings
    public query func getAllActiveListings() : async [Listing] {
        let activeListings = Buffer.Buffer<Listing>(0);
        
        for ((_, listing) in listings.entries()) {
            if (listing.status == #Active) {
                activeListings.add(listing);
            };
        };
        
        return Buffer.toArray(activeListings);
    };
    
    // Get active listings for a specific collection
    public query func getActiveListingsByCollection(collectionId : CollectionId) : async [Listing] {
        let activeListings = Buffer.Buffer<Listing>(0);
        
        for ((_, listing) in listings.entries()) {
            if (listing.status == #Active and listing.collectionId == collectionId) {
                activeListings.add(listing);
            };
        };
        
        return Buffer.toArray(activeListings);
    };
    
    // Get specific listing by ID
    public query func getListing(listingId : ListingId) : async ?Listing {
        return listings.get(listingId);
    };
    
    // Get all listings by a specific user
    public query func getListingsBySeller(seller : Principal) : async [Listing] {
        let sellerListings = Buffer.Buffer<Listing>(0);
        
        switch (userListings.get(seller)) {
            case null { return [] };
            case (?listingIds) {
                for (id in listingIds.vals()) {
                    switch (listings.get(id)) {
                        case null { };
                        case (?listing) {
                            sellerListings.add(listing);
                        };
                    };
                };
            };
        };
        
        return Buffer.toArray(sellerListings);
    };
    
    // Get all transactions
    public query func getTransactionHistory(limit : Nat, offset : Nat) : async [TransactionRecord] {
        let transactionHistory = Buffer.Buffer<TransactionRecord>(0);
        let transactionEntries = Iter.toArray(transactions.entries());
        
        // Sort by timestamp (newest first)
        let sortedTransactions = Array.sort<(TransactionId, TransactionRecord)>(
            transactionEntries,
            func(a, b) {
                Int.compare(b.1.timestamp, a.1.timestamp)
            }
        );
        
        let end = Nat.min(offset + limit, sortedTransactions.size());
        var i = offset;
        
        while (i < end) {
            transactionHistory.add(sortedTransactions[i].1);
            i += 1;
        };
        
        return Buffer.toArray(transactionHistory);
    };
    
    // Get transactions for a specific user (as buyer or seller)
    public query func getUserTransactions(user : Principal, limit : Nat, offset : Nat) : async [TransactionRecord] {
        let userTransactions = Buffer.Buffer<TransactionRecord>(0);
        
        for ((_, transaction) in transactions.entries()) {
            if (transaction.seller == user or transaction.buyer == ?user) {
                userTransactions.add(transaction);
            };
        };
        
        let sortedTransactions = Array.sort<TransactionRecord>(
            Buffer.toArray(userTransactions),
            func(a, b) {
                Int.compare(b.timestamp, a.timestamp)
            }
        );
        
        let end = Nat.min(offset + limit, sortedTransactions.size());
        let result = if (offset >= sortedTransactions.size()) {
            []
        } else {
            Array.tabulate<TransactionRecord>(
                end - offset,
                func(i) {
                    sortedTransactions[i + offset]
                }
            )
        };
        
        return result;
    };
    
    // Get transactions for a specific collection
    public query func getCollectionTransactions(collectionId : CollectionId, limit : Nat, offset : Nat) : async [TransactionRecord] {
        let collectionTransactions = Buffer.Buffer<TransactionRecord>(0);
        
        for ((_, transaction) in transactions.entries()) {
            if (transaction.collectionId == collectionId) {
                collectionTransactions.add(transaction);
            };
        };
        
        let sortedTransactions = Array.sort<TransactionRecord>(
            Buffer.toArray(collectionTransactions),
            func(a, b) {
                Int.compare(b.timestamp, a.timestamp)
            }
        );
        
        let end = Nat.min(offset + limit, sortedTransactions.size());
        let result = if (offset >= sortedTransactions.size()) {
            []
        } else {
            Array.tabulate<TransactionRecord>(
                end - offset,
                func(i) {
                    sortedTransactions[i + offset]
                }
            )
        };
        
        return result;
    };
    
    // Get listing for a specific token
    public query func getListingByToken(collectionId : CollectionId, tokenId : TokenId) : async ?Listing {
        let tokenKey : TokenKey = { collectionId = collectionId; tokenId = tokenId };
        switch (tokenToListing.get(tokenKey)) {
            case null { return null };
            case (?listingId) {
                return listings.get(listingId);
            };
        };
    };
    
    // Get marketplace statistics
    public query func getMarketplaceStats() : async MarketplaceStats {
        var totalListings = 0;
        var activeListings = 0;
        var totalVolume = 0;
        var totalTransactions = 0;
        var totalCollections = collections.size();
        
        // Count listings
        for ((_, listing) in listings.entries()) {
            totalListings += 1;
            if (listing.status == #Active) {
                activeListings += 1;
            };
        };
        
        // Calculate volume and transaction count
        for ((_, transaction) in transactions.entries()) {
            if (transaction.transactionType == #Sold) {
                totalVolume += transaction.price;
                totalTransactions += 1;
            };
        };
        
        return {
            totalListings = totalListings;
            activeListings = activeListings;
            totalVolume = totalVolume;
            totalTransactions = totalTransactions;
            totalCollections = totalCollections;
            feePercentage = marketplaceFeePercentage;
        };
    };

    // Get the fee percentage
    public query func getFeePercentage() : async Nat {
        return marketplaceFeePercentage;
    };
    
    // Get the owner of the marketplace
    public query func getOwner() : async Principal {
        return owner;
    };
} 