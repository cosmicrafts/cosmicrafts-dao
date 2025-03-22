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
} 