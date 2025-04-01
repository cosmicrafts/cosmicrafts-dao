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
import ResultWrapper "./result_wrapper";

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

    // ICRC-8 Types
    type TokenSpec = Types.TokenSpec;
    type ICRCStandards = Types.ICRCStandards;
    type EscrowRecord = Types.EscrowRecord;
    type AskFeature = Types.AskFeature;
    type AskStatus = Types.AskStatus;
    type AskStatusType = Types.AskStatusType;
    type ManageAskRequest = Types.ManageAskRequest;
    type ManageAskResponse = Types.ManageAskResponse;
    type ManageBidRequest = Types.ManageBidRequest;
    type ManageBidResponse = Types.ManageBidResponse;
    type BidFeature = Types.BidFeature;
    type GenericError = Types.GenericError;
    type AskInfoRequest = Types.AskInfoRequest;
    type AskInfoResponse = Types.AskInfoResponse;
    type BalanceRequest = Types.BalanceRequest;
    type BalanceResult = Types.BalanceResult;
    type NewAskResult = Types.NewAskResult;
    type ICRC1TokenSpecDetail = Types.ICRC1TokenSpecDetail;
    type ICRC7TokenSpecDetail = Types.ICRC7TokenSpecDetail;
    type EngineMatch = Types.EngineMatch;
    type TokenSpecResult = Types.TokenSpecResult;
    type EncumbranceDetail = Types.EncumbranceDetail;
    type BuyNowReq = Types.BuyNowReq;

    // ================ State Variables ================
    private stable var owner : Principal = Principal.fromText("7mwdg-w6cvy-faabk-parwb-e4xuk-vxzcv-33uj2-2izcp-5x2qo-5s4ar-wqe");
    private stable var marketplaceFeePercentage : Nat = 250; // 2.5%
    private stable var _nextListingId : ListingId = 1;
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

    // New type for listing creation
    public type ListingCreationTicket = {
        id: Nat;
        collectionId: CollectionId;
        tokenId: TokenId;
        seller: Principal;
        price: Nat;
        expires: Time.Time;
    };

    // Stable storage for tickets
    private stable var listingTicketsEntries : [(Nat, ListingCreationTicket)] = [];

    // Runtime state
    private var listingTickets = HashMap.HashMap<Nat, ListingCreationTicket>(0, Nat.equal, Utils.natHash);
    private stable var _nextTicketId : Nat = 1;
    
    // ================ ICRC-8 State Variables ================
    private stable var nextAskId : Nat = 1;
    private stable var nextEscrowId : Nat = 1;
    
    // Stable storage for ICRC-8
    private stable var asksEntries : [(Nat, AskStatus)] = [];
    private stable var escrowRecordsEntries : [(Nat, EscrowRecord)] = [];
    private stable var userAsksEntries : [(Principal, [Nat])] = [];
    private stable var approvedTokensEntries : [Principal] = [];
    private stable var askHistoryEntries : [(Nat, AskStatus)] = [];
    
    // Runtime state for ICRC-8
    private var asks = HashMap.HashMap<Nat, AskStatus>(0, Nat.equal, Utils.natHash);
    private var escrowRecords = HashMap.HashMap<Nat, EscrowRecord>(0, Nat.equal, Utils.natHash);
    private var userAsks = HashMap.HashMap<Principal, [Nat]>(0, Principal.equal, Principal.hash);
    private var approvedTokens = Buffer.Buffer<Principal>(0);
    private var askHistory = HashMap.HashMap<Nat, AskStatus>(0, Nat.equal, Utils.natHash);

    // ================ System Functions ================
    system func preupgrade() {
        listingsEntries := Iter.toArray(listings.entries());
        transactionsEntries := Iter.toArray(transactions.entries());
        userListingsEntries := Iter.toArray(userListings.entries());
        collectionsEntries := Iter.toArray(collections.entries());
        tokenToListingEntries := Iter.toArray(tokenToListing.entries());
        listingTicketsEntries := Iter.toArray(listingTickets.entries());
        
        // ICRC-8 entries
        asksEntries := Iter.toArray(asks.entries());
        escrowRecordsEntries := Iter.toArray(escrowRecords.entries());
        userAsksEntries := Iter.toArray(userAsks.entries());
        approvedTokensEntries := Buffer.toArray(approvedTokens);
        askHistoryEntries := Iter.toArray(askHistory.entries());
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

        listingTickets := HashMap.fromIter<Nat, ListingCreationTicket>(
            Iter.fromArray(listingTicketsEntries),
            listingTicketsEntries.size(),
            Nat.equal,
            Utils.natHash
        );
        listingTicketsEntries := [];
        
        // ICRC-8 state initialization
        asks := HashMap.fromIter<Nat, AskStatus>(
            Iter.fromArray(asksEntries),
            asksEntries.size(),
            Nat.equal,
            Utils.natHash
        );
        escrowRecords := HashMap.fromIter<Nat, EscrowRecord>(
            Iter.fromArray(escrowRecordsEntries),
            escrowRecordsEntries.size(),
            Nat.equal,
            Utils.natHash
        );
        userAsks := HashMap.fromIter<Principal, [Nat]>(
            Iter.fromArray(userAsksEntries),
            userAsksEntries.size(),
            Principal.equal,
            Principal.hash
        );
        approvedTokens := Buffer.fromArray<Principal>(approvedTokensEntries);
        askHistory := HashMap.fromIter<Nat, AskStatus>(
            Iter.fromArray(askHistoryEntries),
            askHistoryEntries.size(),
            Nat.equal,
            Utils.natHash
        );
        
        asksEntries := [];
        escrowRecordsEntries := [];
        userAsksEntries := [];
        approvedTokensEntries := [];
        askHistoryEntries := [];
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

    private func _isICRC7Compliant(canisterId: Principal) : async Bool {
        try {
            let nftCanister : NFTBackend = actor(Principal.toText(canisterId));
            // Call multiple standard methods to verify it follows ICRC7 standard
            let _ = await nftCanister.icrc7_name();
            let _ = await nftCanister.icrc7_symbol();
            
            // Try to verify the standard by calling owner_of on token 1
            // This is just a check and we expect it might fail if token 1 doesn't exist
            // But if the method exists, it should either return a valid result or a known error
            try {
                let _ = await nftCanister.icrc7_owner_of(1);
                // Result doesn't matter, just that the method exists and returns correctly formatted data
            } catch(_) {
                // An error here is expected for non-existent tokens
                // But the method signature should exist for ICRC-7
            };
            
            return true;
        } catch(_) {
            return false;
        };
    };

    // ================ ICRC-8 Helper Methods ================
    private func _addEscrowRecord(record: EscrowRecord) : Nat {
        let _escrowId = nextEscrowId;
        escrowRecords.put(_escrowId, record);
        nextEscrowId += 1;
        return _escrowId;
    };
    
    private func _addToUserAsks(principal: Principal, askId: Nat) {
        let existingAsks = switch (userAsks.get(principal)) {
            case null { [] };
            case (?existing) { existing };
        };
        let updatedAsks = Array.append<Nat>(existingAsks, [askId]);
        userAsks.put(principal, updatedAsks);
    };
    
    private func _removeFromUserAsks(principal: Principal, askId: Nat) {
        let existingAsks = switch (userAsks.get(principal)) {
            case null { return };
            case (?existing) { existing };
        };
        
        let updatedAsks = Array.filter<Nat>(
            existingAsks,
            func(id: Nat): Bool { id != askId }
        );
        
        if (updatedAsks.size() == 0) {
            userAsks.delete(principal);
        } else {
            userAsks.put(principal, updatedAsks);
        };
    };
    
    // Helper method to check if token is approved
    private func _isTokenApproved(canisterId: Principal) : Bool {
        for (token in approvedTokens.vals()) {
            if (token == canisterId) {
                return true;
            };
        };
        return false;
    };
    
    private func _validateAskFeatures(features: [?AskFeature]) : Result.Result<[AskFeature], GenericError> {
        var hasAskToken = false;
        var hasBuyNow = false;
        
        let validFeatures = Buffer.Buffer<AskFeature>(0);
        
        for (feature in features.vals()) {
            switch(feature) {
                case (null) { /* Skip null features */ };
                case (?f) {
                    validFeatures.add(f);
                    
                    switch(f) {
                        case (#ask_token(_)) {
                            hasAskToken := true;
                        };
                        case (#buy_now(_)) {
                            hasBuyNow := true;
                        };
                        case (_) {};
                    };
                };
            };
        };
        
        // Validate required features
        if (not hasAskToken) {
            return #err({
                error_code = 400;
                message = "Missing required token_id feature";
            });
        };
        
        if (not hasBuyNow) {
            return #err({
                error_code = 400;
                message = "Missing required buy_now feature";
            });
        };
        
        return #ok(Buffer.toArray(validFeatures));
    };
    
    private func _createNewAsk(caller: Principal, askFeatures: [?AskFeature]) : async Result.Result<NewAskResult, GenericError> {
        // Validate features
        let validationResult = _validateAskFeatures(askFeatures);
        switch (validationResult) {
            case (#err(error)) { return #err(error); };
            case (#ok(features)) {
                // Create a new ask
                let askId = nextAskId;
                
        let _timestamp = Time.now();
                let account : Account = { owner = caller; subaccount = null; };
                
                let askStatus : AskStatus = {
                    ask_id = askId;
                    original_broker_id = null;
                    current_broker_id = null;
                    config = features;
                    auction_info = null;
                    settlement = null;
                    allow_list = null;
                    participants = [account];
                    settled_at = null;
                    status = #open;
                    seller = account;
                };
                
                asks.put(askId, askStatus);
                _addToUserAsks(caller, askId);
                
                nextAskId += 1;
                
                return #ok({
                    ask_id = askId;
                    escrow_records = [];
                });
            };
        };
    };
    
    private func _endAsk(caller: Principal, askId: Nat) : Result.Result<Nat, GenericError> {
        switch (asks.get(askId)) {
            case (null) {
                return #err({
                    error_code = 404;
                    message = "Ask not found";
                });
            };
            case (?askStatus) {
                if (askStatus.seller.owner != caller) {
                    return #err({
                        error_code = 403;
                        message = "Only the seller can end the ask";
                    });
                };
                
                if (askStatus.status != #open) {
                    return #err({
                        error_code = 400;
                        message = "Ask is not in open state";
                    });
                };
                
                // Update ask status
                let updatedStatus : AskStatus = {
                    askStatus with
                    status = #closed;
                };
                
                asks.put(askId, updatedStatus);
                askHistory.put(askId, updatedStatus);
                
                // Remove from active user asks
                _removeFromUserAsks(caller, askId);
                
                // Use a simple transaction ID 
                let txId = nextAskId; // Reuse nextAskId as txId for simplicity
                
                return #ok(txId);
            };
        };
    };
    
    // Helper function to create ask features for an NFT listing
    private func createAskFeatures(
        collectionId: CollectionId,
        tokenId: TokenId,
        price: Nat
    ) : [?AskFeature] {
        let _timestamp = Time.now();
        
        // Create NFT token specification
        let tokenSpec : TokenSpec = {
            canister = collectionId;
            symbol = "NFT"; // This would ideally be fetched from the collection
            standards = [#ICRC7(?{
                fee = null;
                token_id = ?tokenId;
            })];
        };
        
        // Create buy now token specification (using ICP, but could be configurable)
        let buyNowReq : BuyNowReq = {
            token = {
                canister = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"); // ICP Ledger
                symbol = "ICP";
                standards = [#ICRC1(?{
                    amount = price;
                    fee = null;
                    decimals = 8;
                })];
            };
            amount = price;
        };
        
        // Construct ask features
        let askFeatures : [?AskFeature] = [
            ?#ask_token([?tokenSpec]),
            ?#buy_now([[buyNowReq]]),
            ?#created_at(Nat64.fromNat(Int.abs(_timestamp))),
            ?#ending(#timeout(7 * 24 * 60 * 60 * 1_000_000_000)), // Default 7 day timeout
            ?#fee_schema("standard") // Use standard fee schema
        ];
        
        return askFeatures;
    };
    
    // Enhanced function to create ask features with more options
    private func createAdvancedAskFeatures(
        collectionId: CollectionId,
        tokenId: TokenId,
        price: Nat,
        broker: ?Account,
        allowList: ?[Account],
        startDate: ?Time.Time,
        ending: ?AskFeature,
        feeSchema: ?Text,
        memo: ?Blob
    ) : [?AskFeature] {
        let _timestamp = Time.now();
        
        // Create NFT token specification
        let tokenSpec : TokenSpec = {
            canister = collectionId;
            symbol = "NFT"; // This would ideally be fetched from the collection
            standards = [#ICRC7(?{
                fee = null;
                token_id = ?tokenId;
            })];
        };
        
        // Create buy now token specification (using ICP, but could be configurable)
        let buyNowReq : BuyNowReq = {
            token = {
                canister = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"); // ICP Ledger
                symbol = "ICP";
                standards = [#ICRC1(?{
                    amount = price;
                    fee = null;
                    decimals = 8;
                })];
            };
            amount = price;
        };
        
        // Initialize the ask features with required elements
        let features = Buffer.Buffer<(?AskFeature)>(5);
        
        // Add required features
        features.add(?#ask_token([?tokenSpec]));
        features.add(?#buy_now([[buyNowReq]]));
        features.add(?#created_at(Nat64.fromNat(Int.abs(_timestamp))));
        
        // Add optional features if provided
        switch(broker) {
            case (null) {};
            case (?account) {
                features.add(?#broker(account));
            };
        };
        
        switch(allowList) {
            case (null) {};
            case (?accounts) {
                features.add(?#allow_list(accounts));
            };
        };
        
        switch(startDate) {
            case (null) {};
            case (?date) {
                features.add(?#start_date(Nat64.fromNat(Int.abs(date))));
            };
        };
        
        // Add ending if provided, otherwise default timeout
        switch(ending) {
            case (null) {
                features.add(?#ending(#timeout(7 * 24 * 60 * 60 * 1_000_000_000))); // Default 7 day timeout
            };
            case (?end) {
                features.add(?end);
            };
        };
        
        // Add fee schema if provided, otherwise default
        switch(feeSchema) {
            case (null) {
                features.add(?#fee_schema("standard"));
            };
            case (?schema) {
                features.add(?#fee_schema(schema));
            };
        };
        
        // Add memo if provided
        switch(memo) {
            case (null) {};
            case (?data) {
                features.add(?#memo(data));
            };
        };
        
        return Buffer.toArray(features);
    };
    
    // ================ Public API ================

    // === ICRC-8 Methods ===
    
    public shared({ caller }) func icrc8_ask(requests: [?ManageAskRequest]) : async [(?(ManageAskRequest), ?(ManageAskResponse))] {
        let results = Buffer.Buffer<(?(ManageAskRequest), ?(ManageAskResponse))>(requests.size());
        
        for (request in requests.vals()) {
            switch (request) {
                case (null) {
                    results.add((null, null));
                };
                case (?#new_ask(features)) {
                    let result = await _createNewAsk(caller, features);
                    switch (result) {
                        case (#ok(newAskResult)) {
                            results.add((
                                ?#new_ask(features), 
                                ?#new_ask(#Ok(newAskResult))
                            ));
                        };
                        case (#err(error)) {
                            results.add((
                                ?#new_ask(features), 
                                ?#new_ask(#Err(error))
                            ));
                        };
                    };
                };
                case (?#end_ask(askId)) {
                    let result = _endAsk(caller, askId);
                    switch (result) {
                        case (#ok(txId)) {
                            results.add((
                                ?#end_ask(askId), 
                                ?#end_ask(#Ok(txId))
                            ));
                        };
                        case (#err(error)) {
                            results.add((
                                ?#end_ask(askId), 
                                ?#end_ask(#Err(error))
                            ));
                        };
                    };
                };
                case (_) {
                    // Not implemented yet
                    results.add((
                        request, 
                        null
                    ));
                };
            };
        };
        
        return Buffer.toArray(results);
    };
    
    // Helper method to create a bid for an ask
    private func _createBidForAsk(
        caller: Principal,
        askId: Nat,
        _bidFeatures: [?BidFeature]
    ) : async Result.Result<{escrow: EscrowRecord; result: Nat}, GenericError> {
        // Check if ask exists and is open
        switch (asks.get(askId)) {
            case (null) {
                return #err({
                    error_code = 404;
                    message = "Ask not found";
                });
            };
            
            case (?askStatus) {
                if (askStatus.status != #open) {
                    return #err({
                        error_code = 400;
                        message = "Ask is not open for bids";
                    });
                };
                
                let _timestamp = Time.now();
                let buyer : Account = { owner = caller; subaccount = null };
                
                // For now, we'll create a simple escrow record
                // In a real implementation, you would handle token transfers here
                
                let escrowRecord : EscrowRecord = {
                    type_ = #bid([]);  // Simplified for now
                    buyer = ?buyer;
                    seller = askStatus.seller;
                    ask_id = ?askId;
                    lock_to_date = null;
                };
                
                // Add escrow record
                let _escrowId = _addEscrowRecord(escrowRecord);
                
                // Update ask participants
                let updatedParticipants = Array.append(askStatus.participants, [buyer]);
                let updatedStatus : AskStatus = {
                    askStatus with
                    participants = updatedParticipants;
                };
                
                asks.put(askId, updatedStatus);
                
                // Use a simple transaction ID 
                let txId = nextEscrowId; // Use nextEscrowId as txId for simplicity
                
                return #ok({
                    escrow = escrowRecord;
                    result = txId;
                });
            };
        };
    };
    
    // Update the icrc8_bid method to implement the new_bid variant
    public shared({ caller }) func icrc8_bid(requests: [?ManageBidRequest]) : async [(?(ManageBidRequest), ?(ManageBidResponse))] {
        let results = Buffer.Buffer<(?(ManageBidRequest), ?(ManageBidResponse))>(requests.size());
        
        for (request in requests.vals()) {
            switch (request) {
                case (null) {
                    results.add((null, null));
                };
                case (?#new_bid({ ask_id; feature })) {
                    let result = await _createBidForAsk(caller, ask_id, feature);
                    switch (result) {
                        case (#ok(bidResult)) {
                            results.add((
                                ?#new_bid({ ask_id; feature }), 
                                ?#new_bid(#Ok(bidResult))
                            ));
                        };
                        case (#err(error)) {
                            results.add((
                                ?#new_bid({ ask_id; feature }), 
                                ?#new_bid(#Err(error))
                            ));
                        };
                    };
                };
                case (?#withdraw_escrow(escrowRecord)) {
                    // Not implemented yet
                    results.add((
                        ?#withdraw_escrow(escrowRecord), 
                        null
                    ));
                };
                case (?#engine_match(engineMatch)) {
                    // Not implemented yet
                    results.add((
                        ?#engine_match(engineMatch), 
                        null
                    ));
                };
            };
        };
        
        return Buffer.toArray(results);
    };
    
    public query func icrc8_balance_of(requests: [(Account, ?[?BalanceRequest])]) : async [(Account, [?BalanceResult])] {
        let results = Buffer.Buffer<(Account, [?BalanceResult])>(requests.size());
        
        for ((account, requestOpt) in requests.vals()) {
            switch (requestOpt) {
                case (null) { 
                    results.add((account, [])); 
                };
                case (_) {
                    // Not implemented yet
                    results.add((account, []));
                };
            };
        };
        
        return Buffer.toArray(results);
    };
    
    public query func icrc8_ask_info(requests: [?AskInfoRequest]) : async [(?AskInfoRequest, ?AskInfoResponse)] {
        let results = Buffer.Buffer<(?AskInfoRequest, ?AskInfoResponse)>(requests.size());
        
        for (request in requests.vals()) {
            switch (request) {
                case (null) { 
                    results.add((null, null)); 
                };
                case (?#status(askId)) {
                    switch (asks.get(askId)) {
                        case (null) {
                            results.add((?#status(askId), ?#status(null)));
                        };
                        case (?askStatus) {
                            results.add((?#status(askId), ?#status(?askStatus)));
                        };
                    };
                };
                case (_) {
                    // Not implemented yet
                    results.add((request, null));
                };
            };
        };
        
        return Buffer.toArray(results);
    };
    
    public composite query func icrc8_approved_tokens() : async ?[Principal] {
        ?Buffer.toArray(approvedTokens);
    };
    
    // Admin method to register approved tokens
    public shared({ caller }) func addApprovedToken(token: Principal) : async ResultWrapper.Result<(), Types.Error> {
        if (not _verifyOwner(caller)) {
            return ResultWrapper.err(#Unauthorized);
        };
        
        // Check if token is already approved to avoid duplicates
        if (_isTokenApproved(token)) {
            return ResultWrapper.ok(());
        };
        
        // Verify that the token canister implements ICRC7 standard
        let isCompliant = await _isICRC7Compliant(token);
        if (not isCompliant) {
            return ResultWrapper.err(#NotICRC7Compliant);
        };
        
        // Add the token to approved list
        approvedTokens.add(token);
        return ResultWrapper.ok(());
    };

    // Public method to allow anyone to register their own collection
    public shared({ caller }) func registerCollection(token: Principal) : async ResultWrapper.Result<(), Types.Error> {
        // Check if token is already approved to avoid duplicates
        if (_isTokenApproved(token)) {
            return ResultWrapper.ok(());
        };
        
        // Verify that the token canister implements ICRC7 standard
        let isCompliant = await _isICRC7Compliant(token);
        if (not isCompliant) {
            return ResultWrapper.err(#NotICRC7Compliant);
        };
        
        // Add the token to approved list
        approvedTokens.add(token);
        
        // Get collection metadata and store with caller as manager
        let timestamp = Time.now();
        try {
            let nftCanister : NFTBackend = actor(Principal.toText(token));
            let name = await nftCanister.icrc7_name();
            let symbol = await nftCanister.icrc7_symbol();
            
            // Create and store collection with caller as manager
            let newCollection : Collection = {
                id = token;
                name = name;
                symbol = symbol;
                isVerified = true; // Set to true by default as in original implementation
                createdAt = timestamp;
                manager = caller;
            };
            
            collections.put(token, newCollection);
            
            // Record this as a transaction
            let _ = _recordTransaction(
                #CollectionRegistered,
                0, // No listing ID for collection registration
                token,
                0, // No token ID for collection registration
                caller,
                null, // No buyer
                0, // No price
                Time.now()
            );
        } catch(_) {
            // Still add to approved tokens even if we fail to get collection details
            return ResultWrapper.ok(());
        };
        
        return ResultWrapper.ok(());
    };

    // Admin method to update fee percentage
    public shared({ caller }) func updateFeePercentage(newFeePercentage : Nat) : async ResultWrapper.Result<Nat, Types.Error> {
        if (not _verifyOwner(caller)) {
            return ResultWrapper.err(#Unauthorized);
        };
        
        if (newFeePercentage > 3000) { // Max 30% fee
            return ResultWrapper.err(#InvalidFeePercentage);
        };
        
        marketplaceFeePercentage := newFeePercentage;
        return ResultWrapper.ok(marketplaceFeePercentage);
    };

    // Update createNFTAsk to use our custom Result type
    public shared({ caller }) func createNFTAsk(
        collectionId: CollectionId,
        tokenId: TokenId,
        price: Nat
    ) : async ResultWrapper.Result<Nat, Types.Error> {
        if (price == 0) {
            return ResultWrapper.err(#InvalidPrice);
        };
        
        // Check if token is approved
        if (not _isTokenApproved(collectionId)) {
            return ResultWrapper.err(#TokenSpecNotSupported);
        };
        
        // Verify ownership
        try {
            let nftCanister : NFTBackend = actor(Principal.toText(collectionId));
            let ownerResult = await nftCanister.icrc7_owner_of(tokenId);
            
            switch (ownerResult) {
                case (#ok(owner)) {
                    if (owner.owner != caller) {
                        return ResultWrapper.err(#NotOwner);
                    };
                };
                case (#err(_)) {
                    return ResultWrapper.err(#TokenNotFound);
                };
            };
        } catch (_) {
            return ResultWrapper.err(#NotICRC7Compliant);
        };
        
        // Create ask features for the NFT
        let askFeatures = createAskFeatures(collectionId, tokenId, price);
        
        // Create the ask
        let result = await _createNewAsk(caller, askFeatures);
        
        switch (result) {
            case (#err(_)) {
                return ResultWrapper.err(#UnsupportedOperation);
            };
            case (#ok(newAskResult)) {
                return ResultWrapper.ok(newAskResult.ask_id);
            };
        };
    };
    
    // Update buyNFT to use our custom Result type
    public shared({ caller }) func buyNFT(askId: Nat) : async ResultWrapper.Result<Nat, Types.Error> {
        // Check if ask exists and is open
        switch (asks.get(askId)) {
            case (null) {
                return ResultWrapper.err(#ListingNotFound);
            };
            case (?askStatus) {
                if (askStatus.status != #open) {
                    return ResultWrapper.err(#AskNotActive);
                };
                
                // Create an empty feature array for the bid
                let _bidFeatures : [?BidFeature] = [];
                
                // Create a bid for the ask
                let result = await _createBidForAsk(caller, askId, _bidFeatures);
                
                switch (result) {
                    case (#err(_)) {
                        return ResultWrapper.err(#UnsupportedOperation);
                    };
                    case (#ok(bidResult)) {
                        // In a real implementation, you would handle token transfers here
                        
                        // Update ask status to closed
                        let updatedStatus : AskStatus = {
                            askStatus with
                            status = #closed;
                        };
                        
                        asks.put(askId, updatedStatus);
                        askHistory.put(askId, updatedStatus);
                        
                        return ResultWrapper.ok(bidResult.result);
                    };
                };
            };
        };
    };
    
    // Helper function to extract token details from ask features
    private func _extractTokenDetails(ask: AskStatus) : {
        price: Nat;
        collectionId: Principal;
        tokenId: Nat;
    } {
        var price: Nat = 0;
        var collectionId: Principal = Principal.fromText("aaaaa-aa");
        var tokenId: Nat = 0;
        
        for (feature in ask.config.vals()) {
            // Extract buy_now price
            switch (feature) {
                case (#buy_now(buyNowOptions)) {
                    if (buyNowOptions.size() > 0 and buyNowOptions[0].size() > 0) {
                        switch (buyNowOptions[0][0]) {
                            case (buyNow) {
                                price := buyNow.amount;
                            };
                        };
                    };
                };
                
                // Extract token details
                case (#ask_token(tokenSpecs)) {
                    if (tokenSpecs.size() > 0) {
                        switch (tokenSpecs[0]) {
                            case (?spec) {
                                collectionId := spec.canister;
                                
                                // Extract token ID
                                for (standard in spec.standards.vals()) {
                                    switch (standard) {
                                        case (#ICRC7(?details)) {
                                            switch (details.token_id) {
                                                case (?id) {
                                                    tokenId := id;
                                                };
                                                case (null) {};
                                            };
                                        };
                                        case (_) {};
                                    };
                                };
                            };
                            case (null) {};
                        };
                    };
                };
                
                case (_) {}; // Skip other features
            };
        };
        
        return {
            price;
            collectionId;
            tokenId;
        };
    };
    
    // Query to get all active asks
    public query func getAllActiveAsks(limit: Nat, offset: Nat) : async [AskStatus] {
        let activeAsks = Buffer.Buffer<AskStatus>(0);
        
        for ((_, askStatus) in asks.entries()) {
            if (askStatus.status == #open) {
                activeAsks.add(askStatus);
            };
        };
        
        let _timestamp = Time.now();
        
        let sortedAsks = Array.sort<AskStatus>(
            Buffer.toArray(activeAsks),
            func(a, b) {
                // Sort by ask ID (most recent first)
                Nat.compare(b.ask_id, a.ask_id)
            }
        );
        
        let end = Nat.min(offset + limit, sortedAsks.size());
        let result = if (offset >= sortedAsks.size()) {
            []
        } else {
            Array.tabulate<AskStatus>(
                end - offset,
                func(i) {
                    sortedAsks[i + offset]
                }
            )
        };
        
        return result;
    };
    
    // Query to get ask history for a user
    public query func getUserAskHistory(user: Principal, limit: Nat, offset: Nat) : async [AskStatus] {
        let _userAccount : Account = { owner = user; subaccount = null };
        let userAskHistory = Buffer.Buffer<AskStatus>(0);
        
        for ((_, askStatus) in askHistory.entries()) {
            if (askStatus.seller.owner == user) {
                userAskHistory.add(askStatus);
            };
        };
        
        let sortedHistory = Array.sort<AskStatus>(
            Buffer.toArray(userAskHistory),
            func(a, b) {
                // Sort by ask ID (most recent first)
                Nat.compare(b.ask_id, a.ask_id)
            }
        );
        
        let end = Nat.min(offset + limit, sortedHistory.size());
        let result = if (offset >= sortedHistory.size()) {
            []
        } else {
            Array.tabulate<AskStatus>(
                end - offset,
                func(i) {
                    sortedHistory[i + offset]
                }
            )
        };
        
        return result;
    };
    
    // ICRC-8 Metadata
    public query func icrc8_supported_standards() : async [{name: Text; url: Text}] {
        return [
            {name = "ICRC-8"; url = "https://github.com/dfinity/ICRC/issues/8"},
            {name = "ICRC-7"; url = "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md"}
        ];
    };
    
    public query func icrc8_metadata() : async [(Text, {#Text : Text; #Blob : Blob; #Nat : Nat; #Int : Int; #Array : [Nat]})] {
        return [
            ("icrc8:default_ask_timeout", #Nat(7 * 24 * 60 * 60 * 1_000_000_000)), // 7 days in nanoseconds
            ("icrc8:default_fee_schema", #Text("standard")),
            ("icrc8:supports_icrc_2", #Text("false")),
            ("icrc8:supports_icrc_37", #Text("false")),
            ("icrc8:supports_icrc_4", #Text("false"))
        ];
    };
    
    // Query to fetch ICRC-8 marketplace statistics
    public query func getMarketplaceStats() : async {
        total_asks: Nat;
        active_asks: Nat;
        fee_percentage: Nat;
        approved_tokens: [Principal];
    } {
        var totalAsks = 0;
        var activeAsks = 0;
        
        for ((_, askStatus) in asks.entries()) {
            totalAsks += 1;
            if (askStatus.status == #open) {
                activeAsks += 1;
            };
        };
        
        return {
            total_asks = totalAsks;
            active_asks = activeAsks;
            fee_percentage = marketplaceFeePercentage;
            approved_tokens = Buffer.toArray(approvedTokens);
        };
    };

    // Add a public query function to get the owner principal
    public query func getOwner() : async Principal {
        return owner;
    };

    // Add support for creating unsolicited offers with improved validation
    public shared({ caller }) func createUnsolicitedOffer(
        collectionId: CollectionId,
        tokenId: TokenId,
        price: Nat,
        owner: Principal
    ) : async Result.Result<Nat, Types.Error> {
        if (price == 0) {
            return #err(#InvalidPrice);
        };
        
        // Check if token is approved
        if (not _isTokenApproved(collectionId)) {
            return #err(#TokenSpecNotSupported);
        };
        
        // Verify that the target owner actually owns the token
        try {
            let nftCanister : NFTBackend = actor(Principal.toText(collectionId));
            let ownerResult = await nftCanister.icrc7_owner_of(tokenId);
            
            switch (ownerResult) {
                case (#ok(actualOwner)) {
                    if (actualOwner.owner != owner) {
                        return #err(#NotOwner);
                    };
                };
                case (#err(_)) {
                    return #err(#TokenNotFound);
                };
            };
        } catch (_) {
            return #err(#NotICRC7Compliant);
        };
        
        // Ensure the caller is not making an offer to themselves
        if (caller == owner) {
            return #err(#CannotBuyOwnNFT);
        };
        
        let _timestamp = Time.now();
        
        // Create NFT token specification
        let tokenSpec : TokenSpec = {
            canister = collectionId;
            symbol = "NFT"; // This would ideally be fetched from the collection
            standards = [#ICRC7(?{
                fee = null;
                token_id = ?tokenId;
            })];
        };
        
        // Create buy now token specification
        let buyNowReq : BuyNowReq = {
            token = {
                canister = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"); // ICP Ledger
                symbol = "ICP";
                standards = [#ICRC1(?{
                    amount = price;
                    fee = null;
                    decimals = 8;
                })];
            };
            amount = price;
        };
        
        // Owner's account
        let ownerAccount : Account = { owner = owner; subaccount = null };
        
        // Create unsolicited offer features
        let askFeatures : [?AskFeature] = [
            ?#ask_token([?tokenSpec]),
            ?#buy_now([[buyNowReq]]),
            ?#created_at(Nat64.fromNat(Int.abs(_timestamp))),
            ?#unsolicited_offer(ownerAccount),
            ?#ending(#timeout(7 * 24 * 60 * 60 * 1_000_000_000)), // Default 7 day timeout
            ?#fee_schema("standard") // Use standard fee schema
        ];
        
        // Create the ask
        let result = await _createNewAsk(caller, askFeatures);
        
        switch (result) {
            case (#err(_)) {
                return #err(#UnsupportedOperation);
            };
            case (#ok(newAskResult)) {
                // Notify the owner of the unsolicited offer (could implement notification mechanism here)
                return #ok(newAskResult.ask_id);
            };
        };
    };
    
    // Add a new method for advanced ask creation
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
    ) : async Result.Result<Nat, Types.Error> {
        if (price == 0) {
            return #err(#InvalidPrice);
        };
        
        // Check if token is approved
        if (not _isTokenApproved(collectionId)) {
            return #err(#TokenSpecNotSupported);
        };
        
        // Convert principal to accounts where needed
        let broker : ?Account = switch(params.broker) {
            case (null) { null };
            case (?principal) { ?{ owner = principal; subaccount = null } };
        };
        
        let allowList : ?[Account] = switch(params.allowList) {
            case (null) { null };
            case (?principals) {
                ?Array.map<Principal, Account>(
                    principals, 
                    func(p: Principal): Account { { owner = p; subaccount = null } }
                )
            };
        };
        
        // Create ending variant if endDate is provided
        let ending : ?AskFeature = switch(params.endDate) {
            case (null) { null };
            case (?date) { ?#ending(#date(Nat64.fromNat(Int.abs(date)))) };
        };
        
        // Create ask features
        let askFeatures = createAdvancedAskFeatures(
            collectionId,
            tokenId,
            price,
            broker,
            allowList,
            params.startDate,
            ending,
            params.feeSchema,
            params.memo
        );
        
        // Create the ask
        let result = await _createNewAsk(caller, askFeatures);
        
        switch (result) {
            case (#err(_)) {
                return #err(#UnsupportedOperation);
            };
            case (#ok(newAskResult)) {
                return #ok(newAskResult.ask_id);
            };
        };
    };

    // Add a method to handle ask encumbrance
    public shared({ caller = _ }) func encumberAsk(
        askId: Nat,
        trustee: Principal,
        expiresAt: Time.Time
    ) : async ResultWrapper.Result<(), Types.Error> {
        // Check if ask exists
        switch (asks.get(askId)) {
            case (null) {
                return ResultWrapper.err(#ListingNotFound);
            };
            case (?askStatus) {
                if (askStatus.status != #open) {
                    return ResultWrapper.err(#AskNotActive);
                };
                
                // Create encumbrance detail
                let encumbrance : EncumbranceDetail = {
                    trustee = trustee;
                    expires_at = Nat64.fromIntWrap(expiresAt);
                };
                
                // Update ask status to encumbered
                let updatedStatus : AskStatus = {
                    askStatus with
                    status = #encumbered([encumbrance]);
                };
                
                asks.put(askId, updatedStatus);
                askHistory.put(askId, updatedStatus);
                
                return ResultWrapper.ok(());
            };
        };
    };

    // Add a method to unencumber an ask
    public shared({ caller }) func unencumberAsk(
        askId: Nat
    ) : async ResultWrapper.Result<(), Types.Error> {
        // Check if ask exists and is encumbered
        switch (asks.get(askId)) {
            case (null) {
                return ResultWrapper.err(#ListingNotFound);
            };
            case (?askStatus) {
                switch (askStatus.status) {
                    case (#encumbered(details)) {
                        // Verify caller is the trustee
                        let authorized = Array.foldLeft<EncumbranceDetail, Bool>(
                            details, 
                            false, 
                            func(acc, detail) { acc or detail.trustee == caller }
                        );
                        
                        if (not authorized) {
                            return ResultWrapper.err(#Unauthorized);
                        };
                        
                        // Update ask status to open
                        let updatedStatus : AskStatus = {
                            askStatus with
                            status = #open;
                        };
                        
                        asks.put(askId, updatedStatus);
                        askHistory.put(askId, updatedStatus);
                        
                        return ResultWrapper.ok(());
                    };
                    case (_) {
                        return ResultWrapper.err(#ListingNotActive);
                    };
                };
            };
        };
    };

    // Update initializeMarketplace to use our custom Result type
    public shared({ caller }) func initializeMarketplace() : async ResultWrapper.Result<(), Types.Error> {
        if (not _verifyOwner(caller)) {
            return ResultWrapper.err(#Unauthorized);
        };
        
        // Check if ICP token is already approved
        let icpLedgerId = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
        let icpAlreadyApproved = _isTokenApproved(icpLedgerId);
        
        if (not icpAlreadyApproved) {
            // Add ICP as approved token by default
            approvedTokens.add(icpLedgerId);
        };
        
        // Set default fee percentage (2.5%)
        marketplaceFeePercentage := 250;
        
        return ResultWrapper.ok(());
    };

    // Update cleanupExpiredAsks to use our custom Result type
    public shared func cleanupExpiredAsks() : async ResultWrapper.Result<Nat, Types.Error> {
        let currentTime = Time.now();
        let currentTimeNat = Nat64.fromNat(Int.abs(currentTime));
        var expiredCount = 0;
        
        for ((askId, askStatus) in asks.entries()) {
            if (askStatus.status == #open) {
                var shouldExpire = false;
                var expiryTimestamp : Nat64 = 0;
                
                // Check ending feature for expiration
                for (feature in askStatus.config.vals()) {
                    switch (feature) {
                        case (#ending(#date(timestamp))) {
                            if (timestamp <= currentTimeNat) {
                                shouldExpire := true;
                                expiryTimestamp := timestamp;
                            };
                        };
                        case (#ending(#timeout(duration))) {
                            // Check if created_at + duration < current time
                            for (innerFeature in askStatus.config.vals()) {
                                switch (innerFeature) {
                                    case (#created_at(creationTime)) {
                                        let expiryTime = creationTime + duration;
                                        if (expiryTime <= currentTimeNat) {
                                            shouldExpire := true;
                                            expiryTimestamp := expiryTime;
                                        };
                                    };
                                    case (_) {};
                                };
                            };
                        };
                        case (_) {};
                    };
                };
                
                if (shouldExpire) {
                    // Update ask status to closed
                    let updatedStatus : AskStatus = {
                        askStatus with
                        status = #closed;
                    };
                    
                    asks.put(askId, updatedStatus);
                    askHistory.put(askId, updatedStatus);
                    expiredCount += 1;
                };
            };
        };
        
        return ResultWrapper.ok(expiredCount);
    };

    // Get detailed information for a specific ask
    public query func getAskDetails(askId: Nat) : async ?{
        ask_id: Nat;
        status: AskStatusType;
        seller: Account;
        token_details: ?{
            collection_id: Principal;
            token_id: Nat;
            price: Nat;
        };
        created_at: ?Nat64;
        participants: [Account];
    } {
        switch (asks.get(askId)) {
            case (null) {
                return null;
            };
            case (?askStatus) {
                let tokenDetails = _extractTokenDetails(askStatus);
                var createdAt : ?Nat64 = null;
                
                // Extract created_at from features
                for (feature in askStatus.config.vals()) {
                    switch (feature) {
                        case (#created_at(timestamp)) {
                            createdAt := ?timestamp;
                        };
                        case (_) {};
                    };
                };
                
                return ?{
                    ask_id = askId;
                    status = askStatus.status;
                    seller = askStatus.seller;
                    token_details = ?{
                        collection_id = tokenDetails.collectionId;
                        token_id = tokenDetails.tokenId;
                        price = tokenDetails.price;
                    };
                    created_at = createdAt;
                    participants = askStatus.participants;
                };
            };
        };
    };

    // Add methods for collection management

    // Query to get collection details
    public query func getCollectionDetails(collectionId: CollectionId) : async ?Collection {
        collections.get(collectionId)
    };

    // Get all collections managed by a specific principal
    public query func getUserManagedCollections(principal: Principal) : async [Collection] {
        let managedCollections = Buffer.Buffer<Collection>(0);
        
        for ((_, collection) in collections.entries()) {
            if (collection.manager == principal) {
                managedCollections.add(collection);
            };
        };
        
        return Buffer.toArray(managedCollections);
    };

    // Transfer collection management to another principal
    public shared({ caller }) func transferCollectionManagement(
        collectionId: CollectionId, 
        newManager: Principal
    ) : async ResultWrapper.Result<(), Types.Error> {
        switch (collections.get(collectionId)) {
            case (null) {
                return ResultWrapper.err(#CollectionNotRegistered);
            };
            
            case (?collection) {
                // Verify caller is current manager
                if (collection.manager != caller) {
                    return ResultWrapper.err(#NotCollectionManager);
                };
                
                // Update collection with new manager
                let updatedCollection : Collection = {
                    collection with
                    manager = newManager;
                };
                
                collections.put(collectionId, updatedCollection);
                
                return ResultWrapper.ok(());
            };
        };
    };

    // Update collection details (only manager can update)
    public shared({ caller }) func updateCollectionDetails(
        collectionId: CollectionId,
        newName: ?Text,
        newSymbol: ?Text
    ) : async ResultWrapper.Result<(), Types.Error> {
        switch (collections.get(collectionId)) {
            case (null) {
                return ResultWrapper.err(#CollectionNotRegistered);
            };
            
            case (?collection) {
                // Verify caller is current manager
                if (collection.manager != caller) {
                    return ResultWrapper.err(#NotCollectionManager);
                };
                
                // Update collection details
                let updatedCollection : Collection = {
                    collection with
                    name = switch (newName) {
                        case (null) { collection.name };
                        case (?name) { name };
                    };
                    symbol = switch (newSymbol) {
                        case (null) { collection.symbol };
                        case (?symbol) { symbol };
                    };
                };
                
                collections.put(collectionId, updatedCollection);
                
                return ResultWrapper.ok(());
            };
        };
    };

    // Get all approved and registered collections
    public query func getAllCollections() : async [Collection] {
        Iter.toArray(collections.vals())
    };
} 