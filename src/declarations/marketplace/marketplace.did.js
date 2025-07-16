export const idlFactory = ({ IDL }) => {
  const TokenSpec = IDL.Rec();
  const TokenId = IDL.Nat;
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'Unauthorized' : IDL.Record({ 'token_ids' : IDL.Vec(TokenId) }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
  });
  const Error = IDL.Variant({
    'UnsupportedOperation' : IDL.Null,
    'CollectionAlreadyRegistered' : IDL.Null,
    'AskNotActive' : IDL.Null,
    'TokenNotFound' : IDL.Null,
    'InvalidPrice' : IDL.Null,
    'ListingNotActive' : IDL.Null,
    'ListingTicketNotFound' : IDL.Null,
    'ListingTicketExpired' : IDL.Null,
    'InvalidFeePercentage' : IDL.Null,
    'EscrowNotFound' : IDL.Null,
    'InvalidAskFeature' : IDL.Null,
    'NotSeller' : IDL.Null,
    'CannotBuyOwnNFT' : IDL.Null,
    'NoMatchingBid' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'NotICRC7Compliant' : IDL.Null,
    'TokenSpecNotSupported' : IDL.Null,
    'NotOwner' : IDL.Null,
    'ListingNotCancelled' : IDL.Null,
    'AlreadyListed' : IDL.Null,
    'CollectionNotRegistered' : IDL.Null,
    'TransferFailed' : TransferError,
    'BidTooLow' : IDL.Null,
    'NFTNotTransferred' : IDL.Null,
    'InsufficientFunds' : IDL.Null,
    'ListingNotFound' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error });
  const CollectionId = IDL.Principal;
  const Time = IDL.Int;
  const EncumbranceDetail = IDL.Record({
    'trustee' : IDL.Principal,
    'expires_at' : IDL.Nat64,
  });
  const AskStatusType = IDL.Variant({
    'closed' : IDL.Null,
    'open' : IDL.Null,
    'not_started' : IDL.Null,
    'encumbered' : IDL.Vec(EncumbranceDetail),
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const ICRC1TokenSpecDetail = IDL.Record({
    'fee' : IDL.Opt(IDL.Nat),
    'decimals' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const ICRC2TokenSpecDetail = IDL.Record({
    'decimals' : IDL.Nat,
    'transfer_from_fee' : IDL.Opt(IDL.Nat),
    'approval_fee' : IDL.Opt(IDL.Nat),
    'amount' : IDL.Nat,
  });
  const ICRC4TokenSpecDetail = IDL.Record({
    'decimals' : IDL.Nat,
    'batch_fee' : IDL.Opt(IDL.Nat),
  });
  const ICRC7TokenSpecDetail = IDL.Record({
    'fee' : IDL.Opt(TokenSpec),
    'token_id' : IDL.Opt(TokenId),
  });
  const ICRC37TokenSpecDetail = IDL.Record({
    'transfer_from_fee' : IDL.Opt(TokenSpec),
    'token_id' : IDL.Opt(TokenId),
    'approval_fee' : IDL.Opt(TokenSpec),
  });
  const ICRCStandards = IDL.Variant({
    'ICRC1' : IDL.Opt(ICRC1TokenSpecDetail),
    'ICRC2' : IDL.Opt(ICRC2TokenSpecDetail),
    'ICRC4' : IDL.Opt(ICRC4TokenSpecDetail),
    'ICRC7' : IDL.Opt(ICRC7TokenSpecDetail),
    'ICRC37' : IDL.Opt(ICRC37TokenSpecDetail),
  });
  TokenSpec.fill(
    IDL.Record({
      'standards' : IDL.Vec(ICRCStandards),
      'canister' : IDL.Principal,
      'symbol' : IDL.Text,
    })
  );
  const EscrowRecord = IDL.Record({
    'ask_id' : IDL.Opt(IDL.Nat),
    'type' : IDL.Variant({
      'ask' : IDL.Vec(IDL.Opt(TokenSpec)),
      'bid' : IDL.Vec(IDL.Opt(TokenSpec)),
      'settlement' : IDL.Vec(IDL.Opt(TokenSpec)),
    }),
    'seller' : Account,
    'lock_to_date' : IDL.Opt(IDL.Nat64),
    'buyer' : IDL.Opt(Account),
  });
  const AuctionInfo = IDL.Record({
    'token' : TokenSpec,
    'current_bid_amount' : IDL.Opt(IDL.Nat),
    'end_date' : IDL.Opt(IDL.Nat64),
    'start_date' : IDL.Opt(IDL.Nat64),
    'wait_for_quiet_count' : IDL.Opt(IDL.Nat),
    'current_escrow' : IDL.Opt(EscrowRecord),
    'min_next_bid' : IDL.Opt(IDL.Nat),
  });
  const BuyNowReq = IDL.Record({ 'token' : TokenSpec, 'amount' : IDL.Nat });
  const FeeName = IDL.Text;
  const AskFeature = IDL.Variant({
    'ask_token' : IDL.Vec(IDL.Opt(TokenSpec)),
    'fee_schema' : IDL.Text,
    'allow_partial' : IDL.Null,
    'broker' : Account,
    'memo' : IDL.Vec(IDL.Nat8),
    'created_at' : IDL.Nat64,
    'unsolicited_offer' : Account,
    'start_date' : IDL.Nat64,
    'allow_list' : IDL.Vec(Account),
    'buy_now' : IDL.Vec(IDL.Vec(BuyNowReq)),
    'fee_accounts' : IDL.Vec(IDL.Tuple(FeeName, TokenSpec, Account)),
    'bid_pays_fees' : IDL.Opt(IDL.Vec(FeeName)),
    'ending' : IDL.Variant({
      'date' : IDL.Nat64,
      'perpetual' : IDL.Null,
      'timeout' : IDL.Nat64,
    }),
  });
  const TokenSpecResult = IDL.Record({
    'result' : IDL.Nat,
    'standards' : IDL.Vec(ICRCStandards),
    'ask_id' : IDL.Opt(IDL.Nat),
    'receiving_account' : Account,
    'sending_account' : Account,
    'canister' : IDL.Principal,
    'symbol' : IDL.Text,
  });
  const SettlementInfo = IDL.Record({
    'bid_tokens' : IDL.Vec(IDL.Opt(TokenSpecResult)),
    'ask_tokens' : IDL.Vec(IDL.Opt(TokenSpecResult)),
    'royalties' : IDL.Vec(IDL.Tuple(Account, IDL.Nat, IDL.Text)),
  });
  const AskStatus = IDL.Record({
    'status' : AskStatusType,
    'participants' : IDL.Vec(Account),
    'auction_info' : IDL.Opt(AuctionInfo),
    'ask_id' : IDL.Nat,
    'seller' : Account,
    'allow_list' : IDL.Opt(IDL.Vec(Account)),
    'current_broker_id' : IDL.Opt(Account),
    'config' : IDL.Vec(AskFeature),
    'original_broker_id' : IDL.Opt(Account),
    'settled_at' : IDL.Opt(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'settlement' : IDL.Opt(SettlementInfo),
  });
  const ManageAskRequest = IDL.Variant({
    'new_ask' : IDL.Vec(IDL.Opt(AskFeature)),
    'reject_offer' : IDL.Nat,
    'withdraw_escrow' : EscrowRecord,
    'unencumber' : IDL.Nat,
    'end_ask' : IDL.Nat,
    'distribute_ask' : IDL.Nat,
    'refresh_offers' : IDL.Opt(Account),
    'withdraw_settlement' : EscrowRecord,
  });
  const NewAskResult = IDL.Record({
    'ask_id' : IDL.Nat,
    'escrow_records' : IDL.Vec(EscrowRecord),
  });
  const GenericError = IDL.Record({
    'message' : IDL.Text,
    'error_code' : IDL.Nat,
  });
  const ManageAskResponse = IDL.Variant({
    'new_ask' : IDL.Variant({ 'Ok' : NewAskResult, 'Err' : GenericError }),
    'end_ask' : IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : GenericError }),
    'distribute_ask' : IDL.Variant({
      'Ok' : IDL.Vec(
        IDL.Record({
          'result' : IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : GenericError }),
          'token' : TokenSpec,
        })
      ),
      'Err' : GenericError,
    }),
    'refresh_offers' : IDL.Variant({
      'Ok' : IDL.Record({
        'eof' : IDL.Bool,
        'records' : IDL.Vec(IDL.Tuple(IDL.Vec(IDL.Nat8), IDL.Opt(AskStatus))),
        'count' : IDL.Nat,
      }),
      'Err' : GenericError,
    }),
    'withdraw_settlement' : IDL.Variant({
      'Ok' : IDL.Record({
        'token_results' : IDL.Vec(
          IDL.Record({
            'result' : IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : GenericError }),
            'token' : TokenSpec,
          })
        ),
        'withdraw_result' : IDL.Nat,
      }),
      'Err' : GenericError,
    }),
  });
  const AskInfoRequest = IDL.Variant({
    'status' : IDL.Nat,
    'active' : IDL.Opt(IDL.Tuple(IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat))),
    'history' : IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat)),
  });
  const AskInfoResponse = IDL.Variant({
    'status' : IDL.Opt(AskStatus),
    'active' : IDL.Record({
      'eof' : IDL.Bool,
      'records' : IDL.Vec(IDL.Opt(AskStatus)),
      'count' : IDL.Nat,
    }),
    'history' : IDL.Record({
      'eof' : IDL.Bool,
      'records' : IDL.Vec(IDL.Opt(AskStatus)),
      'count' : IDL.Nat,
    }),
  });
  const BalanceRequest = IDL.Variant({
    'nfts' : IDL.Opt(
      IDL.Record({ 'prev' : IDL.Opt(IDL.Nat), 'take' : IDL.Opt(IDL.Nat) })
    ),
    'offers' : IDL.Opt(
      IDL.Record({ 'prev' : IDL.Opt(IDL.Nat), 'take' : IDL.Opt(IDL.Nat) })
    ),
    'tokens' : IDL.Null,
    'ask_settlements' : IDL.Opt(
      IDL.Record({ 'prev' : IDL.Opt(IDL.Nat), 'take' : IDL.Opt(IDL.Nat) })
    ),
    'escrow' : IDL.Opt(
      IDL.Record({ 'prev' : IDL.Opt(IDL.Nat), 'take' : IDL.Opt(IDL.Nat) })
    ),
  });
  const BalanceResult = IDL.Variant({
    'nfts' : IDL.Opt(
      IDL.Record({
        'eof' : IDL.Bool,
        'records' : IDL.Vec(EscrowRecord),
        'count' : IDL.Nat,
      })
    ),
    'offers' : IDL.Record({
      'eof' : IDL.Bool,
      'records' : IDL.Vec(EscrowRecord),
      'count' : IDL.Nat,
    }),
    'tokens' : IDL.Opt(IDL.Nat),
    'ask_settlements' : IDL.Record({
      'eof' : IDL.Bool,
      'records' : IDL.Vec(IDL.Tuple(EncumbranceDetail, EscrowRecord)),
      'count' : IDL.Nat,
    }),
    'escrow' : IDL.Record({
      'eof' : IDL.Bool,
      'records' : IDL.Vec(EscrowRecord),
      'count' : IDL.Nat,
    }),
  });
  const BidFeature = IDL.Variant({
    'fee_schema' : IDL.Text,
    'broker' : Account,
    'fee_account' : IDL.Vec(IDL.Tuple(FeeName, TokenSpec, Account)),
    'escrow' : EscrowRecord,
  });
  const EngineMatch = IDL.Record({
    'asks' : IDL.Vec(
      IDL.Record({
        'ask_canister' : IDL.Opt(IDL.Principal),
        'token' : IDL.Opt(IDL.Vec(IDL.Opt(TokenSpec))),
        'ask_id' : IDL.Nat,
      })
    ),
    'leader' : IDL.Opt(IDL.Principal),
  });
  const ManageBidRequest = IDL.Variant({
    'new_bid' : IDL.Record({
      'feature' : IDL.Vec(IDL.Opt(BidFeature)),
      'ask_id' : IDL.Nat,
    }),
    'engine_match' : EngineMatch,
    'withdraw_escrow' : EscrowRecord,
  });
  const ManageBidResponse = IDL.Variant({
    'new_bid' : IDL.Variant({
      'Ok' : IDL.Record({ 'result' : IDL.Nat, 'escrow' : EscrowRecord }),
      'Err' : GenericError,
    }),
    'engine_match' : IDL.Variant({
      'Ok' : IDL.Vec(
        IDL.Record({
          'ask_canister' : IDL.Opt(IDL.Principal),
          'token' : IDL.Opt(IDL.Vec(IDL.Opt(TokenSpecResult))),
          'ask_id' : IDL.Nat,
        })
      ),
      'Err' : GenericError,
    }),
    'withdraw_escrow' : IDL.Variant({
      'Ok' : IDL.Record({
        'token_results' : IDL.Vec(
          IDL.Record({
            'result' : IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : GenericError }),
            'token' : TokenSpec,
          })
        ),
        'withdraw_result' : IDL.Nat,
      }),
      'Err' : GenericError,
    }),
  });
  const Marketplace = IDL.Service({
    'addApprovedToken' : IDL.Func([IDL.Principal], [Result_1], []),
    'buyNFT' : IDL.Func([IDL.Nat], [Result], []),
    'createAdvancedNFTAsk' : IDL.Func(
        [
          CollectionId,
          TokenId,
          IDL.Nat,
          IDL.Record({
            'broker' : IDL.Opt(IDL.Principal),
            'endDate' : IDL.Opt(Time),
            'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
            'feeSchema' : IDL.Opt(IDL.Text),
            'allowList' : IDL.Opt(IDL.Vec(IDL.Principal)),
            'startDate' : IDL.Opt(Time),
          }),
        ],
        [Result],
        [],
      ),
    'createNFTAsk' : IDL.Func([CollectionId, TokenId, IDL.Nat], [Result], []),
    'createUnsolicitedOffer' : IDL.Func(
        [CollectionId, TokenId, IDL.Nat, IDL.Principal],
        [Result],
        [],
      ),
    'encumberAsk' : IDL.Func([IDL.Nat, IDL.Principal, Time], [Result_1], []),
    'getAllActiveAsks' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(AskStatus)],
        ['query'],
      ),
    'getMarketplaceStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'total_asks' : IDL.Nat,
            'approved_tokens' : IDL.Vec(IDL.Principal),
            'active_asks' : IDL.Nat,
            'fee_percentage' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getOwner' : IDL.Func([], [IDL.Principal], ['query']),
    'getUserAskHistory' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [IDL.Vec(AskStatus)],
        ['query'],
      ),
    'icrc8_approved_tokens' : IDL.Func(
        [],
        [IDL.Opt(IDL.Vec(IDL.Principal))],
        ['composite_query'],
      ),
    'icrc8_ask' : IDL.Func(
        [IDL.Vec(IDL.Opt(ManageAskRequest))],
        [
          IDL.Vec(
            IDL.Tuple(IDL.Opt(ManageAskRequest), IDL.Opt(ManageAskResponse))
          ),
        ],
        [],
      ),
    'icrc8_ask_info' : IDL.Func(
        [IDL.Vec(IDL.Opt(AskInfoRequest))],
        [IDL.Vec(IDL.Tuple(IDL.Opt(AskInfoRequest), IDL.Opt(AskInfoResponse)))],
        ['query'],
      ),
    'icrc8_balance_of' : IDL.Func(
        [
          IDL.Vec(
            IDL.Tuple(Account, IDL.Opt(IDL.Vec(IDL.Opt(BalanceRequest))))
          ),
        ],
        [IDL.Vec(IDL.Tuple(Account, IDL.Vec(IDL.Opt(BalanceResult))))],
        ['query'],
      ),
    'icrc8_bid' : IDL.Func(
        [IDL.Vec(IDL.Opt(ManageBidRequest))],
        [
          IDL.Vec(
            IDL.Tuple(IDL.Opt(ManageBidRequest), IDL.Opt(ManageBidResponse))
          ),
        ],
        [],
      ),
    'icrc8_metadata' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Text,
              IDL.Variant({
                'Int' : IDL.Int,
                'Nat' : IDL.Nat,
                'Blob' : IDL.Vec(IDL.Nat8),
                'Text' : IDL.Text,
                'Array' : IDL.Vec(IDL.Nat),
              }),
            )
          ),
        ],
        ['query'],
      ),
    'icrc8_supported_standards' : IDL.Func(
        [],
        [IDL.Vec(IDL.Record({ 'url' : IDL.Text, 'name' : IDL.Text }))],
        ['query'],
      ),
    'unencumberAsk' : IDL.Func([IDL.Nat], [Result_1], []),
    'updateFeePercentage' : IDL.Func([IDL.Nat], [Result], []),
  });
  return Marketplace;
};
export const init = ({ IDL }) => { return []; };
