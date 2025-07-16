import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export type AskFeature = { 'ask_token' : Array<[] | [TokenSpec]> } |
  { 'fee_schema' : string } |
  { 'allow_partial' : null } |
  { 'broker' : Account } |
  { 'memo' : Uint8Array | number[] } |
  { 'created_at' : bigint } |
  { 'unsolicited_offer' : Account } |
  { 'start_date' : bigint } |
  { 'allow_list' : Array<Account> } |
  { 'buy_now' : Array<Array<BuyNowReq>> } |
  { 'fee_accounts' : Array<[FeeName, TokenSpec, Account]> } |
  { 'bid_pays_fees' : [] | [Array<FeeName>] } |
  {
    'ending' : { 'date' : bigint } |
      { 'perpetual' : null } |
      { 'timeout' : bigint }
  };
export type AskInfoRequest = { 'status' : bigint } |
  { 'active' : [] | [[[] | [bigint], [] | [bigint]]] } |
  { 'history' : [] | [[bigint, bigint]] };
export type AskInfoResponse = { 'status' : [] | [AskStatus] } |
  {
    'active' : {
      'eof' : boolean,
      'records' : Array<[] | [AskStatus]>,
      'count' : bigint,
    }
  } |
  {
    'history' : {
      'eof' : boolean,
      'records' : Array<[] | [AskStatus]>,
      'count' : bigint,
    }
  };
export interface AskStatus {
  'status' : AskStatusType,
  'participants' : Array<Account>,
  'auction_info' : [] | [AuctionInfo],
  'ask_id' : bigint,
  'seller' : Account,
  'allow_list' : [] | [Array<Account>],
  'current_broker_id' : [] | [Account],
  'config' : Array<AskFeature>,
  'original_broker_id' : [] | [Account],
  'settled_at' : [] | [[Principal, bigint]],
  'settlement' : [] | [SettlementInfo],
}
export type AskStatusType = { 'closed' : null } |
  { 'open' : null } |
  { 'not_started' : null } |
  { 'encumbered' : Array<EncumbranceDetail> };
export interface AuctionInfo {
  'token' : TokenSpec,
  'current_bid_amount' : [] | [bigint],
  'end_date' : [] | [bigint],
  'start_date' : [] | [bigint],
  'wait_for_quiet_count' : [] | [bigint],
  'current_escrow' : [] | [EscrowRecord],
  'min_next_bid' : [] | [bigint],
}
export type BalanceRequest = {
    'nfts' : [] | [{ 'prev' : [] | [bigint], 'take' : [] | [bigint] }]
  } |
  { 'offers' : [] | [{ 'prev' : [] | [bigint], 'take' : [] | [bigint] }] } |
  { 'tokens' : null } |
  {
    'ask_settlements' : [] | [
      { 'prev' : [] | [bigint], 'take' : [] | [bigint] }
    ]
  } |
  { 'escrow' : [] | [{ 'prev' : [] | [bigint], 'take' : [] | [bigint] }] };
export type BalanceResult = {
    'nfts' : [] | [
      { 'eof' : boolean, 'records' : Array<EscrowRecord>, 'count' : bigint }
    ]
  } |
  {
    'offers' : {
      'eof' : boolean,
      'records' : Array<EscrowRecord>,
      'count' : bigint,
    }
  } |
  { 'tokens' : [] | [bigint] } |
  {
    'ask_settlements' : {
      'eof' : boolean,
      'records' : Array<[EncumbranceDetail, EscrowRecord]>,
      'count' : bigint,
    }
  } |
  {
    'escrow' : {
      'eof' : boolean,
      'records' : Array<EscrowRecord>,
      'count' : bigint,
    }
  };
export type BidFeature = { 'fee_schema' : string } |
  { 'broker' : Account } |
  { 'fee_account' : Array<[FeeName, TokenSpec, Account]> } |
  { 'escrow' : EscrowRecord };
export interface BuyNowReq { 'token' : TokenSpec, 'amount' : bigint }
export type CollectionId = Principal;
export interface EncumbranceDetail {
  'trustee' : Principal,
  'expires_at' : bigint,
}
export interface EngineMatch {
  'asks' : Array<
    {
      'ask_canister' : [] | [Principal],
      'token' : [] | [Array<[] | [TokenSpec]>],
      'ask_id' : bigint,
    }
  >,
  'leader' : [] | [Principal],
}
export type Error = { 'UnsupportedOperation' : null } |
  { 'CollectionAlreadyRegistered' : null } |
  { 'AskNotActive' : null } |
  { 'TokenNotFound' : null } |
  { 'InvalidPrice' : null } |
  { 'ListingNotActive' : null } |
  { 'ListingTicketNotFound' : null } |
  { 'ListingTicketExpired' : null } |
  { 'InvalidFeePercentage' : null } |
  { 'EscrowNotFound' : null } |
  { 'InvalidAskFeature' : null } |
  { 'NotSeller' : null } |
  { 'CannotBuyOwnNFT' : null } |
  { 'NoMatchingBid' : null } |
  { 'Unauthorized' : null } |
  { 'NotICRC7Compliant' : null } |
  { 'TokenSpecNotSupported' : null } |
  { 'NotOwner' : null } |
  { 'ListingNotCancelled' : null } |
  { 'AlreadyListed' : null } |
  { 'CollectionNotRegistered' : null } |
  { 'TransferFailed' : TransferError } |
  { 'BidTooLow' : null } |
  { 'NFTNotTransferred' : null } |
  { 'InsufficientFunds' : null } |
  { 'ListingNotFound' : null };
export interface EscrowRecord {
  'ask_id' : [] | [bigint],
  'type' : { 'ask' : Array<[] | [TokenSpec]> } |
    { 'bid' : Array<[] | [TokenSpec]> } |
    { 'settlement' : Array<[] | [TokenSpec]> },
  'seller' : Account,
  'lock_to_date' : [] | [bigint],
  'buyer' : [] | [Account],
}
export type FeeName = string;
export interface GenericError { 'message' : string, 'error_code' : bigint }
export interface ICRC1TokenSpecDetail {
  'fee' : [] | [bigint],
  'decimals' : bigint,
  'amount' : bigint,
}
export interface ICRC2TokenSpecDetail {
  'decimals' : bigint,
  'transfer_from_fee' : [] | [bigint],
  'approval_fee' : [] | [bigint],
  'amount' : bigint,
}
export interface ICRC37TokenSpecDetail {
  'transfer_from_fee' : [] | [TokenSpec],
  'token_id' : [] | [TokenId],
  'approval_fee' : [] | [TokenSpec],
}
export interface ICRC4TokenSpecDetail {
  'decimals' : bigint,
  'batch_fee' : [] | [bigint],
}
export interface ICRC7TokenSpecDetail {
  'fee' : [] | [TokenSpec],
  'token_id' : [] | [TokenId],
}
export type ICRCStandards = { 'ICRC1' : [] | [ICRC1TokenSpecDetail] } |
  { 'ICRC2' : [] | [ICRC2TokenSpecDetail] } |
  { 'ICRC4' : [] | [ICRC4TokenSpecDetail] } |
  { 'ICRC7' : [] | [ICRC7TokenSpecDetail] } |
  { 'ICRC37' : [] | [ICRC37TokenSpecDetail] };
export type ManageAskRequest = { 'new_ask' : Array<[] | [AskFeature]> } |
  { 'reject_offer' : bigint } |
  { 'withdraw_escrow' : EscrowRecord } |
  { 'unencumber' : bigint } |
  { 'end_ask' : bigint } |
  { 'distribute_ask' : bigint } |
  { 'refresh_offers' : [] | [Account] } |
  { 'withdraw_settlement' : EscrowRecord };
export type ManageAskResponse = {
    'new_ask' : { 'Ok' : NewAskResult } |
      { 'Err' : GenericError }
  } |
  { 'end_ask' : { 'Ok' : bigint } | { 'Err' : GenericError } } |
  {
    'distribute_ask' : {
        'Ok' : Array<
          {
            'result' : { 'Ok' : bigint } |
              { 'Err' : GenericError },
            'token' : TokenSpec,
          }
        >
      } |
      { 'Err' : GenericError }
  } |
  {
    'refresh_offers' : {
        'Ok' : {
          'eof' : boolean,
          'records' : Array<[Uint8Array | number[], [] | [AskStatus]]>,
          'count' : bigint,
        }
      } |
      { 'Err' : GenericError }
  } |
  {
    'withdraw_settlement' : {
        'Ok' : {
          'token_results' : Array<
            {
              'result' : { 'Ok' : bigint } |
                { 'Err' : GenericError },
              'token' : TokenSpec,
            }
          >,
          'withdraw_result' : bigint,
        }
      } |
      { 'Err' : GenericError }
  };
export type ManageBidRequest = {
    'new_bid' : { 'feature' : Array<[] | [BidFeature]>, 'ask_id' : bigint }
  } |
  { 'engine_match' : EngineMatch } |
  { 'withdraw_escrow' : EscrowRecord };
export type ManageBidResponse = {
    'new_bid' : { 'Ok' : { 'result' : bigint, 'escrow' : EscrowRecord } } |
      { 'Err' : GenericError }
  } |
  {
    'engine_match' : {
        'Ok' : Array<
          {
            'ask_canister' : [] | [Principal],
            'token' : [] | [Array<[] | [TokenSpecResult]>],
            'ask_id' : bigint,
          }
        >
      } |
      { 'Err' : GenericError }
  } |
  {
    'withdraw_escrow' : {
        'Ok' : {
          'token_results' : Array<
            {
              'result' : { 'Ok' : bigint } |
                { 'Err' : GenericError },
              'token' : TokenSpec,
            }
          >,
          'withdraw_result' : bigint,
        }
      } |
      { 'Err' : GenericError }
  };
export interface Marketplace {
  'addApprovedToken' : ActorMethod<[Principal], Result_1>,
  'buyNFT' : ActorMethod<[bigint], Result>,
  'createAdvancedNFTAsk' : ActorMethod<
    [
      CollectionId,
      TokenId,
      bigint,
      {
        'broker' : [] | [Principal],
        'endDate' : [] | [Time],
        'memo' : [] | [Uint8Array | number[]],
        'feeSchema' : [] | [string],
        'allowList' : [] | [Array<Principal>],
        'startDate' : [] | [Time],
      },
    ],
    Result
  >,
  'createNFTAsk' : ActorMethod<[CollectionId, TokenId, bigint], Result>,
  'createUnsolicitedOffer' : ActorMethod<
    [CollectionId, TokenId, bigint, Principal],
    Result
  >,
  'encumberAsk' : ActorMethod<[bigint, Principal, Time], Result_1>,
  'getAllActiveAsks' : ActorMethod<[bigint, bigint], Array<AskStatus>>,
  'getMarketplaceStats' : ActorMethod<
    [],
    {
      'total_asks' : bigint,
      'approved_tokens' : Array<Principal>,
      'active_asks' : bigint,
      'fee_percentage' : bigint,
    }
  >,
  'getOwner' : ActorMethod<[], Principal>,
  'getUserAskHistory' : ActorMethod<
    [Principal, bigint, bigint],
    Array<AskStatus>
  >,
  'icrc8_approved_tokens' : ActorMethod<[], [] | [Array<Principal>]>,
  'icrc8_ask' : ActorMethod<
    [Array<[] | [ManageAskRequest]>],
    Array<[[] | [ManageAskRequest], [] | [ManageAskResponse]]>
  >,
  'icrc8_ask_info' : ActorMethod<
    [Array<[] | [AskInfoRequest]>],
    Array<[[] | [AskInfoRequest], [] | [AskInfoResponse]]>
  >,
  'icrc8_balance_of' : ActorMethod<
    [Array<[Account, [] | [Array<[] | [BalanceRequest]>]]>],
    Array<[Account, Array<[] | [BalanceResult]>]>
  >,
  'icrc8_bid' : ActorMethod<
    [Array<[] | [ManageBidRequest]>],
    Array<[[] | [ManageBidRequest], [] | [ManageBidResponse]]>
  >,
  'icrc8_metadata' : ActorMethod<
    [],
    Array<
      [
        string,
        { 'Int' : bigint } |
          { 'Nat' : bigint } |
          { 'Blob' : Uint8Array | number[] } |
          { 'Text' : string } |
          { 'Array' : Array<bigint> },
      ]
    >
  >,
  'icrc8_supported_standards' : ActorMethod<
    [],
    Array<{ 'url' : string, 'name' : string }>
  >,
  'unencumberAsk' : ActorMethod<[bigint], Result_1>,
  'updateFeePercentage' : ActorMethod<[bigint], Result>,
}
export interface NewAskResult {
  'ask_id' : bigint,
  'escrow_records' : Array<EscrowRecord>,
}
export type Result = { 'ok' : bigint } |
  { 'err' : Error };
export type Result_1 = { 'ok' : null } |
  { 'err' : Error };
export interface SettlementInfo {
  'bid_tokens' : Array<[] | [TokenSpecResult]>,
  'ask_tokens' : Array<[] | [TokenSpecResult]>,
  'royalties' : Array<[Account, bigint, string]>,
}
export type Time = bigint;
export type TokenId = bigint;
export interface TokenSpec {
  'standards' : Array<ICRCStandards>,
  'canister' : Principal,
  'symbol' : string,
}
export interface TokenSpecResult {
  'result' : bigint,
  'standards' : Array<ICRCStandards>,
  'ask_id' : [] | [bigint],
  'receiving_account' : Account,
  'sending_account' : Account,
  'canister' : Principal,
  'symbol' : string,
}
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'Unauthorized' : { 'token_ids' : Array<TokenId> } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null };
export interface _SERVICE extends Marketplace {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
