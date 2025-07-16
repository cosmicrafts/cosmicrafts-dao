export const idlFactory = ({ IDL }) => {
  const PlayerId = IDL.Principal;
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const CollectionInitArgs = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'supplyCap' : IDL.Opt(IDL.Nat),
    'royalties' : IDL.Opt(IDL.Nat16),
    'royaltyRecipient' : IDL.Opt(Account),
    'image' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'symbol' : IDL.Text,
  });
  const MissionCategory = IDL.Variant({
    'Hourly' : IDL.Null,
    'Free' : IDL.Null,
    'Weekly' : IDL.Null,
    'Achievement' : IDL.Null,
    'Daily' : IDL.Null,
  });
  const MissionType = IDL.Variant({
    'UnitsDeployed' : IDL.Null,
    'DamageDealt' : IDL.Null,
    'DamageTaken' : IDL.Null,
    'XPEarned' : IDL.Null,
    'Kills' : IDL.Null,
    'FactionPlayed' : IDL.Null,
    'GamesCompleted' : IDL.Null,
    'EnergyUsed' : IDL.Null,
    'GamesWon' : IDL.Null,
    'GameModePlayed' : IDL.Null,
  });
  const RewardType = IDL.Variant({ 'Stardust' : IDL.Null, 'Chest' : IDL.Null });
  const TokenId = IDL.Nat;
  const AdminFunction = IDL.Variant({
    'MintChest' : IDL.Tuple(IDL.Principal, IDL.Nat),
    'CreateMissionsPeriodically' : IDL.Null,
    'GetInitArgs' : CollectionInitArgs,
    'CreateMission' : IDL.Tuple(
      IDL.Text,
      MissionCategory,
      MissionType,
      RewardType,
      IDL.Nat,
      IDL.Nat,
      IDL.Nat64,
    ),
    'GetCollectionOwner' : Account,
    'BurnToken' : IDL.Tuple(IDL.Opt(Account), Account, TokenId, IDL.Nat64),
  });
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat;
  const BurnArgs = IDL.Record({
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(Subaccount),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance,
  });
  const TxIndex = IDL.Nat;
  const Timestamp = IDL.Nat64;
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : Balance }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : TxIndex }),
    'BadFee' : IDL.Record({ 'expected_fee' : Balance }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : Timestamp }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Balance }),
  });
  const TransferResult = IDL.Variant({ 'Ok' : TxIndex, 'Err' : TransferError });
  const AchievementRewardsType = IDL.Variant({
    'XP' : IDL.Null,
    'NFT' : IDL.Null,
    'Stardust' : IDL.Null,
    'Avatar' : IDL.Null,
    'Title' : IDL.Null,
    'Chest' : IDL.Null,
    'Multiplier' : IDL.Null,
  });
  const AchievementReward = IDL.Record({
    'rewardType' : AchievementRewardsType,
    'amount' : IDL.Nat,
  });
  const ReferralCode = IDL.Text;
  const AchievementType = IDL.Variant({
    'WeeklyMissionsCompleted' : IDL.Null,
    'UnitsDeployed' : IDL.Null,
    'ShardsMinted' : IDL.Null,
    'DailyMissionsCompleted' : IDL.Null,
    'GamesPlayed' : IDL.Null,
    'DamageDealt' : IDL.Null,
    'ChestsOpened' : IDL.Null,
    'Customization' : IDL.Null,
    'LevelReached' : IDL.Null,
    'RewardsClaimed' : IDL.Null,
    'NFTsMinted' : IDL.Null,
    'UpgradeNFT' : IDL.Null,
    'DamageTaken' : IDL.Null,
    'AchievementsUnlocked' : IDL.Null,
    'ChestsMinted' : IDL.Null,
    'Social' : IDL.Null,
    'XPEarned' : IDL.Null,
    'Kills' : IDL.Null,
    'GamesWithFaction' : IDL.Null,
    'GamesCompleted' : IDL.Null,
    'EnergyUsed' : IDL.Null,
    'GamesWon' : IDL.Null,
    'GameModePlayed' : IDL.Null,
    'FluxMinted' : IDL.Null,
    'TimePlayed' : IDL.Null,
    'GamesWithCharacter' : IDL.Null,
    'FriendsAdded' : IDL.Null,
    'UserMissionsCompleted' : IDL.Null,
  });
  const Time = IDL.Int;
  const IndividualAchievement = IDL.Record({
    'id' : IDL.Nat,
    'reward' : IDL.Vec(AchievementReward),
    'achievementId' : IDL.Nat,
    'requiredProgress' : IDL.Nat,
    'name' : IDL.Text,
    'completed' : IDL.Bool,
    'claimed' : IDL.Bool,
    'achievementType' : AchievementType,
    'progress' : IDL.Nat,
  });
  const AchievementLine = IDL.Record({
    'id' : IDL.Nat,
    'categoryId' : IDL.Nat,
    'individualAchievements' : IDL.Vec(IndividualAchievement),
    'reward' : IDL.Vec(AchievementReward),
    'requiredProgress' : IDL.Nat,
    'name' : IDL.Text,
    'completed' : IDL.Bool,
    'claimed' : IDL.Bool,
    'progress' : IDL.Nat,
  });
  const AchievementCategory = IDL.Record({
    'id' : IDL.Nat,
    'reward' : IDL.Vec(AchievementReward),
    'requiredProgress' : IDL.Nat,
    'name' : IDL.Text,
    'completed' : IDL.Bool,
    'claimed' : IDL.Bool,
    'progress' : IDL.Nat,
    'achievements' : IDL.Vec(AchievementLine),
  });
  const Tournament = IDL.Record({
    'id' : IDL.Nat,
    'participants' : IDL.Vec(IDL.Principal),
    'name' : IDL.Text,
    'isActive' : IDL.Bool,
    'expirationDate' : Time,
    'matchCounter' : IDL.Nat,
    'registeredParticipants' : IDL.Vec(IDL.Principal),
    'bracketCreated' : IDL.Bool,
    'prizePool' : IDL.Text,
    'startDate' : Time,
  });
  const Title = IDL.Text;
  const Username = IDL.Text;
  const Description = IDL.Text;
  const Level = IDL.Nat;
  const RegistrationDate = IDL.Int;
  const AvatarID = IDL.Nat;
  const FriendDetails = IDL.Record({
    'username' : Username,
    'playerId' : PlayerId,
    'avatar' : AvatarID,
  });
  const Player = IDL.Record({
    'id' : PlayerId,
    'elo' : IDL.Float64,
    'title' : Title,
    'username' : Username,
    'description' : Description,
    'level' : Level,
    'language' : IDL.Text,
    'registrationDate' : RegistrationDate,
    'friends' : IDL.Vec(FriendDetails),
    'avatar' : AvatarID,
  });
  const MMStatus = IDL.Variant({
    'Ended' : IDL.Null,
    'Reserved' : IDL.Null,
    'Searching' : IDL.Null,
    'Accepted' : IDL.Null,
    'InGame' : IDL.Null,
    'Accepting' : IDL.Null,
  });
  const MatchID = IDL.Nat;
  const PlayerGameData = IDL.Record({ 'deck' : IDL.Vec(IDL.Nat) });
  const MMInfo = IDL.Record({
    'id' : PlayerId,
    'elo' : IDL.Float64,
    'username' : Username,
    'lastPlayerActive' : IDL.Nat64,
    'matchAccepted' : IDL.Bool,
    'playerGameData' : PlayerGameData,
  });
  const MatchData = IDL.Record({
    'status' : MMStatus,
    'matchID' : MatchID,
    'player1' : MMInfo,
    'player2' : IDL.Opt(MMInfo),
  });
  const Avatar = IDL.Record({ 'id' : IDL.Nat, 'description' : IDL.Text });
  const Title__1 = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'description' : IDL.Text,
  });
  const SoulMetadata = IDL.Record({
    'gamesPlayed' : IDL.Opt(IDL.Nat),
    'totalDamageDealt' : IDL.Opt(IDL.Nat),
    'birth' : Time,
    'totalKills' : IDL.Opt(IDL.Nat),
    'combatExperience' : IDL.Nat,
  });
  const SkinMetadata = IDL.Variant({ 'Skin' : IDL.Null });
  const Unit = IDL.Variant({
    'Station' : IDL.Null,
    'Weapon' : IDL.Null,
    'Spaceship' : IDL.Null,
    'Character' : IDL.Null,
  });
  const Category = IDL.Variant({
    'Avatar' : IDL.Null,
    'Unit' : Unit,
    'Trophy' : IDL.Null,
    'Chest' : IDL.Null,
  });
  const BasicMetadata = IDL.Record({
    'damage' : IDL.Nat,
    'level' : IDL.Nat,
    'health' : IDL.Nat,
  });
  const Faction = IDL.Variant({
    'Cosmicon' : IDL.Null,
    'Spade' : IDL.Null,
    'Arch' : IDL.Null,
    'Celestial' : IDL.Null,
    'Webe' : IDL.Null,
    'Neutral' : IDL.Null,
    'Spirat' : IDL.Null,
  });
  const GeneralMetadata = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'faction' : IDL.Opt(Faction),
    'rarity' : IDL.Opt(IDL.Nat),
    'image' : IDL.Text,
  });
  const SkillMetadata = IDL.Variant({
    'CriticalStrike' : IDL.Null,
    'Shield' : IDL.Null,
    'Evasion' : IDL.Null,
  });
  const Metadata = IDL.Record({
    'soul' : IDL.Opt(SoulMetadata),
    'skins' : IDL.Opt(SkinMetadata),
    'category' : Category,
    'basic' : IDL.Opt(BasicMetadata),
    'general' : GeneralMetadata,
    'skills' : IDL.Opt(SkillMetadata),
  });
  const TokenMetadata = IDL.Record({
    'tokenId' : TokenId,
    'owner' : Account,
    'metadata' : Metadata,
  });
  const StatusRequest = IDL.Record({
    'memory_size' : IDL.Bool,
    'cycles' : IDL.Bool,
    'heap_memory_size' : IDL.Bool,
  });
  const MetricsGranularity = IDL.Variant({
    'hourly' : IDL.Null,
    'daily' : IDL.Null,
  });
  const GetMetricsParameters = IDL.Record({
    'dateToMillis' : IDL.Nat,
    'granularity' : MetricsGranularity,
    'dateFromMillis' : IDL.Nat,
  });
  const MetricsRequest = IDL.Record({ 'parameters' : GetMetricsParameters });
  const GetLogMessagesFilter = IDL.Record({
    'analyzeCount' : IDL.Nat32,
    'messageRegex' : IDL.Opt(IDL.Text),
    'messageContains' : IDL.Opt(IDL.Text),
  });
  const Nanos = IDL.Nat64;
  const GetLogMessagesParameters = IDL.Record({
    'count' : IDL.Nat32,
    'filter' : IDL.Opt(GetLogMessagesFilter),
    'fromTimeNanos' : IDL.Opt(Nanos),
  });
  const GetLatestLogMessagesParameters = IDL.Record({
    'upToTimeNanos' : IDL.Opt(Nanos),
    'count' : IDL.Nat32,
    'filter' : IDL.Opt(GetLogMessagesFilter),
  });
  const CanisterLogRequest = IDL.Variant({
    'getMessagesInfo' : IDL.Null,
    'getMessages' : GetLogMessagesParameters,
    'getLatestMessages' : GetLatestLogMessagesParameters,
  });
  const GetInformationRequest = IDL.Record({
    'status' : IDL.Opt(StatusRequest),
    'metrics' : IDL.Opt(MetricsRequest),
    'logs' : IDL.Opt(CanisterLogRequest),
    'version' : IDL.Bool,
  });
  const StatusResponse = IDL.Record({
    'memory_size' : IDL.Opt(IDL.Nat64),
    'cycles' : IDL.Opt(IDL.Nat64),
    'heap_memory_size' : IDL.Opt(IDL.Nat64),
  });
  const UpdateCallsAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterHeapMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterCyclesAggregatedData = IDL.Vec(IDL.Nat64);
  const CanisterMemoryAggregatedData = IDL.Vec(IDL.Nat64);
  const HourlyMetricsData = IDL.Record({
    'updateCalls' : UpdateCallsAggregatedData,
    'canisterHeapMemorySize' : CanisterHeapMemoryAggregatedData,
    'canisterCycles' : CanisterCyclesAggregatedData,
    'canisterMemorySize' : CanisterMemoryAggregatedData,
    'timeMillis' : IDL.Int,
  });
  const NumericEntity = IDL.Record({
    'avg' : IDL.Nat64,
    'max' : IDL.Nat64,
    'min' : IDL.Nat64,
    'first' : IDL.Nat64,
    'last' : IDL.Nat64,
  });
  const DailyMetricsData = IDL.Record({
    'updateCalls' : IDL.Nat64,
    'canisterHeapMemorySize' : NumericEntity,
    'canisterCycles' : NumericEntity,
    'canisterMemorySize' : NumericEntity,
    'timeMillis' : IDL.Int,
  });
  const CanisterMetricsData = IDL.Variant({
    'hourly' : IDL.Vec(HourlyMetricsData),
    'daily' : IDL.Vec(DailyMetricsData),
  });
  const CanisterMetrics = IDL.Record({ 'data' : CanisterMetricsData });
  const MetricsResponse = IDL.Record({ 'metrics' : IDL.Opt(CanisterMetrics) });
  const CanisterLogFeature = IDL.Variant({
    'filterMessageByContains' : IDL.Null,
    'filterMessageByRegex' : IDL.Null,
  });
  const CanisterLogMessagesInfo = IDL.Record({
    'features' : IDL.Vec(IDL.Opt(CanisterLogFeature)),
    'lastTimeNanos' : IDL.Opt(Nanos),
    'count' : IDL.Nat32,
    'firstTimeNanos' : IDL.Opt(Nanos),
  });
  const LogMessagesData = IDL.Record({
    'timeNanos' : Nanos,
    'message' : IDL.Text,
  });
  const CanisterLogMessages = IDL.Record({
    'data' : IDL.Vec(LogMessagesData),
    'lastAnalyzedMessageTimeNanos' : IDL.Opt(Nanos),
  });
  const CanisterLogResponse = IDL.Variant({
    'messagesInfo' : CanisterLogMessagesInfo,
    'messages' : CanisterLogMessages,
  });
  const GetInformationResponse = IDL.Record({
    'status' : IDL.Opt(StatusResponse),
    'metrics' : IDL.Opt(MetricsResponse),
    'logs' : IDL.Opt(CanisterLogResponse),
    'version' : IDL.Opt(IDL.Nat),
  });
  const OverallGamesWithGameMode = IDL.Record({
    'gameModeID' : IDL.Nat,
    'gamesPlayed' : IDL.Nat,
  });
  const OverallGamesWithCharacter = IDL.Record({
    'gamesPlayed' : IDL.Nat,
    'characterID' : IDL.Nat,
  });
  const OverallGamesWithFaction = IDL.Record({
    'gamesPlayed' : IDL.Nat,
    'factionID' : IDL.Nat,
  });
  const OverallStats = IDL.Record({
    'totalEnergyGenerated' : IDL.Nat,
    'totalGamesMP' : IDL.Nat,
    'totalGamesSP' : IDL.Nat,
    'totalGamesGameMode' : IDL.Vec(OverallGamesWithGameMode),
    'totalGamesPlayed' : IDL.Nat,
    'totalDamageDealt' : IDL.Nat,
    'totalEnergyUsed' : IDL.Nat,
    'totalTimePlayed' : IDL.Nat,
    'totalEnergyWasted' : IDL.Nat,
    'totalKills' : IDL.Nat,
    'totalXpEarned' : IDL.Nat,
    'totalGamesWithCharacter' : IDL.Vec(OverallGamesWithCharacter),
    'totalGamesWithFaction' : IDL.Vec(OverallGamesWithFaction),
  });
  const FriendRequest = IDL.Record({
    'to' : PlayerId,
    'from' : PlayerId,
    'timestamp' : IDL.Int,
  });
  const GamesWithGameMode = IDL.Record({
    'gameModeID' : IDL.Nat,
    'gamesPlayed' : IDL.Nat,
    'gamesWon' : IDL.Nat,
  });
  const GamesWithCharacter = IDL.Record({
    'gamesPlayed' : IDL.Nat,
    'characterID' : IDL.Nat,
    'gamesWon' : IDL.Nat,
  });
  const GamesWithFaction = IDL.Record({
    'gamesPlayed' : IDL.Nat,
    'gamesWon' : IDL.Nat,
    'factionID' : IDL.Nat,
  });
  const PlayerGamesStats = IDL.Record({
    'gamesLost' : IDL.Nat,
    'energyGenerated' : IDL.Nat,
    'gamesPlayed' : IDL.Nat,
    'totalGamesGameMode' : IDL.Vec(GamesWithGameMode),
    'totalDamageDealt' : IDL.Nat,
    'totalDamageCrit' : IDL.Nat,
    'totalDamageTaken' : IDL.Nat,
    'energyUsed' : IDL.Nat,
    'totalDamageEvaded' : IDL.Nat,
    'energyWasted' : IDL.Nat,
    'gamesWon' : IDL.Nat,
    'totalKills' : IDL.Nat,
    'totalXpEarned' : IDL.Nat,
    'totalGamesWithCharacter' : IDL.Vec(GamesWithCharacter),
    'totalGamesWithFaction' : IDL.Vec(GamesWithFaction),
  });
  const AverageStats = IDL.Record({
    'averageDamageDealt' : IDL.Nat,
    'averageEnergyGenerated' : IDL.Nat,
    'averageEnergyUsed' : IDL.Nat,
    'averageKills' : IDL.Nat,
    'averageEnergyWasted' : IDL.Nat,
    'averageXpEarned' : IDL.Nat,
  });
  const MissionRewardType = IDL.Variant({
    'Stardust' : IDL.Null,
    'Chest' : IDL.Null,
  });
  const MissionsUser = IDL.Record({
    'total' : IDL.Nat,
    'missionType' : MissionType,
    'reward_amount' : IDL.Nat,
    'reward_type' : MissionRewardType,
    'start_date' : IDL.Nat64,
    'progress' : IDL.Nat,
    'finish_date' : IDL.Nat64,
    'missionCategory' : MissionCategory,
    'expiration' : IDL.Nat64,
    'finished' : IDL.Bool,
    'id_mission' : IDL.Nat,
  });
  const AdvancedSettings = IDL.Record({
    'permitted_drift' : Timestamp,
    'burned_tokens' : Balance,
    'transaction_window' : Timestamp,
  });
  const Account__1 = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(Subaccount),
  });
  const TokenInitArgs = IDL.Record({
    'fee' : Balance,
    'advanced_settings' : IDL.Opt(AdvancedSettings),
    'decimals' : IDL.Nat8,
    'minting_account' : IDL.Opt(Account__1),
    'logo' : IDL.Text,
    'name' : IDL.Text,
    'initial_balances' : IDL.Vec(IDL.Tuple(Account__1, Balance)),
    'min_burn_amount' : Balance,
    'max_supply' : Balance,
    'symbol' : IDL.Text,
  });
  const PlayerStats = IDL.Record({
    'secRemaining' : IDL.Nat,
    'energyGenerated' : IDL.Nat,
    'damageDealt' : IDL.Nat,
    'wonGame' : IDL.Bool,
    'playerId' : PlayerId,
    'botMode' : IDL.Nat,
    'deploys' : IDL.Nat,
    'damageTaken' : IDL.Nat,
    'damageCritic' : IDL.Nat,
    'damageEvaded' : IDL.Nat,
    'energyChargeRate' : IDL.Nat,
    'faction' : IDL.Nat,
    'energyUsed' : IDL.Nat,
    'gameMode' : IDL.Nat,
    'energyWasted' : IDL.Nat,
    'xpEarned' : IDL.Nat,
    'characterID' : IDL.Nat,
    'botDifficulty' : IDL.Nat,
    'kills' : IDL.Nat,
  });
  const BasicStats = IDL.Record({ 'playerStats' : IDL.Vec(PlayerStats) });
  const MMSearchStatus = IDL.Variant({
    'Available' : IDL.Null,
    'NotAvailable' : IDL.Null,
    'Assigned' : IDL.Null,
  });
  const TokenID = IDL.Nat;
  const FullMatchData = IDL.Record({
    'status' : MMStatus,
    'matchID' : MatchID,
    'player1' : IDL.Record({
      'id' : PlayerId,
      'elo' : IDL.Float64,
      'username' : Username,
      'level' : Level,
      'matchAccepted' : IDL.Bool,
      'playerGameData' : PlayerGameData,
      'avatar' : AvatarID,
    }),
    'player2' : IDL.Opt(
      IDL.Record({
        'id' : PlayerId,
        'elo' : IDL.Float64,
        'username' : Username,
        'level' : Level,
        'matchAccepted' : IDL.Bool,
        'playerGameData' : PlayerGameData,
        'avatar' : AvatarID,
      })
    ),
  });
  const PrivacySetting = IDL.Variant({
    'blockAll' : IDL.Null,
    'acceptAll' : IDL.Null,
    'friendsOfFriends' : IDL.Null,
  });
  const Notification = IDL.Record({
    'from' : PlayerId,
    'message' : IDL.Text,
    'timestamp' : Time,
  });
  const Match = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Text,
    'result' : IDL.Opt(
      IDL.Record({ 'winner' : IDL.Principal, 'score' : IDL.Text })
    ),
    'participants' : IDL.Vec(IDL.Principal),
    'nextMatchId' : IDL.Opt(IDL.Nat),
    'tournamentId' : IDL.Nat,
  });
  const ItemType = IDL.Variant({
    'Stardust' : IDL.Null,
    'GameNFTs' : IDL.Null,
    'Chest' : IDL.Null,
  });
  const LogEntry = IDL.Record({
    'tokenID' : IDL.Opt(TokenID),
    'user' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'itemType' : ItemType,
    'amount' : IDL.Opt(IDL.Nat),
  });
  const Burn = IDL.Record({
    'from' : Account__1,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance,
  });
  const Mint = IDL.Record({
    'to' : Account__1,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance,
  });
  const Transfer = IDL.Record({
    'to' : Account__1,
    'fee' : IDL.Opt(Balance),
    'from' : Account__1,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance,
  });
  const Transaction__1 = IDL.Record({
    'burn' : IDL.Opt(Burn),
    'kind' : IDL.Text,
    'mint' : IDL.Opt(Mint),
    'timestamp' : Timestamp,
    'index' : TxIndex,
    'transfer' : IDL.Opt(Transfer),
  });
  const GetTransactionsRequest = IDL.Record({
    'start' : TxIndex,
    'length' : IDL.Nat,
  });
  const TransactionRange = IDL.Record({
    'transactions' : IDL.Vec(Transaction__1),
  });
  const QueryArchiveFn = IDL.Func(
      [GetTransactionsRequest],
      [TransactionRange],
      ['query'],
    );
  const ArchivedTransaction = IDL.Record({
    'callback' : QueryArchiveFn,
    'start' : TxIndex,
    'length' : IDL.Nat,
  });
  const GetTransactionsResponse = IDL.Record({
    'first_index' : TxIndex,
    'log_length' : IDL.Nat,
    'transactions' : IDL.Vec(Transaction__1),
    'archived_transactions' : IDL.Vec(ArchivedTransaction),
  });
  const Value = IDL.Variant({
    'Int' : IDL.Int,
    'Nat' : IDL.Nat,
    'Blob' : IDL.Vec(IDL.Nat8),
    'Text' : IDL.Text,
  });
  const MetaDatum = IDL.Tuple(IDL.Text, Value);
  const TransferArgs__1 = IDL.Record({
    'to' : Account__1,
    'fee' : IDL.Opt(Balance),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(Subaccount),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance,
  });
  const SupportedStandard = IDL.Record({ 'url' : IDL.Text, 'name' : IDL.Text });
  const ApprovalArgs = IDL.Record({
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(Subaccount),
    'token_ids' : IDL.Opt(IDL.Vec(TokenId)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'expires_at' : IDL.Opt(IDL.Nat64),
    'spender' : Account,
  });
  const ApprovalId = IDL.Nat;
  const ApprovalError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Record({}),
    'Unauthorized' : IDL.Record({ 'token_ids' : IDL.Vec(TokenId) }),
    'TooOld' : IDL.Null,
  });
  const ApprovalReceipt = IDL.Variant({
    'Ok' : ApprovalId,
    'Err' : ApprovalError,
  });
  const CallError = IDL.Variant({
    'GenericError' : IDL.Null,
    'SupplyCapOverflow' : IDL.Null,
    'InvalidTokenId' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'InvalidRecipient' : IDL.Null,
    'AlreadyExistTokenId' : IDL.Null,
  });
  const BalanceResult = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : CallError });
  const CollectionMetadata = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'supplyCap' : IDL.Opt(IDL.Nat),
    'totalSupply' : IDL.Nat,
    'royalties' : IDL.Opt(IDL.Nat16),
    'royaltyRecipient' : IDL.Opt(Account),
    'image' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'symbol' : IDL.Text,
  });
  const GetTransactionsArgs = IDL.Record({
    'offset' : IDL.Nat,
    'limit' : IDL.Nat,
    'account' : IDL.Opt(Account),
  });
  const Transaction = IDL.Record({
    'kind' : IDL.Text,
    'mint' : IDL.Opt(
      IDL.Record({ 'to' : Account, 'token_ids' : IDL.Vec(TokenId) })
    ),
    'icrc7_transfer' : IDL.Opt(
      IDL.Record({
        'to' : Account,
        'from' : Account,
        'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
        'token_ids' : IDL.Vec(TokenId),
        'created_at_time' : IDL.Opt(IDL.Nat64),
        'spender' : IDL.Opt(Account),
      })
    ),
    'upgrade' : IDL.Opt(
      IDL.Record({
        'new_metadata' : IDL.Vec(IDL.Tuple(IDL.Text, Metadata)),
        'token_id' : IDL.Opt(TokenId),
        'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
        'upgraded_at' : IDL.Opt(IDL.Nat64),
        'prev_metadata' : IDL.Vec(IDL.Tuple(IDL.Text, Metadata)),
      })
    ),
    'timestamp' : IDL.Nat64,
    'icrc7_approve' : IDL.Opt(
      IDL.Record({
        'from' : Account,
        'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
        'token_ids' : IDL.Opt(IDL.Vec(TokenId)),
        'created_at_time' : IDL.Opt(IDL.Nat64),
        'expires_at' : IDL.Opt(IDL.Nat64),
        'spender' : Account,
      })
    ),
  });
  const GetTransactionsResult = IDL.Record({
    'total' : IDL.Nat,
    'transactions' : IDL.Vec(Transaction),
  });
  const MetadataResult = IDL.Variant({ 'Ok' : Metadata, 'Err' : CallError });
  const OwnerResult = IDL.Variant({ 'Ok' : Account, 'Err' : CallError });
  const TokensOfResult = IDL.Variant({
    'Ok' : IDL.Vec(TokenId),
    'Err' : CallError,
  });
  const TransferArgs = IDL.Record({
    'to' : Account,
    'spender_subaccount' : IDL.Opt(Subaccount),
    'from' : IDL.Opt(Account),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'is_atomic' : IDL.Opt(IDL.Bool),
    'token_ids' : IDL.Vec(TokenId),
    'created_at_time' : IDL.Opt(IDL.Nat64),
  });
  const TransferId = IDL.Nat;
  const TransferError__1 = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Record({}),
    'Duplicate' : IDL.Record({ 'duplicate_of' : TransferId }),
    'Unauthorized' : IDL.Record({ 'token_ids' : IDL.Vec(TokenId) }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
  });
  const TransferReceipt = IDL.Variant({
    'Ok' : TransferId,
    'Err' : TransferError__1,
  });
  const MintArgs = IDL.Record({
    'to' : Account,
    'token_id' : TokenId,
    'metadata' : Metadata,
  });
  const MintError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'SupplyCapOverflow' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'InvalidRecipient' : IDL.Null,
    'AlreadyExistTokenId' : IDL.Null,
  });
  const MintReceipt = IDL.Variant({ 'Ok' : TokenId, 'Err' : MintError });
  const CollectMetricsRequestType = IDL.Variant({
    'force' : IDL.Null,
    'normal' : IDL.Null,
  });
  const UpdateInformationRequest = IDL.Record({
    'metrics' : IDL.Opt(CollectMetricsRequestType),
  });
  const Cosmicrafts = IDL.Service({
    'acceptFriendRequest' : IDL.Func([PlayerId], [IDL.Bool, IDL.Text], []),
    'add' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], []),
    'addAvatarToUser' : IDL.Func([IDL.Nat], [IDL.Bool, IDL.Text], []),
    'addProgressToIndividualAchievement' : IDL.Func(
        [PlayerId, IDL.Nat, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'addTitleToUser' : IDL.Func([IDL.Nat], [IDL.Bool, IDL.Text], []),
    'admin' : IDL.Func([AdminFunction], [IDL.Bool, IDL.Text], []),
    'adminUpdateMatch' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text],
        [IDL.Bool],
        [],
      ),
    'assignAchievementsToUser' : IDL.Func([PlayerId], [], []),
    'blockUser' : IDL.Func([PlayerId], [IDL.Bool, IDL.Text], []),
    'burn' : IDL.Func([BurnArgs], [TransferResult], []),
    'cancelMatchmaking' : IDL.Func([], [IDL.Bool, IDL.Text], []),
    'claimAchievementLineReward' : IDL.Func(
        [IDL.Nat],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'claimCategoryAchievementReward' : IDL.Func(
        [IDL.Nat],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'claimGeneralReward' : IDL.Func([IDL.Nat], [IDL.Bool, IDL.Text], []),
    'claimIndividualAchievementReward' : IDL.Func(
        [IDL.Nat],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'claimUserReward' : IDL.Func([IDL.Nat], [IDL.Bool, IDL.Text], []),
    'createAchievement' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Vec(AchievementReward)],
        [IDL.Bool, IDL.Text, IDL.Nat],
        [],
      ),
    'createAchievementCategory' : IDL.Func(
        [IDL.Text, IDL.Vec(AchievementReward)],
        [IDL.Bool, IDL.Text, IDL.Nat],
        [],
      ),
    'createBatchOfUnassignedCodes' : IDL.Func([], [IDL.Vec(ReferralCode)], []),
    'createIndividualAchievement' : IDL.Func(
        [
          IDL.Nat,
          IDL.Text,
          AchievementType,
          IDL.Nat,
          IDL.Vec(AchievementReward),
        ],
        [IDL.Bool, IDL.Text, IDL.Nat],
        [],
      ),
    'createTournament' : IDL.Func(
        [IDL.Text, Time, IDL.Text, Time],
        [IDL.Nat],
        [],
      ),
    'createUserMission' : IDL.Func(
        [PlayerId],
        [IDL.Bool, IDL.Text, IDL.Nat],
        [],
      ),
    'declineFriendRequest' : IDL.Func([PlayerId], [IDL.Bool, IDL.Text], []),
    'deleteAccount' : IDL.Func([], [IDL.Bool, IDL.Text], []),
    'deleteAllTournaments' : IDL.Func([], [IDL.Bool], []),
    'deposit_cycles' : IDL.Func([], [], []),
    'disputeMatch' : IDL.Func([IDL.Nat, IDL.Nat, IDL.Text], [IDL.Bool], []),
    'dumpAllPlayerMultipliers' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(PlayerId, IDL.Float64))],
        ['query'],
      ),
    'getAchievements' : IDL.Func([], [IDL.Vec(AchievementCategory)], []),
    'getActiveTournaments' : IDL.Func([], [IDL.Vec(Tournament)], ['query']),
    'getAllAchievementsData' : IDL.Func(
        [],
        [IDL.Vec(AchievementCategory)],
        ['query'],
      ),
    'getAllPlayers' : IDL.Func([], [IDL.Vec(Player)], ['query']),
    'getAllSearching' : IDL.Func([], [IDL.Vec(MatchData)], ['query']),
    'getAllTournaments' : IDL.Func([], [IDL.Vec(Tournament)], ['query']),
    'getAvailableAvatarDetails' : IDL.Func([], [IDL.Vec(Avatar)], ['query']),
    'getAvailableAvatars' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
    'getAvailableTitleDetails' : IDL.Func([], [IDL.Vec(Title__1)], ['query']),
    'getAvailableTitles' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
    'getAvatarById' : IDL.Func([IDL.Nat], [Avatar], []),
    'getAvatars' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(TokenId, TokenMetadata))],
        ['query'],
      ),
    'getBeyondReferrals' : IDL.Func([PlayerId], [IDL.Vec(PlayerId)], ['query']),
    'getBlockedUsers' : IDL.Func([], [IDL.Vec(PlayerId)], ['query']),
    'getCanistergeekInformation' : IDL.Func(
        [GetInformationRequest],
        [GetInformationResponse],
        ['query'],
      ),
    'getCharacters' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(TokenId, TokenMetadata))],
        ['query'],
      ),
    'getChests' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(TokenId, TokenMetadata))],
        ['query'],
      ),
    'getCosmicraftsStats' : IDL.Func([], [OverallStats], ['query']),
    'getDirectReferrals' : IDL.Func([PlayerId], [IDL.Vec(PlayerId)], ['query']),
    'getFriendRequests' : IDL.Func([], [IDL.Vec(FriendRequest)], ['query']),
    'getFriendsList' : IDL.Func([], [IDL.Opt(IDL.Vec(PlayerId))], ['query']),
    'getFullProfile' : IDL.Func(
        [PlayerId],
        [IDL.Opt(IDL.Tuple(Player, PlayerGamesStats, AverageStats))],
        ['query'],
      ),
    'getGeneralMissionProgress' : IDL.Func(
        [IDL.Principal, IDL.Nat],
        [IDL.Opt(MissionsUser)],
        ['query'],
      ),
    'getGeneralMissions' : IDL.Func([], [IDL.Vec(MissionsUser)], []),
    'getGrandReferrer' : IDL.Func([PlayerId], [IDL.Opt(PlayerId)], ['query']),
    'getInactiveTournaments' : IDL.Func([], [IDL.Vec(Tournament)], ['query']),
    'getIndirectReferrals' : IDL.Func(
        [PlayerId],
        [IDL.Vec(PlayerId)],
        ['query'],
      ),
    'getInitArgs' : IDL.Func([], [TokenInitArgs], ['query']),
    'getLastLogin' : IDL.Func(
        [PlayerId],
        [
          IDL.Opt(
            IDL.Record({
              'country' : IDL.Opt(IDL.Text),
              'timestamp' : IDL.Nat64,
            })
          ),
        ],
        ['query'],
      ),
    'getMatchDetails' : IDL.Func(
        [MatchID],
        [
          IDL.Opt(
            IDL.Tuple(MatchData, IDL.Vec(IDL.Tuple(Player, PlayerGamesStats)))
          ),
        ],
        ['query'],
      ),
    'getMatchHistoryByPrincipal' : IDL.Func(
        [PlayerId],
        [IDL.Vec(IDL.Tuple(MatchID, IDL.Opt(BasicStats)))],
        ['query'],
      ),
    'getMatchIDsByPrincipal' : IDL.Func(
        [PlayerId],
        [IDL.Vec(MatchID)],
        ['query'],
      ),
    'getMatchParticipants' : IDL.Func(
        [MatchID],
        [IDL.Opt(IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Principal)))],
        ['query'],
      ),
    'getMatchSearching' : IDL.Func([], [MMSearchStatus, IDL.Nat, IDL.Text], []),
    'getMatchStats' : IDL.Func([MatchID], [IDL.Opt(BasicStats)], ['query']),
    'getMessage' : IDL.Func([], [IDL.Text], ['query']),
    'getMintedInfo' : IDL.Func(
        [IDL.Principal],
        [
          IDL.Record({
            'stardust' : IDL.Nat,
            'gameNFTs' : IDL.Record({
              'tokenIDs' : IDL.Vec(TokenID),
              'quantity' : IDL.Nat,
            }),
            'chests' : IDL.Record({
              'tokenIDs' : IDL.Vec(TokenID),
              'quantity' : IDL.Nat,
            }),
          }),
        ],
        ['query'],
      ),
    'getMultiplier' : IDL.Func([PlayerId], [IDL.Float64], ['query']),
    'getMyMatchData' : IDL.Func(
        [],
        [IDL.Opt(FullMatchData), IDL.Nat],
        ['composite_query'],
      ),
    'getMyPrivacySettings' : IDL.Func([], [PrivacySetting], ['query']),
    'getMyStats' : IDL.Func([], [IDL.Opt(PlayerGamesStats)], ['query']),
    'getNFTs' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(TokenId, TokenMetadata))],
        ['query'],
      ),
    'getNotifications' : IDL.Func([], [IDL.Vec(Notification)], ['query']),
    'getPlayer' : IDL.Func([], [IDL.Opt(Player)], ['query']),
    'getPlayerAverageStats' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(AverageStats)],
        ['query'],
      ),
    'getPlayerDeck' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Vec(TokenId))],
        ['query'],
      ),
    'getPlayerElo' : IDL.Func([IDL.Principal], [IDL.Float64], ['query']),
    'getPlayerStats' : IDL.Func(
        [PlayerId],
        [IDL.Opt(PlayerGamesStats)],
        ['query'],
      ),
    'getProfile' : IDL.Func([PlayerId], [IDL.Opt(Player)], ['query']),
    'getReferralCode' : IDL.Func(
        [PlayerId],
        [IDL.Opt(ReferralCode)],
        ['query'],
      ),
    'getReferrer' : IDL.Func([PlayerId], [IDL.Opt(PlayerId)], ['query']),
    'getRegisteredUsers' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getSelectedAvatar' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'getSelectedTitle' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'getTitleById' : IDL.Func([IDL.Nat], [Title__1], []),
    'getTotalPlayers' : IDL.Func([], [IDL.Nat], ['query']),
    'getTotalReferralNetwork' : IDL.Func(
        [PlayerId],
        [
          IDL.Record({
            'directReferrals' : IDL.Vec(PlayerId),
            'indirectReferrals' : IDL.Vec(PlayerId),
            'beyondReferrals' : IDL.Vec(PlayerId),
          }),
        ],
        ['query'],
      ),
    'getTournamentBracket' : IDL.Func(
        [IDL.Nat],
        [IDL.Record({ 'matches' : IDL.Vec(Match) })],
        ['query'],
      ),
    'getTransactionLogs' : IDL.Func(
        [IDL.Principal, ItemType],
        [IDL.Vec(LogEntry)],
        ['query'],
      ),
    'getTrophies' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(TokenId, TokenMetadata))],
        ['query'],
      ),
    'getUnits' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(TokenId, TokenMetadata))],
        ['query'],
      ),
    'getUserAchievementsStructure' : IDL.Func(
        [PlayerId],
        [IDL.Vec(AchievementCategory)],
        ['query'],
      ),
    'getUserAchievementsStructureByCaller' : IDL.Func(
        [],
        [IDL.Vec(AchievementCategory)],
        ['query'],
      ),
    'getUserMissionProgress' : IDL.Func(
        [PlayerId, IDL.Nat],
        [IDL.Opt(MissionsUser)],
        ['query'],
      ),
    'getUserMissions' : IDL.Func([], [IDL.Vec(MissionsUser)], []),
    'get_collection_owner' : IDL.Func([], [Account], ['query']),
    'get_transaction' : IDL.Func([TxIndex], [IDL.Opt(Transaction__1)], []),
    'get_transactions' : IDL.Func(
        [GetTransactionsRequest],
        [GetTransactionsResponse],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'handleCombatXP' : IDL.Func(
        [IDL.Vec(TokenId), IDL.Nat],
        [IDL.Vec(TokenId)],
        [],
      ),
    'icrc1_balance_of' : IDL.Func([Account__1], [Balance], ['query']),
    'icrc1_decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee' : IDL.Func([], [Balance], ['query']),
    'icrc1_metadata' : IDL.Func([], [IDL.Vec(MetaDatum)], ['query']),
    'icrc1_minting_account' : IDL.Func([], [IDL.Opt(Account__1)], ['query']),
    'icrc1_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_pay_for_transaction' : IDL.Func(
        [TransferArgs__1, IDL.Principal],
        [TransferResult],
        [],
      ),
    'icrc1_supported_standards' : IDL.Func(
        [],
        [IDL.Vec(SupportedStandard)],
        ['query'],
      ),
    'icrc1_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_total_supply' : IDL.Func([], [Balance], ['query']),
    'icrc1_transfer' : IDL.Func([TransferArgs__1], [TransferResult], []),
    'icrc7_approve' : IDL.Func([ApprovalArgs], [ApprovalReceipt], []),
    'icrc7_balance_of' : IDL.Func([Account], [BalanceResult], ['query']),
    'icrc7_collection_metadata' : IDL.Func([], [CollectionMetadata], ['query']),
    'icrc7_description' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'icrc7_get_transactions' : IDL.Func(
        [GetTransactionsArgs],
        [GetTransactionsResult],
        [],
      ),
    'icrc7_image' : IDL.Func([], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    'icrc7_metadata' : IDL.Func([TokenId], [MetadataResult], ['query']),
    'icrc7_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc7_owner_of' : IDL.Func([TokenId], [OwnerResult], ['query']),
    'icrc7_royalties' : IDL.Func([], [IDL.Opt(IDL.Nat16)], ['query']),
    'icrc7_royalty_recipient' : IDL.Func([], [IDL.Opt(Account)], ['query']),
    'icrc7_supply_cap' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_supported_standards' : IDL.Func(
        [],
        [IDL.Vec(SupportedStandard)],
        ['query'],
      ),
    'icrc7_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc7_tokens_of' : IDL.Func([Account], [TokensOfResult], ['query']),
    'icrc7_total_supply' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc7_transfer' : IDL.Func([TransferArgs], [TransferReceipt], []),
    'isEven' : IDL.Func([IDL.Nat], [IDL.Bool], ['query']),
    'isGameMatched' : IDL.Func([], [IDL.Bool, IDL.Text], ['query']),
    'joinTournament' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'loadAchievements' : IDL.Func([], [IDL.Bool], []),
    'login' : IDL.Func([IDL.Opt(IDL.Text)], [IDL.Bool, IDL.Text], []),
    'mint' : IDL.Func([Mint], [TransferResult], []),
    'mintAchievementRewards' : IDL.Func(
        [AchievementReward, PlayerId],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'mintChest' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool, IDL.Text], []),
    'mintDeck' : IDL.Func([], [IDL.Bool, IDL.Text, IDL.Vec(TokenId)], []),
    'mintNFT' : IDL.Func([MintArgs], [MintReceipt], []),
    'openChest' : IDL.Func([IDL.Nat], [IDL.Bool, IDL.Text], []),
    'saveFinishedGame' : IDL.Func(
        [
          MatchID,
          IDL.Record({
            'secRemaining' : IDL.Nat,
            'energyGenerated' : IDL.Nat,
            'damageDealt' : IDL.Nat,
            'wonGame' : IDL.Bool,
            'botMode' : IDL.Nat,
            'deploys' : IDL.Nat,
            'damageTaken' : IDL.Nat,
            'damageCritic' : IDL.Nat,
            'damageEvaded' : IDL.Nat,
            'energyChargeRate' : IDL.Nat,
            'faction' : IDL.Nat,
            'energyUsed' : IDL.Nat,
            'gameMode' : IDL.Nat,
            'energyWasted' : IDL.Nat,
            'xpEarned' : IDL.Nat,
            'characterID' : IDL.Nat,
            'botDifficulty' : IDL.Nat,
            'kills' : IDL.Nat,
          }),
        ],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'searchActiveGeneralMissions' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(MissionsUser)],
        ['query'],
      ),
    'searchActiveUserMissions' : IDL.Func(
        [PlayerId],
        [IDL.Vec(MissionsUser)],
        ['query'],
      ),
    'searchUserByUsername' : IDL.Func([Username], [IDL.Vec(Player)], ['query']),
    'selectRandomUnits' : IDL.Func([IDL.Vec(TokenId)], [IDL.Vec(TokenId)], []),
    'sendFriendRequest' : IDL.Func([PlayerId], [IDL.Bool, IDL.Text], []),
    'setMessage' : IDL.Func([IDL.Text], [], []),
    'setPlayerActive' : IDL.Func([], [IDL.Bool], []),
    'setPrivacySetting' : IDL.Func([PrivacySetting], [IDL.Bool, IDL.Text], []),
    'signup' : IDL.Func(
        [Username, AvatarID, IDL.Opt(ReferralCode), IDL.Text],
        [IDL.Bool, IDL.Opt(Player), IDL.Text],
        [],
      ),
    'storeCurrentDeck' : IDL.Func([IDL.Vec(TokenId)], [IDL.Bool], []),
    'submitFeedback' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Bool], []),
    'submitMatchResult' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Text],
        [IDL.Bool],
        [],
      ),
    'test' : IDL.Func(
        [PlayerId],
        [
          IDL.Opt(
            IDL.Record({
              'xp' : IDL.Nat,
              'elo' : IDL.Float64,
              'gamesLost' : IDL.Nat,
              'username' : Username,
              'level' : Level,
              'gamesWon' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
    'topPlayersByMultiplier' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(IDL.Tuple(PlayerId, IDL.Float64))],
        ['query'],
      ),
    'unblockUser' : IDL.Func([PlayerId], [IDL.Bool, IDL.Text], []),
    'updateAddFriendAchievement' : IDL.Func(
        [PlayerId],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'updateAvatar' : IDL.Func([IDL.Nat], [IDL.Bool, IDL.Text], []),
    'updateAvatarChangeAchievement' : IDL.Func(
        [PlayerId],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'updateBracket' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'updateBracketAfterMatchUpdate' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'updateCanistergeekInformation' : IDL.Func(
        [UpdateInformationRequest],
        [],
        [],
      ),
    'updateDescription' : IDL.Func(
        [Description],
        [IDL.Bool, PlayerId, IDL.Text],
        [],
      ),
    'updatePlayerGameStats' : IDL.Func(
        [PlayerId, PlayerStats, IDL.Nat, IDL.Nat],
        [],
        ['oneway'],
      ),
    'updatePlayerLevel' : IDL.Func([IDL.Principal], [], []),
    'updateProgressManager' : IDL.Func(
        [IDL.Principal, PlayerStats],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'updateSoulNFTPlayed' : IDL.Func(
        [IDL.Vec(TokenId)],
        [IDL.Vec(TokenId)],
        [],
      ),
    'updateTitle' : IDL.Func([IDL.Nat], [IDL.Bool, IDL.Text], []),
    'updateUpgradeNFTAchievement' : IDL.Func(
        [PlayerId],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'updateUsername' : IDL.Func([Username], [IDL.Bool, PlayerId, IDL.Text], []),
    'upgradeNFT' : IDL.Func([TokenID], [IDL.Bool, IDL.Text], []),
  });
  return Cosmicrafts;
};
export const init = ({ IDL }) => { return []; };
