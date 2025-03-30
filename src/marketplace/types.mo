import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import Text "mo:base/Text";

module {
    // Basic types
    public type TokenId = Nat;
    public type ListingId = Nat;
    public type TransactionId = Nat;
    public type CollectionId = Principal;
    
    public type Subaccount = Blob;
    
    public type Account = {
        owner: Principal;
        subaccount: ?Blob;
    };
    
    // Collection type
    public type Collection = {
        id: CollectionId;
        name: Text;
        symbol: Text;
        isVerified: Bool;
        createdAt: Time.Time;
        manager: Principal;
    };
    
    // Combined key for token lookup
    public type TokenKey = {
        collectionId: CollectionId;
        tokenId: TokenId;
    };
    
    // Listing and transaction status types
    public type ListingStatus = {
        #Active;
        #Sold;
        #Cancelled;
    };
    
    public type TransactionType = {
        #Listed;
        #Sold;
        #Cancelled;
        #PriceChanged;
        #CollectionRegistered;
        #Withdrawn;
    };
    
    // Main data types
    public type Listing = {
        id: ListingId;
        collectionId: CollectionId;
        tokenId: TokenId;
        seller: Principal;
        price: Nat;
        status: ListingStatus;
        createdAt: Time.Time;
        updatedAt: Time.Time;
    };
    
    public type TransactionRecord = {
        id: TransactionId;
        transactionType: TransactionType;
        listingId: ListingId;
        collectionId: CollectionId;
        tokenId: TokenId;
        seller: Principal;
        buyer: ?Principal;
        price: Nat;
        timestamp: Time.Time;
        fee: Nat;
    };
    
    // Stats and metadata
    public type MarketplaceStats = {
        totalListings: Nat;
        activeListings: Nat;
        totalVolume: Nat;
        totalTransactions: Nat;
        totalCollections: Nat;
        feePercentage: Nat;
    };
    
    // Error types
    public type Error = {
        #NotOwner;
        #NotSeller;
        #Unauthorized;
        #TokenNotFound;
        #ListingNotFound;
        #ListingNotActive;
        #AlreadyListed;
        #InvalidPrice;
        #InvalidFeePercentage;
        #InsufficientFunds;
        #TransferFailed: TransferError;
        #CannotBuyOwnNFT;
        #CollectionNotRegistered;
        #CollectionAlreadyRegistered;
        #NotICRC7Compliant;
        #ListingTicketNotFound;
        #ListingTicketExpired;
        #NFTNotTransferred;
        #ListingNotCancelled;
        #NotCollectionManager;
        // ICRC-8 specific errors
        #TokenSpecNotSupported;
        #UnsupportedOperation;
        #EscrowNotFound;
        #BidTooLow;
        #AskNotActive;
        #InvalidAskFeature;
        #NoMatchingBid;
    };
    
    // ICRC7 Interface Types (copied from ICRC7 spec)
    public type TransferArgs = {
        spender_subaccount: ?Subaccount;
        from: ?Account;
        to: Account;
        token_ids: [TokenId];
        memo: ?Blob;
        created_at_time: ?Nat64;
        is_atomic: ?Bool;
    };
    
    public type TransferError = {
        #Unauthorized: { token_ids: [TokenId] };
        #TooOld;
        #CreatedInFuture: { ledger_time: Nat64 };
        #Duplicate: { duplicate_of: Nat };
        #TemporarilyUnavailable;
        #GenericError: { error_code: Nat; message: Text };
    };
    
    public type CallError = {
        #Unauthorized;
        #InvalidTokenId;
        #AlreadyExistTokenId;
        #SupplyCapOverflow;
        #InvalidRecipient;
        #GenericError;
    };

    // ==================== ICRC-8 Types ====================
    
    // Generic Error used throughout ICRC-8
    public type GenericError = {
        error_code: Nat;
        message: Text;
    };
    
    // ICRC Standards for TokenSpec
    public type ICRCStandards = {
        #ICRC1: ?ICRC1TokenSpecDetail;
        #ICRC2: ?ICRC2TokenSpecDetail;
        #ICRC4: ?ICRC4TokenSpecDetail;
        #ICRC7: ?ICRC7TokenSpecDetail;
        #ICRC37: ?ICRC37TokenSpecDetail;
    };
    
    // Token Specification
    public type TokenSpec = {
        canister: Principal;
        symbol: Text;
        standards: [ICRCStandards];
    };
    
    // ICRC-1 Token Standard Detail
    public type ICRC1TokenSpecDetail = {
        amount: Nat;
        fee: ?Nat;
        decimals: Nat;
    };
    
    // ICRC-2 Token Standard Detail
    public type ICRC2TokenSpecDetail = {
        amount: Nat;
        approval_fee: ?Nat;
        transfer_from_fee: ?Nat;
        decimals: Nat;
    };
    
    // ICRC-4 Token Standard Detail
    public type ICRC4TokenSpecDetail = {
        batch_fee: ?Nat;
        decimals: Nat;
    };
    
    // ICRC-7 Token Standard Detail
    public type ICRC7TokenSpecDetail = {
        fee: ?TokenSpec;
        token_id: ?TokenId;
    };
    
    // ICRC-37 Token Standard Detail
    public type ICRC37TokenSpecDetail = {
        approval_fee: ?TokenSpec;
        transfer_from_fee: ?TokenSpec;
        token_id: ?TokenId;
    };
    
    // Token Specification Result
    public type TokenSpecResult = TokenSpec and {
        result: Nat; // Transaction Index
        sending_account: Account;
        receiving_account: Account;
        ask_id: ?Nat;
    };
    
    // Escrow Record
    public type EscrowRecord = {
        type_: {
            #bid: [?TokenSpec];
            #ask: [?TokenSpec];
            #settlement: [?TokenSpec];
        };
        buyer: ?Account;
        seller: Account;
        ask_id: ?Nat;
        lock_to_date: ?Nat64;
    };
    
    // Fee Name
    public type FeeName = Text;
    
    // Ask Feature
    public type AskFeature = {
        #allow_partial;
        #unsolicited_offer: Account;
        #buy_now: [[BuyNowReq]]; 
        #allow_list: [Account];
        #broker: Account;
        #start_date: Nat64;
        #ending: {
            #perpetual;
            #date: Nat64;
            #timeout: Nat64;
        };
        #ask_token: [?TokenSpec]; 
        #fee_schema: Text;
        #fee_accounts: [(FeeName, TokenSpec, Account)];
        #bid_pays_fees: ?[FeeName];
        #created_at: Nat64;
        #memo: Blob;
    };
    
    // Buy Now Request
    public type BuyNowReq = {
        token: TokenSpec;
        amount: Nat;
    };
    
    // Encumbrance Detail
    public type EncumbranceDetail = {
        trustee: Principal;
        expires_at: Nat64;
    };
    
    // Ask Status
    public type AskStatusType = {
        #open;
        #closed;
        #encumbered: [EncumbranceDetail];
        #not_started;
    };
    
    // Auction Info
    public type AuctionInfo = {
        token: TokenSpec;
        current_bid_amount: ?Nat;
        end_date: ?Nat64;
        start_date: ?Nat64;
        min_next_bid: ?Nat;
        wait_for_quiet_count: ?Nat;
        current_escrow: ?EscrowRecord;
    };
    
    // Settlement Info
    public type SettlementInfo = {
        bid_tokens: [?TokenSpecResult];
        ask_tokens: [?TokenSpecResult];
        royalties: [(Account, Nat, Text)];
    };
    
    // Ask Status Shared
    public type AskStatus = {
        ask_id: Nat;
        original_broker_id: ?Account;
        current_broker_id: ?Account;
        config: [AskFeature];
        auction_info: ?AuctionInfo;
        settlement: ?SettlementInfo;
        allow_list: ?[Account];
        participants: [Account];
        settled_at: ?(Principal, Nat);
        status: AskStatusType;
        seller: Account;
    };
    
    // Bid Features
    public type BidFeature = {
        #broker: Account;
        #escrow: EscrowRecord;
        #fee_schema: Text;
        #fee_account: [(FeeName, TokenSpec, Account)];
    };
    
    // Engine Match
    public type EngineMatch = {
        leader: ?Principal;
        asks: [{
            ask_canister: ?Principal;
            ask_id: Nat;
            token: ?[?TokenSpec];
        }];
    };
    
    // Manage Ask Request
    public type ManageAskRequest = {
        #new_ask: [?AskFeature];
        #end_ask: Nat;
        #refresh_offers: ?Account;
        #withdraw_settlement: EscrowRecord;
        #withdraw_escrow: EscrowRecord;
        #reject_offer: Nat;
        #distribute_ask: Nat;
        #unencumber: Nat;
    };
    
    // Manage Ask Response
    public type ManageAskResponse = {
        #new_ask: {
            #Ok: NewAskResult;
            #Err: GenericError;
        };
        #end_ask: {
            #Ok: Nat;
            #Err: GenericError;
        };
        #refresh_offers: {
            #Ok: {
                records: [(Blob, ?AskStatus)];
                eof: Bool;
                count: Nat;
            };
            #Err: GenericError;
        };
        #withdraw_settlement: {
            #Ok: {
                withdraw_result: Nat;
                token_results: [{
                    token: TokenSpec;
                    result: {
                        #Ok: Nat;
                        #Err: GenericError;
                    };
                }];
            };
            #Err: GenericError;
        };
        #distribute_ask: {
            #Ok: [{
                token: TokenSpec;
                result: {
                    #Ok: Nat;
                    #Err: GenericError;
                };
            }];
            #Err: GenericError;
        };
    };
    
    // New Ask Result
    public type NewAskResult = {
        ask_id: Nat;
        escrow_records: [EscrowRecord];
    };
    
    // Manage Bid Request
    public type ManageBidRequest = {
        #new_bid: {
            ask_id: Nat;
            feature: [?BidFeature];
        };
        #engine_match: EngineMatch;
        #withdraw_escrow: EscrowRecord;
    };
    
    // Manage Bid Response
    public type ManageBidResponse = {
        #new_bid: {
            #Ok: {
                escrow: EscrowRecord;
                result: Nat;
            };
            #Err: GenericError;
        };
        #engine_match: {
            #Ok: [{
                ask_canister: ?Principal;
                ask_id: Nat;
                token: ?[?TokenSpecResult];
            }];
            #Err: GenericError;
        };
        #withdraw_escrow: {
            #Ok: {
                withdraw_result: Nat;
                token_results: [{
                    token: TokenSpec;
                    result: {
                        #Ok: Nat;
                        #Err: GenericError;
                    };
                }];
            };
            #Err: GenericError;
        };
    };
    
    // Balance Request
    public type BalanceRequest = {
        #nfts: ?{
            prev: ?Nat;
            take: ?Nat;
        };
        #tokens: Null;
        #escrow: ?{
            prev: ?Nat;
            take: ?Nat;
        };
        #ask_settlements: ?{
            prev: ?Nat;
            take: ?Nat;
        };
        #offers: ?{
            prev: ?Nat;
            take: ?Nat;
        };
    };
    
    // Balance Result
    public type BalanceResult = {
        #nfts: ?{
            records: [EscrowRecord];
            count: Nat;
            eof: Bool;
        };
        #tokens: ?Nat;
        #escrow: {
            records: [EscrowRecord];
            count: Nat;
            eof: Bool;
        };
        #ask_settlements: {
            records: [(EncumbranceDetail, EscrowRecord)];
            count: Nat;
            eof: Bool;
        };
        #offers: {
            records: [EscrowRecord];
            count: Nat;
            eof: Bool;
        };
    };
    
    // Ask Info Request
    public type AskInfoRequest = {
        #active: ?(?Nat, ?Nat);
        #history: ?(Nat, Nat);
        #status: Nat;
    };
    
    // Ask Info Response
    public type AskInfoResponse = {
        #active: {
            records: [?AskStatus];
            eof: Bool;
            count: Nat;
        };
        #history: {
            records: [?AskStatus];
            eof: Bool;
            count: Nat;
        };
        #status: ?AskStatus;
    };
} 