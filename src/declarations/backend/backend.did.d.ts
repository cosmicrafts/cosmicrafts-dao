import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Account__1 {
  'owner' : Principal,
  'subaccount' : [] | [Subaccount],
}
export interface AchievementCategory {
  'id' : bigint,
  'reward' : Array<AchievementReward>,
  'requiredProgress' : bigint,
  'name' : string,
  'completed' : boolean,
  'claimed' : boolean,
  'progress' : bigint,
  'achievements' : Array<AchievementLine>,
}
export interface AchievementLine {
  'id' : bigint,
  'categoryId' : bigint,
  'individualAchievements' : Array<IndividualAchievement>,
  'reward' : Array<AchievementReward>,
  'requiredProgress' : bigint,
  'name' : string,
  'completed' : boolean,
  'claimed' : boolean,
  'progress' : bigint,
}
export interface AchievementReward {
  'rewardType' : AchievementRewardsType,
  'amount' : bigint,
}
export type AchievementRewardsType = { 'XP' : null } |
  { 'NFT' : null } |
  { 'Stardust' : null } |
  { 'Avatar' : null } |
  { 'Title' : null } |
  { 'Chest' : null } |
  { 'Multiplier' : null };
export type AchievementType = { 'WeeklyMissionsCompleted' : null } |
  { 'UnitsDeployed' : null } |
  { 'ShardsMinted' : null } |
  { 'DailyMissionsCompleted' : null } |
  { 'GamesPlayed' : null } |
  { 'DamageDealt' : null } |
  { 'ChestsOpened' : null } |
  { 'Customization' : null } |
  { 'LevelReached' : null } |
  { 'RewardsClaimed' : null } |
  { 'NFTsMinted' : null } |
  { 'UpgradeNFT' : null } |
  { 'DamageTaken' : null } |
  { 'AchievementsUnlocked' : null } |
  { 'ChestsMinted' : null } |
  { 'Social' : null } |
  { 'XPEarned' : null } |
  { 'Kills' : null } |
  { 'GamesWithFaction' : null } |
  { 'GamesCompleted' : null } |
  { 'EnergyUsed' : null } |
  { 'GamesWon' : null } |
  { 'GameModePlayed' : null } |
  { 'FluxMinted' : null } |
  { 'TimePlayed' : null } |
  { 'GamesWithCharacter' : null } |
  { 'FriendsAdded' : null } |
  { 'UserMissionsCompleted' : null };
export type AdminFunction = { 'MintChest' : [Principal, bigint] } |
  { 'CreateMissionsPeriodically' : null } |
  { 'GetInitArgs' : CollectionInitArgs } |
  {
    'CreateMission' : [
      string,
      MissionCategory,
      MissionType,
      RewardType,
      bigint,
      bigint,
      bigint,
    ]
  } |
  { 'GetCollectionOwner' : Account } |
  { 'BurnToken' : [[] | [Account], Account, TokenId, bigint] };
export interface AdvancedSettings {
  'permitted_drift' : Timestamp,
  'burned_tokens' : Balance,
  'transaction_window' : Timestamp,
}
export interface ApprovalArgs {
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Subaccount],
  'token_ids' : [] | [Array<TokenId>],
  'created_at_time' : [] | [bigint],
  'expires_at' : [] | [bigint],
  'spender' : Account,
}
export type ApprovalError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : {} } |
  { 'Unauthorized' : { 'token_ids' : Array<TokenId> } } |
  { 'TooOld' : null };
export type ApprovalId = bigint;
export type ApprovalReceipt = { 'Ok' : ApprovalId } |
  { 'Err' : ApprovalError };
export interface ArchivedTransaction {
  'callback' : QueryArchiveFn,
  'start' : TxIndex,
  'length' : bigint,
}
export interface Avatar { 'id' : bigint, 'description' : string }
export type AvatarID = bigint;
export interface AverageStats {
  'averageDamageDealt' : bigint,
  'averageEnergyGenerated' : bigint,
  'averageEnergyUsed' : bigint,
  'averageKills' : bigint,
  'averageEnergyWasted' : bigint,
  'averageXpEarned' : bigint,
}
export type Balance = bigint;
export type BalanceResult = { 'Ok' : bigint } |
  { 'Err' : CallError };
export interface BasicMetadata {
  'damage' : bigint,
  'level' : bigint,
  'health' : bigint,
}
export interface BasicStats { 'playerStats' : Array<PlayerStats> }
export interface Burn {
  'from' : Account__1,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : Balance,
}
export interface BurnArgs {
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Subaccount],
  'created_at_time' : [] | [bigint],
  'amount' : Balance,
}
export type CallError = { 'GenericError' : null } |
  { 'SupplyCapOverflow' : null } |
  { 'InvalidTokenId' : null } |
  { 'Unauthorized' : null } |
  { 'InvalidRecipient' : null } |
  { 'AlreadyExistTokenId' : null };
export type CanisterCyclesAggregatedData = BigUint64Array | bigint[];
export type CanisterHeapMemoryAggregatedData = BigUint64Array | bigint[];
export type CanisterLogFeature = { 'filterMessageByContains' : null } |
  { 'filterMessageByRegex' : null };
export interface CanisterLogMessages {
  'data' : Array<LogMessagesData>,
  'lastAnalyzedMessageTimeNanos' : [] | [Nanos],
}
export interface CanisterLogMessagesInfo {
  'features' : Array<[] | [CanisterLogFeature]>,
  'lastTimeNanos' : [] | [Nanos],
  'count' : number,
  'firstTimeNanos' : [] | [Nanos],
}
export type CanisterLogRequest = { 'getMessagesInfo' : null } |
  { 'getMessages' : GetLogMessagesParameters } |
  { 'getLatestMessages' : GetLatestLogMessagesParameters };
export type CanisterLogResponse = { 'messagesInfo' : CanisterLogMessagesInfo } |
  { 'messages' : CanisterLogMessages };
export type CanisterMemoryAggregatedData = BigUint64Array | bigint[];
export interface CanisterMetrics { 'data' : CanisterMetricsData }
export type CanisterMetricsData = { 'hourly' : Array<HourlyMetricsData> } |
  { 'daily' : Array<DailyMetricsData> };
export type Category = { 'Avatar' : null } |
  { 'Unit' : Unit } |
  { 'Trophy' : null } |
  { 'Chest' : null };
export type CollectMetricsRequestType = { 'force' : null } |
  { 'normal' : null };
export interface CollectionInitArgs {
  'name' : string,
  'description' : [] | [string],
  'supplyCap' : [] | [bigint],
  'royalties' : [] | [number],
  'royaltyRecipient' : [] | [Account],
  'image' : [] | [Uint8Array | number[]],
  'symbol' : string,
}
export interface CollectionMetadata {
  'name' : string,
  'description' : [] | [string],
  'supplyCap' : [] | [bigint],
  'totalSupply' : bigint,
  'royalties' : [] | [number],
  'royaltyRecipient' : [] | [Account],
  'image' : [] | [Uint8Array | number[]],
  'symbol' : string,
}
export interface Cosmicrafts {
  'acceptFriendRequest' : ActorMethod<[PlayerId], [boolean, string]>,
  'add' : ActorMethod<[bigint, bigint], bigint>,
  'addAvatarToUser' : ActorMethod<[bigint], [boolean, string]>,
  'addProgressToIndividualAchievement' : ActorMethod<
    [PlayerId, bigint, bigint],
    boolean
  >,
  'addTitleToUser' : ActorMethod<[bigint], [boolean, string]>,
  'admin' : ActorMethod<[AdminFunction], [boolean, string]>,
  'adminUpdateMatch' : ActorMethod<[bigint, bigint, bigint, string], boolean>,
  'assignAchievementsToUser' : ActorMethod<[PlayerId], undefined>,
  'blockUser' : ActorMethod<[PlayerId], [boolean, string]>,
  'burn' : ActorMethod<[BurnArgs], TransferResult>,
  'cancelMatchmaking' : ActorMethod<[], [boolean, string]>,
  'claimAchievementLineReward' : ActorMethod<[bigint], [boolean, string]>,
  'claimCategoryAchievementReward' : ActorMethod<[bigint], [boolean, string]>,
  'claimGeneralReward' : ActorMethod<[bigint], [boolean, string]>,
  'claimIndividualAchievementReward' : ActorMethod<[bigint], [boolean, string]>,
  'claimUserReward' : ActorMethod<[bigint], [boolean, string]>,
  'createAchievement' : ActorMethod<
    [bigint, string, Array<AchievementReward>],
    [boolean, string, bigint]
  >,
  'createAchievementCategory' : ActorMethod<
    [string, Array<AchievementReward>],
    [boolean, string, bigint]
  >,
  'createBatchOfUnassignedCodes' : ActorMethod<[], Array<ReferralCode>>,
  'createIndividualAchievement' : ActorMethod<
    [bigint, string, AchievementType, bigint, Array<AchievementReward>],
    [boolean, string, bigint]
  >,
  'createTournament' : ActorMethod<[string, Time, string, Time], bigint>,
  'createUserMission' : ActorMethod<[PlayerId], [boolean, string, bigint]>,
  'declineFriendRequest' : ActorMethod<[PlayerId], [boolean, string]>,
  'deleteAccount' : ActorMethod<[], [boolean, string]>,
  'deleteAllTournaments' : ActorMethod<[], boolean>,
  'deposit_cycles' : ActorMethod<[], undefined>,
  'disputeMatch' : ActorMethod<[bigint, bigint, string], boolean>,
  'dumpAllPlayerMultipliers' : ActorMethod<[], Array<[PlayerId, number]>>,
  'getAchievements' : ActorMethod<[], Array<AchievementCategory>>,
  'getActiveTournaments' : ActorMethod<[], Array<Tournament>>,
  'getAllAchievementsData' : ActorMethod<[], Array<AchievementCategory>>,
  'getAllPlayers' : ActorMethod<[], Array<Player>>,
  'getAllSearching' : ActorMethod<[], Array<MatchData>>,
  'getAllTournaments' : ActorMethod<[], Array<Tournament>>,
  'getAvailableAvatarDetails' : ActorMethod<[], Array<Avatar>>,
  'getAvailableAvatars' : ActorMethod<[], Array<bigint>>,
  'getAvailableTitleDetails' : ActorMethod<[], Array<Title__1>>,
  'getAvailableTitles' : ActorMethod<[], Array<bigint>>,
  'getAvatarById' : ActorMethod<[bigint], Avatar>,
  'getAvatars' : ActorMethod<[Principal], Array<[TokenId, TokenMetadata]>>,
  'getBeyondReferrals' : ActorMethod<[PlayerId], Array<PlayerId>>,
  'getBlockedUsers' : ActorMethod<[], Array<PlayerId>>,
  'getCanistergeekInformation' : ActorMethod<
    [GetInformationRequest],
    GetInformationResponse
  >,
  'getCharacters' : ActorMethod<[Principal], Array<[TokenId, TokenMetadata]>>,
  'getChests' : ActorMethod<[Principal], Array<[TokenId, TokenMetadata]>>,
  'getCosmicraftsStats' : ActorMethod<[], OverallStats>,
  'getDirectReferrals' : ActorMethod<[PlayerId], Array<PlayerId>>,
  'getFriendRequests' : ActorMethod<[], Array<FriendRequest>>,
  'getFriendsList' : ActorMethod<[], [] | [Array<PlayerId>]>,
  'getFullProfile' : ActorMethod<
    [PlayerId],
    [] | [[Player, PlayerGamesStats, AverageStats]]
  >,
  'getGeneralMissionProgress' : ActorMethod<
    [Principal, bigint],
    [] | [MissionsUser]
  >,
  'getGeneralMissions' : ActorMethod<[], Array<MissionsUser>>,
  'getGrandReferrer' : ActorMethod<[PlayerId], [] | [PlayerId]>,
  'getInactiveTournaments' : ActorMethod<[], Array<Tournament>>,
  'getIndirectReferrals' : ActorMethod<[PlayerId], Array<PlayerId>>,
  'getInitArgs' : ActorMethod<[], TokenInitArgs>,
  'getLastLogin' : ActorMethod<
    [PlayerId],
    [] | [{ 'country' : [] | [string], 'timestamp' : bigint }]
  >,
  'getMatchDetails' : ActorMethod<
    [MatchID],
    [] | [[MatchData, Array<[Player, PlayerGamesStats]>]]
  >,
  'getMatchHistoryByPrincipal' : ActorMethod<
    [PlayerId],
    Array<[MatchID, [] | [BasicStats]]>
  >,
  'getMatchIDsByPrincipal' : ActorMethod<[PlayerId], Array<MatchID>>,
  'getMatchParticipants' : ActorMethod<
    [MatchID],
    [] | [[Principal, [] | [Principal]]]
  >,
  'getMatchSearching' : ActorMethod<[], [MMSearchStatus, bigint, string]>,
  'getMatchStats' : ActorMethod<[MatchID], [] | [BasicStats]>,
  'getMessage' : ActorMethod<[], string>,
  'getMintedInfo' : ActorMethod<
    [Principal],
    {
      'stardust' : bigint,
      'gameNFTs' : { 'tokenIDs' : Array<TokenID>, 'quantity' : bigint },
      'chests' : { 'tokenIDs' : Array<TokenID>, 'quantity' : bigint },
    }
  >,
  'getMultiplier' : ActorMethod<[PlayerId], number>,
  'getMyMatchData' : ActorMethod<[], [[] | [FullMatchData], bigint]>,
  'getMyPrivacySettings' : ActorMethod<[], PrivacySetting>,
  'getMyStats' : ActorMethod<[], [] | [PlayerGamesStats]>,
  'getNFTs' : ActorMethod<[Principal], Array<[TokenId, TokenMetadata]>>,
  'getNotifications' : ActorMethod<[], Array<Notification>>,
  'getPlayer' : ActorMethod<[], [] | [Player]>,
  'getPlayerAverageStats' : ActorMethod<[Principal], [] | [AverageStats]>,
  'getPlayerDeck' : ActorMethod<[Principal], [] | [Array<TokenId>]>,
  'getPlayerElo' : ActorMethod<[Principal], number>,
  'getPlayerStats' : ActorMethod<[PlayerId], [] | [PlayerGamesStats]>,
  'getProfile' : ActorMethod<[PlayerId], [] | [Player]>,
  'getReferralCode' : ActorMethod<[PlayerId], [] | [ReferralCode]>,
  'getReferrer' : ActorMethod<[PlayerId], [] | [PlayerId]>,
  'getRegisteredUsers' : ActorMethod<[bigint], Array<Principal>>,
  'getSelectedAvatar' : ActorMethod<[], [] | [bigint]>,
  'getSelectedTitle' : ActorMethod<[], [] | [bigint]>,
  'getTitleById' : ActorMethod<[bigint], Title__1>,
  'getTotalPlayers' : ActorMethod<[], bigint>,
  'getTotalReferralNetwork' : ActorMethod<
    [PlayerId],
    {
      'directReferrals' : Array<PlayerId>,
      'indirectReferrals' : Array<PlayerId>,
      'beyondReferrals' : Array<PlayerId>,
    }
  >,
  'getTournamentBracket' : ActorMethod<[bigint], { 'matches' : Array<Match> }>,
  'getTransactionLogs' : ActorMethod<[Principal, ItemType], Array<LogEntry>>,
  'getTrophies' : ActorMethod<[Principal], Array<[TokenId, TokenMetadata]>>,
  'getUnits' : ActorMethod<[Principal], Array<[TokenId, TokenMetadata]>>,
  'getUserAchievementsStructure' : ActorMethod<
    [PlayerId],
    Array<AchievementCategory>
  >,
  'getUserAchievementsStructureByCaller' : ActorMethod<
    [],
    Array<AchievementCategory>
  >,
  'getUserMissionProgress' : ActorMethod<
    [PlayerId, bigint],
    [] | [MissionsUser]
  >,
  'getUserMissions' : ActorMethod<[], Array<MissionsUser>>,
  'get_collection_owner' : ActorMethod<[], Account>,
  'get_transaction' : ActorMethod<[TxIndex], [] | [Transaction__1]>,
  'get_transactions' : ActorMethod<
    [GetTransactionsRequest],
    GetTransactionsResponse
  >,
  'greet' : ActorMethod<[string], string>,
  'handleCombatXP' : ActorMethod<[Array<TokenId>, bigint], Array<TokenId>>,
  'icrc1_balance_of' : ActorMethod<[Account__1], Balance>,
  'icrc1_decimals' : ActorMethod<[], number>,
  'icrc1_fee' : ActorMethod<[], Balance>,
  'icrc1_metadata' : ActorMethod<[], Array<MetaDatum>>,
  'icrc1_minting_account' : ActorMethod<[], [] | [Account__1]>,
  'icrc1_name' : ActorMethod<[], string>,
  'icrc1_pay_for_transaction' : ActorMethod<
    [TransferArgs__1, Principal],
    TransferResult
  >,
  'icrc1_supported_standards' : ActorMethod<[], Array<SupportedStandard>>,
  'icrc1_symbol' : ActorMethod<[], string>,
  'icrc1_total_supply' : ActorMethod<[], Balance>,
  'icrc1_transfer' : ActorMethod<[TransferArgs__1], TransferResult>,
  'icrc7_approve' : ActorMethod<[ApprovalArgs], ApprovalReceipt>,
  'icrc7_balance_of' : ActorMethod<[Account], BalanceResult>,
  'icrc7_collection_metadata' : ActorMethod<[], CollectionMetadata>,
  'icrc7_description' : ActorMethod<[], [] | [string]>,
  'icrc7_get_transactions' : ActorMethod<
    [GetTransactionsArgs],
    GetTransactionsResult
  >,
  'icrc7_image' : ActorMethod<[], [] | [Uint8Array | number[]]>,
  'icrc7_metadata' : ActorMethod<[TokenId], MetadataResult>,
  'icrc7_name' : ActorMethod<[], string>,
  'icrc7_owner_of' : ActorMethod<[TokenId], OwnerResult>,
  'icrc7_royalties' : ActorMethod<[], [] | [number]>,
  'icrc7_royalty_recipient' : ActorMethod<[], [] | [Account]>,
  'icrc7_supply_cap' : ActorMethod<[], [] | [bigint]>,
  'icrc7_supported_standards' : ActorMethod<[], Array<SupportedStandard>>,
  'icrc7_symbol' : ActorMethod<[], string>,
  'icrc7_tokens_of' : ActorMethod<[Account], TokensOfResult>,
  'icrc7_total_supply' : ActorMethod<[], bigint>,
  'icrc7_transfer' : ActorMethod<[TransferArgs], TransferReceipt>,
  'isEven' : ActorMethod<[bigint], boolean>,
  'isGameMatched' : ActorMethod<[], [boolean, string]>,
  'joinTournament' : ActorMethod<[bigint], boolean>,
  'loadAchievements' : ActorMethod<[], boolean>,
  'login' : ActorMethod<[[] | [string]], [boolean, string]>,
  'mint' : ActorMethod<[Mint], TransferResult>,
  'mintAchievementRewards' : ActorMethod<
    [AchievementReward, PlayerId],
    [boolean, string]
  >,
  'mintChest' : ActorMethod<[Principal, bigint], [boolean, string]>,
  'mintDeck' : ActorMethod<[], [boolean, string, Array<TokenId>]>,
  'mintNFT' : ActorMethod<[MintArgs], MintReceipt>,
  'openChest' : ActorMethod<[bigint], [boolean, string]>,
  'saveFinishedGame' : ActorMethod<
    [
      MatchID,
      {
        'secRemaining' : bigint,
        'energyGenerated' : bigint,
        'damageDealt' : bigint,
        'wonGame' : boolean,
        'botMode' : bigint,
        'deploys' : bigint,
        'damageTaken' : bigint,
        'damageCritic' : bigint,
        'damageEvaded' : bigint,
        'energyChargeRate' : bigint,
        'faction' : bigint,
        'energyUsed' : bigint,
        'gameMode' : bigint,
        'energyWasted' : bigint,
        'xpEarned' : bigint,
        'characterID' : bigint,
        'botDifficulty' : bigint,
        'kills' : bigint,
      },
    ],
    [boolean, string]
  >,
  'searchActiveGeneralMissions' : ActorMethod<[Principal], Array<MissionsUser>>,
  'searchActiveUserMissions' : ActorMethod<[PlayerId], Array<MissionsUser>>,
  'searchUserByUsername' : ActorMethod<[Username], Array<Player>>,
  'selectRandomUnits' : ActorMethod<[Array<TokenId>], Array<TokenId>>,
  'sendFriendRequest' : ActorMethod<[PlayerId], [boolean, string]>,
  'setMessage' : ActorMethod<[string], undefined>,
  'setPlayerActive' : ActorMethod<[], boolean>,
  'setPrivacySetting' : ActorMethod<[PrivacySetting], [boolean, string]>,
  'signup' : ActorMethod<
    [Username, AvatarID, [] | [ReferralCode], string],
    [boolean, [] | [Player], string]
  >,
  'storeCurrentDeck' : ActorMethod<[Array<TokenId>], boolean>,
  'submitFeedback' : ActorMethod<[bigint, string], boolean>,
  'submitMatchResult' : ActorMethod<[bigint, bigint, string], boolean>,
  'test' : ActorMethod<
    [PlayerId],
    [] | [
      {
        'xp' : bigint,
        'elo' : number,
        'gamesLost' : bigint,
        'username' : Username,
        'level' : Level,
        'gamesWon' : bigint,
      }
    ]
  >,
  'topPlayersByMultiplier' : ActorMethod<[bigint], Array<[PlayerId, number]>>,
  'unblockUser' : ActorMethod<[PlayerId], [boolean, string]>,
  'updateAddFriendAchievement' : ActorMethod<[PlayerId], [boolean, string]>,
  'updateAvatar' : ActorMethod<[bigint], [boolean, string]>,
  'updateAvatarChangeAchievement' : ActorMethod<[PlayerId], [boolean, string]>,
  'updateBracket' : ActorMethod<[bigint], boolean>,
  'updateBracketAfterMatchUpdate' : ActorMethod<
    [bigint, bigint, Principal],
    undefined
  >,
  'updateCanistergeekInformation' : ActorMethod<
    [UpdateInformationRequest],
    undefined
  >,
  'updateDescription' : ActorMethod<[Description], [boolean, PlayerId, string]>,
  'updatePlayerGameStats' : ActorMethod<
    [PlayerId, PlayerStats, bigint, bigint],
    undefined
  >,
  'updatePlayerLevel' : ActorMethod<[Principal], undefined>,
  'updateProgressManager' : ActorMethod<
    [Principal, PlayerStats],
    [boolean, string]
  >,
  'updateSoulNFTPlayed' : ActorMethod<[Array<TokenId>], Array<TokenId>>,
  'updateTitle' : ActorMethod<[bigint], [boolean, string]>,
  'updateUpgradeNFTAchievement' : ActorMethod<[PlayerId], [boolean, string]>,
  'updateUsername' : ActorMethod<[Username], [boolean, PlayerId, string]>,
  'upgradeNFT' : ActorMethod<[TokenID], [boolean, string]>,
}
export interface DailyMetricsData {
  'updateCalls' : bigint,
  'canisterHeapMemorySize' : NumericEntity,
  'canisterCycles' : NumericEntity,
  'canisterMemorySize' : NumericEntity,
  'timeMillis' : bigint,
}
export type Description = string;
export type Faction = { 'Cosmicon' : null } |
  { 'Spade' : null } |
  { 'Arch' : null } |
  { 'Celestial' : null } |
  { 'Webe' : null } |
  { 'Neutral' : null } |
  { 'Spirat' : null };
export interface FriendDetails {
  'username' : Username,
  'playerId' : PlayerId,
  'avatar' : AvatarID,
}
export interface FriendRequest {
  'to' : PlayerId,
  'from' : PlayerId,
  'timestamp' : bigint,
}
export interface FullMatchData {
  'status' : MMStatus,
  'matchID' : MatchID,
  'player1' : {
    'id' : PlayerId,
    'elo' : number,
    'username' : Username,
    'level' : Level,
    'matchAccepted' : boolean,
    'playerGameData' : PlayerGameData,
    'avatar' : AvatarID,
  },
  'player2' : [] | [
    {
      'id' : PlayerId,
      'elo' : number,
      'username' : Username,
      'level' : Level,
      'matchAccepted' : boolean,
      'playerGameData' : PlayerGameData,
      'avatar' : AvatarID,
    }
  ],
}
export interface GamesWithCharacter {
  'gamesPlayed' : bigint,
  'characterID' : bigint,
  'gamesWon' : bigint,
}
export interface GamesWithFaction {
  'gamesPlayed' : bigint,
  'gamesWon' : bigint,
  'factionID' : bigint,
}
export interface GamesWithGameMode {
  'gameModeID' : bigint,
  'gamesPlayed' : bigint,
  'gamesWon' : bigint,
}
export interface GeneralMetadata {
  'id' : bigint,
  'name' : string,
  'description' : string,
  'faction' : [] | [Faction],
  'rarity' : [] | [bigint],
  'image' : string,
}
export interface GetInformationRequest {
  'status' : [] | [StatusRequest],
  'metrics' : [] | [MetricsRequest],
  'logs' : [] | [CanisterLogRequest],
  'version' : boolean,
}
export interface GetInformationResponse {
  'status' : [] | [StatusResponse],
  'metrics' : [] | [MetricsResponse],
  'logs' : [] | [CanisterLogResponse],
  'version' : [] | [bigint],
}
export interface GetLatestLogMessagesParameters {
  'upToTimeNanos' : [] | [Nanos],
  'count' : number,
  'filter' : [] | [GetLogMessagesFilter],
}
export interface GetLogMessagesFilter {
  'analyzeCount' : number,
  'messageRegex' : [] | [string],
  'messageContains' : [] | [string],
}
export interface GetLogMessagesParameters {
  'count' : number,
  'filter' : [] | [GetLogMessagesFilter],
  'fromTimeNanos' : [] | [Nanos],
}
export interface GetMetricsParameters {
  'dateToMillis' : bigint,
  'granularity' : MetricsGranularity,
  'dateFromMillis' : bigint,
}
export interface GetTransactionsArgs {
  'offset' : bigint,
  'limit' : bigint,
  'account' : [] | [Account],
}
export interface GetTransactionsRequest { 'start' : TxIndex, 'length' : bigint }
export interface GetTransactionsResponse {
  'first_index' : TxIndex,
  'log_length' : bigint,
  'transactions' : Array<Transaction__1>,
  'archived_transactions' : Array<ArchivedTransaction>,
}
export interface GetTransactionsResult {
  'total' : bigint,
  'transactions' : Array<Transaction>,
}
export interface HourlyMetricsData {
  'updateCalls' : UpdateCallsAggregatedData,
  'canisterHeapMemorySize' : CanisterHeapMemoryAggregatedData,
  'canisterCycles' : CanisterCyclesAggregatedData,
  'canisterMemorySize' : CanisterMemoryAggregatedData,
  'timeMillis' : bigint,
}
export interface IndividualAchievement {
  'id' : bigint,
  'reward' : Array<AchievementReward>,
  'achievementId' : bigint,
  'requiredProgress' : bigint,
  'name' : string,
  'completed' : boolean,
  'claimed' : boolean,
  'achievementType' : AchievementType,
  'progress' : bigint,
}
export type ItemType = { 'Stardust' : null } |
  { 'GameNFTs' : null } |
  { 'Chest' : null };
export type Level = bigint;
export interface LogEntry {
  'tokenID' : [] | [TokenID],
  'user' : Principal,
  'timestamp' : bigint,
  'itemType' : ItemType,
  'amount' : [] | [bigint],
}
export interface LogMessagesData { 'timeNanos' : Nanos, 'message' : string }
export interface MMInfo {
  'id' : PlayerId,
  'elo' : number,
  'username' : Username,
  'lastPlayerActive' : bigint,
  'matchAccepted' : boolean,
  'playerGameData' : PlayerGameData,
}
export type MMSearchStatus = { 'Available' : null } |
  { 'NotAvailable' : null } |
  { 'Assigned' : null };
export type MMStatus = { 'Ended' : null } |
  { 'Reserved' : null } |
  { 'Searching' : null } |
  { 'Accepted' : null } |
  { 'InGame' : null } |
  { 'Accepting' : null };
export interface Match {
  'id' : bigint,
  'status' : string,
  'result' : [] | [{ 'winner' : Principal, 'score' : string }],
  'participants' : Array<Principal>,
  'nextMatchId' : [] | [bigint],
  'tournamentId' : bigint,
}
export interface MatchData {
  'status' : MMStatus,
  'matchID' : MatchID,
  'player1' : MMInfo,
  'player2' : [] | [MMInfo],
}
export type MatchID = bigint;
export type MetaDatum = [string, Value];
export interface Metadata {
  'soul' : [] | [SoulMetadata],
  'skins' : [] | [SkinMetadata],
  'category' : Category,
  'basic' : [] | [BasicMetadata],
  'general' : GeneralMetadata,
  'skills' : [] | [SkillMetadata],
}
export type MetadataResult = { 'Ok' : Metadata } |
  { 'Err' : CallError };
export type MetricsGranularity = { 'hourly' : null } |
  { 'daily' : null };
export interface MetricsRequest { 'parameters' : GetMetricsParameters }
export interface MetricsResponse { 'metrics' : [] | [CanisterMetrics] }
export interface Mint {
  'to' : Account__1,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : Balance,
}
export interface MintArgs {
  'to' : Account,
  'token_id' : TokenId,
  'metadata' : Metadata,
}
export type MintError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'SupplyCapOverflow' : null } |
  { 'Unauthorized' : null } |
  { 'InvalidRecipient' : null } |
  { 'AlreadyExistTokenId' : null };
export type MintReceipt = { 'Ok' : TokenId } |
  { 'Err' : MintError };
export type MissionCategory = { 'Hourly' : null } |
  { 'Free' : null } |
  { 'Weekly' : null } |
  { 'Achievement' : null } |
  { 'Daily' : null };
export type MissionRewardType = { 'Stardust' : null } |
  { 'Chest' : null };
export type MissionType = { 'UnitsDeployed' : null } |
  { 'DamageDealt' : null } |
  { 'DamageTaken' : null } |
  { 'XPEarned' : null } |
  { 'Kills' : null } |
  { 'FactionPlayed' : null } |
  { 'GamesCompleted' : null } |
  { 'EnergyUsed' : null } |
  { 'GamesWon' : null } |
  { 'GameModePlayed' : null };
export interface MissionsUser {
  'total' : bigint,
  'missionType' : MissionType,
  'reward_amount' : bigint,
  'reward_type' : MissionRewardType,
  'start_date' : bigint,
  'progress' : bigint,
  'finish_date' : bigint,
  'missionCategory' : MissionCategory,
  'expiration' : bigint,
  'finished' : boolean,
  'id_mission' : bigint,
}
export type Nanos = bigint;
export interface Notification {
  'from' : PlayerId,
  'message' : string,
  'timestamp' : Time,
}
export interface NumericEntity {
  'avg' : bigint,
  'max' : bigint,
  'min' : bigint,
  'first' : bigint,
  'last' : bigint,
}
export interface OverallGamesWithCharacter {
  'gamesPlayed' : bigint,
  'characterID' : bigint,
}
export interface OverallGamesWithFaction {
  'gamesPlayed' : bigint,
  'factionID' : bigint,
}
export interface OverallGamesWithGameMode {
  'gameModeID' : bigint,
  'gamesPlayed' : bigint,
}
export interface OverallStats {
  'totalEnergyGenerated' : bigint,
  'totalGamesMP' : bigint,
  'totalGamesSP' : bigint,
  'totalGamesGameMode' : Array<OverallGamesWithGameMode>,
  'totalGamesPlayed' : bigint,
  'totalDamageDealt' : bigint,
  'totalEnergyUsed' : bigint,
  'totalTimePlayed' : bigint,
  'totalEnergyWasted' : bigint,
  'totalKills' : bigint,
  'totalXpEarned' : bigint,
  'totalGamesWithCharacter' : Array<OverallGamesWithCharacter>,
  'totalGamesWithFaction' : Array<OverallGamesWithFaction>,
}
export type OwnerResult = { 'Ok' : Account } |
  { 'Err' : CallError };
export interface Player {
  'id' : PlayerId,
  'elo' : number,
  'title' : Title,
  'username' : Username,
  'description' : Description,
  'level' : Level,
  'language' : string,
  'registrationDate' : RegistrationDate,
  'friends' : Array<FriendDetails>,
  'avatar' : AvatarID,
}
export interface PlayerGameData { 'deck' : Array<bigint> }
export interface PlayerGamesStats {
  'gamesLost' : bigint,
  'energyGenerated' : bigint,
  'gamesPlayed' : bigint,
  'totalGamesGameMode' : Array<GamesWithGameMode>,
  'totalDamageDealt' : bigint,
  'totalDamageCrit' : bigint,
  'totalDamageTaken' : bigint,
  'energyUsed' : bigint,
  'totalDamageEvaded' : bigint,
  'energyWasted' : bigint,
  'gamesWon' : bigint,
  'totalKills' : bigint,
  'totalXpEarned' : bigint,
  'totalGamesWithCharacter' : Array<GamesWithCharacter>,
  'totalGamesWithFaction' : Array<GamesWithFaction>,
}
export type PlayerId = Principal;
export interface PlayerStats {
  'secRemaining' : bigint,
  'energyGenerated' : bigint,
  'damageDealt' : bigint,
  'wonGame' : boolean,
  'playerId' : PlayerId,
  'botMode' : bigint,
  'deploys' : bigint,
  'damageTaken' : bigint,
  'damageCritic' : bigint,
  'damageEvaded' : bigint,
  'energyChargeRate' : bigint,
  'faction' : bigint,
  'energyUsed' : bigint,
  'gameMode' : bigint,
  'energyWasted' : bigint,
  'xpEarned' : bigint,
  'characterID' : bigint,
  'botDifficulty' : bigint,
  'kills' : bigint,
}
export type PrivacySetting = { 'blockAll' : null } |
  { 'acceptAll' : null } |
  { 'friendsOfFriends' : null };
export type QueryArchiveFn = ActorMethod<
  [GetTransactionsRequest],
  TransactionRange
>;
export type ReferralCode = string;
export type RegistrationDate = bigint;
export type RewardType = { 'Stardust' : null } |
  { 'Chest' : null };
export type SkillMetadata = { 'CriticalStrike' : null } |
  { 'Shield' : null } |
  { 'Evasion' : null };
export type SkinMetadata = { 'Skin' : null };
export interface SoulMetadata {
  'gamesPlayed' : [] | [bigint],
  'totalDamageDealt' : [] | [bigint],
  'birth' : Time,
  'totalKills' : [] | [bigint],
  'combatExperience' : bigint,
}
export interface StatusRequest {
  'memory_size' : boolean,
  'cycles' : boolean,
  'heap_memory_size' : boolean,
}
export interface StatusResponse {
  'memory_size' : [] | [bigint],
  'cycles' : [] | [bigint],
  'heap_memory_size' : [] | [bigint],
}
export type Subaccount = Uint8Array | number[];
export interface SupportedStandard { 'url' : string, 'name' : string }
export type Time = bigint;
export type Timestamp = bigint;
export type Title = string;
export interface Title__1 {
  'id' : bigint,
  'title' : string,
  'description' : string,
}
export type TokenID = bigint;
export type TokenId = bigint;
export interface TokenInitArgs {
  'fee' : Balance,
  'advanced_settings' : [] | [AdvancedSettings],
  'decimals' : number,
  'minting_account' : [] | [Account__1],
  'logo' : string,
  'name' : string,
  'initial_balances' : Array<[Account__1, Balance]>,
  'min_burn_amount' : Balance,
  'max_supply' : Balance,
  'symbol' : string,
}
export interface TokenMetadata {
  'tokenId' : TokenId,
  'owner' : Account,
  'metadata' : Metadata,
}
export type TokensOfResult = { 'Ok' : Array<TokenId> } |
  { 'Err' : CallError };
export interface Tournament {
  'id' : bigint,
  'participants' : Array<Principal>,
  'name' : string,
  'isActive' : boolean,
  'expirationDate' : Time,
  'matchCounter' : bigint,
  'registeredParticipants' : Array<Principal>,
  'bracketCreated' : boolean,
  'prizePool' : string,
  'startDate' : Time,
}
export interface Transaction {
  'kind' : string,
  'mint' : [] | [{ 'to' : Account, 'token_ids' : Array<TokenId> }],
  'icrc7_transfer' : [] | [
    {
      'to' : Account,
      'from' : Account,
      'memo' : [] | [Uint8Array | number[]],
      'token_ids' : Array<TokenId>,
      'created_at_time' : [] | [bigint],
      'spender' : [] | [Account],
    }
  ],
  'upgrade' : [] | [
    {
      'new_metadata' : Array<[string, Metadata]>,
      'token_id' : [] | [TokenId],
      'memo' : [] | [Uint8Array | number[]],
      'upgraded_at' : [] | [bigint],
      'prev_metadata' : Array<[string, Metadata]>,
    }
  ],
  'timestamp' : bigint,
  'icrc7_approve' : [] | [
    {
      'from' : Account,
      'memo' : [] | [Uint8Array | number[]],
      'token_ids' : [] | [Array<TokenId>],
      'created_at_time' : [] | [bigint],
      'expires_at' : [] | [bigint],
      'spender' : Account,
    }
  ],
}
export interface TransactionRange { 'transactions' : Array<Transaction__1> }
export interface Transaction__1 {
  'burn' : [] | [Burn],
  'kind' : string,
  'mint' : [] | [Mint],
  'timestamp' : Timestamp,
  'index' : TxIndex,
  'transfer' : [] | [Transfer],
}
export interface Transfer {
  'to' : Account__1,
  'fee' : [] | [Balance],
  'from' : Account__1,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : Balance,
}
export interface TransferArgs {
  'to' : Account,
  'spender_subaccount' : [] | [Subaccount],
  'from' : [] | [Account],
  'memo' : [] | [Uint8Array | number[]],
  'is_atomic' : [] | [boolean],
  'token_ids' : Array<TokenId>,
  'created_at_time' : [] | [bigint],
}
export interface TransferArgs__1 {
  'to' : Account__1,
  'fee' : [] | [Balance],
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Subaccount],
  'created_at_time' : [] | [bigint],
  'amount' : Balance,
}
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : Balance } } |
  { 'Duplicate' : { 'duplicate_of' : TxIndex } } |
  { 'BadFee' : { 'expected_fee' : Balance } } |
  { 'CreatedInFuture' : { 'ledger_time' : Timestamp } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : Balance } };
export type TransferError__1 = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : {} } |
  { 'Duplicate' : { 'duplicate_of' : TransferId } } |
  { 'Unauthorized' : { 'token_ids' : Array<TokenId> } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null };
export type TransferId = bigint;
export type TransferReceipt = { 'Ok' : TransferId } |
  { 'Err' : TransferError__1 };
export type TransferResult = { 'Ok' : TxIndex } |
  { 'Err' : TransferError };
export type TxIndex = bigint;
export type Unit = { 'Station' : null } |
  { 'Weapon' : null } |
  { 'Spaceship' : null } |
  { 'Character' : null };
export type UpdateCallsAggregatedData = BigUint64Array | bigint[];
export interface UpdateInformationRequest {
  'metrics' : [] | [CollectMetricsRequestType],
}
export type Username = string;
export type Value = { 'Int' : bigint } |
  { 'Nat' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Text' : string };
export interface _SERVICE extends Cosmicrafts {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
