# Friend Request Notification Enhancement

## Overview
Currently, when a user sends a friend request, the recipient receives a notification. However, when a friend request is accepted, the sender does not receive any notification. This proposal aims to enhance the notification system by adding a notification when a friend request is accepted.

## Changes Required

### 1. Backend Changes
Modify the `acceptFriendRequest` function in `src/backend/main.mo` to send a notification to the request sender when their request is accepted:

```motoko
// Inside the acceptFriendRequest function, after adding the mutual friendship
// Send notification to the request sender that their request was accepted
switch (players.get(fromId)) {
    case (null) {
        // Do nothing if the sender doesn't exist (unlikely)
    };
    case (?fromPlayer) {
        sendNotification(fromId, player.username # " accepted your friend request");
    };
};
```

**Note**: There is a linter error in the current implementation. The variable `player` is undefined in this context. It should be `_player` instead:

```motoko
sendNotification(fromId, _player.username # " accepted your friend request");
```

### 2. Frontend Changes
- Added a new translation key in `src/frontend/src/locales/en.json`:
  ```json
  "acceptedYourFriendRequest": "accepted your friend request"
  ```

- Enhanced the notification display in the Notifications page to show avatars alongside notifications.

## Benefits
1. Improved user experience by providing feedback when friend requests are accepted
2. More complete social interaction flow
3. Consistent with standard social platform behavior

## Implementation Notes
The backend change is minimal and follows the existing pattern for sending notifications. The `sendNotification` function already handles duplicate prevention and cleaning of old notifications.

## Testing
After implementation, test the following scenarios:
1. User A sends a friend request to User B
2. User B accepts the friend request
3. Verify that User A receives a notification that their request was accepted

---

# Backend System Documentation

## Overview of `main.mo` Structure

The `main.mo` file is organized into several interconnected sections, each responsible for a specific aspect of the application's functionality. Below is a comprehensive documentation of these sections and how they work together.

## 1. Achievement System

### Variables and Data Structures
```motoko
// Stable Variables for Achievement System
stable var achievementCategoryIDCounter: Nat = 1;
stable var achievementIDCounter: Nat = 1;
stable var individualAchievementIDCounter: Nat = 1;

stable var _achievementCategories: [(Nat, AchievementCategory)] = [];
stable var _achievements: [(Nat, AchievementLine)] = [];
stable var _individualAchievements: [(Nat, IndividualAchievement)] = [];

stable var _userProgress: [(PlayerId, [AchievementCategory])] = [];

stable var _claimedIndividualAchievementRewards: [(PlayerId, [Nat])] = [];
stable var _claimedAchievementLineRewards: [(PlayerId, [Nat])] = [];
stable var _claimedCategoryAchievementRewards: [(PlayerId, [Nat])] = [];

// HashMaps for fast access
var achievementCategories: HashMap.HashMap<Nat, AchievementCategory> = HashMap.fromIter(_achievementCategories.vals(), 0, Utils._natEqual, Utils._natHash);
var achievements: HashMap.HashMap<Nat, AchievementLine> = HashMap.fromIter(_achievements.vals(), 0, Utils._natEqual, Utils._natHash);
var individualAchievements: HashMap.HashMap<Nat, IndividualAchievement> = HashMap.fromIter(_individualAchievements.vals(), 0, Utils._natEqual, Utils._natHash);

var userProgress: HashMap.HashMap<PlayerId, [AchievementCategory]> = HashMap.fromIter(_userProgress.vals(), 0, Principal.equal, Principal.hash);

var claimedIndividualAchievementRewards: HashMap.HashMap<PlayerId, [Nat]> = HashMap.fromIter(_claimedIndividualAchievementRewards.vals(), 0, Principal.equal, Principal.hash);
var claimedAchievementLineRewards: HashMap.HashMap<PlayerId, [Nat]> = HashMap.fromIter(_claimedAchievementLineRewards.vals(), 0, Principal.equal, Principal.hash);
var claimedCategoryAchievementRewards: HashMap.HashMap<PlayerId, [Nat]> = HashMap.fromIter(_claimedCategoryAchievementRewards.vals(), 0, Principal.equal, Principal.hash);
```

### Key Functions
- `loadAchievements()`: Initializes the achievement system with predefined achievements
- `createAchievementCategory()`: Creates a new achievement category
- `createAchievement()`: Creates a new achievement line within a category
- `createIndividualAchievement()`: Creates an individual achievement within an achievement line
- `addProgressToIndividualAchievement()`: Updates progress for a specific achievement
- `updateAddFriendAchievement()`: Updates the "Add Friend" achievement when a friendship is formed

## 2. Player System

### Variables and Data Structures
```motoko
// Players
//vars
var ONE_SECOND : Nat64 = 1_000_000_000;
var ONE_MINUTE : Nat64 = 60 * ONE_SECOND;

stable var _players: [(PlayerId, Player)] = [];

stable var _friendRequests: [(PlayerId, [FriendRequest])] = [];
stable var _privacySettings: [(PlayerId, PrivacySetting)] = [];
stable var _blockedUsers: [(PlayerId, [PlayerId])] = [];
stable var _mutualFriendships: [((PlayerId, PlayerId), MutualFriendship)] = [];
stable var _notifications: [(PlayerId, [Notification])] = [];
stable var _updateTimestamps: [(PlayerId, UpdateTimestamps)] = [];
stable var _loginLogs: [(PlayerId, { timestamp: Nat64; country: ?Text })] = [];

// Initialize HashMaps using the stable lists
var players: HashMap.HashMap<PlayerId, Player> = HashMap.fromIter(_players.vals(), 0, Principal.equal, Principal.hash);
var friendRequests: HashMap.HashMap<PlayerId, [FriendRequest]> = HashMap.fromIter(_friendRequests.vals(), 0, Principal.equal, Principal.hash);
var privacySettings: HashMap.HashMap<PlayerId, PrivacySetting> = HashMap.fromIter(_privacySettings.vals(), 0, Principal.equal, Principal.hash);
var blockedUsers: HashMap.HashMap<PlayerId, [PlayerId]> = HashMap.fromIter(_blockedUsers.vals(), 0, Principal.equal, Principal.hash);
var mutualFriendships: HashMap.HashMap<(PlayerId, PlayerId), MutualFriendship> = HashMap.fromIter(_mutualFriendships.vals(), 0, Utils.tupleEqual, Utils.tupleHash);
var notifications: HashMap.HashMap<PlayerId, [Notification]> = HashMap.fromIter(_notifications.vals(), 0, Principal.equal, Principal.hash);
var updateTimestamps: HashMap.HashMap<PlayerId, UpdateTimestamps> = HashMap.fromIter(_updateTimestamps.vals(), 0, Principal.equal, Principal.hash);
var loginLogs: HashMap.HashMap<PlayerId, { timestamp: Nat64; country: ?Text }> = HashMap.fromIter(_loginLogs.vals(), 0, Principal.equal, Principal.hash);
```

### Key Functions
- `signup()`: Registers a new player
- `login()`: Handles player login
- `updateUsername()`, `updateDescription()`, `updateAvatar()`: Update player profile information
- `getProfile()`: Retrieves a player's profile
- `searchUserByUsername()`: Searches for users by username
- `getFriendsList()`: Gets a list of a player's friends

## 3. Friend System

### Key Functions
- `sendFriendRequest()`: Sends a friend request to another player
- `acceptFriendRequest()`: Accepts a friend request
- `declineFriendRequest()`: Declines a friend request
- `getFriendRequests()`: Gets a list of pending friend requests
- `addFriendToUser()`: Helper function to add a friend to a user's friends list
- `areFriends()`: Checks if two players are friends
- `canSendRequestToNonFriend()`: Checks if a player can send a request based on privacy settings
- `isBlockedBy()`: Checks if a player is blocked by another player

## 4. Notification System

### Key Functions
- `addNotification()`: Adds a notification to a player's notification list
- `cleanOldNotifications()`: Removes notifications older than 30 days
- `sendNotification()`: Sends a notification to a player, with duplicate prevention
- `getNotifications()`: Gets a list of a player's notifications

## 5. Matchmaking System

### Variables and Data Structures
```motoko
// MatchMaking
stable var _matchID : Nat = 0;
var inactiveSeconds : Nat64 = 30 * ONE_SECOND;

stable var _searching : [(MatchID, MatchData)] = [];
var searching : HashMap.HashMap<MatchID, MatchData> = HashMap.fromIter(_searching.vals(), 0, Utils._natEqual, Utils._natHash);

stable var _playerStatus : [(PlayerId, MMPlayerStatus)] = [];
var playerStatus : HashMap.HashMap<PlayerId, MMPlayerStatus> = HashMap.fromIter(_playerStatus.vals(), 0, Principal.equal, Principal.hash);

stable var _inProgress : [(MatchID, MatchData)] = [];
var inProgress : HashMap.HashMap<MatchID, MatchData> = HashMap.fromIter(_inProgress.vals(), 0, Utils._natEqual, Utils._natHash);

stable var _finishedGames : [(MatchID, MatchData)] = [];
var finishedGames : HashMap.HashMap<MatchID, MatchData> = HashMap.fromIter(_finishedGames.vals(), 0, Utils._natEqual, Utils._natHash);
```

### Key Functions
- `getMatchSearching()`: Gets the current matchmaking status
- `cancelMatchmaking()`: Cancels an active matchmaking search
- `activatePlayerSearching()`: Keeps a player active in the matchmaking queue
- `removePlayersFromSearching()`: Removes players from the matchmaking queue

## 6. Statistics System

### Key Functions
- `saveFinishedGame()`: Saves statistics from a completed game
- `getPlayerStats()`: Gets a player's game statistics
- `getPlayerAverageStats()`: Gets a player's average game statistics
- `updatePlayerGameStats()`: Updates a player's game statistics
- `updatePlayerLevel()`: Updates a player's level based on XP

## 7. Mission System

### Key Functions
- `createMission()`: Creates a new mission
- `createUserMission()`: Creates a mission for a specific user
- `updateGeneralMissionProgress()`: Updates progress for general missions
- `updateUserMissionsProgress()`: Updates progress for user-specific missions
- `claimUserReward()`: Claims rewards for completed user missions

## 8. Progress Manager

### Key Functions
- `updateProgressManager()`: Central function that updates mission progress and achievements
- `updateAchievementProgressManager()`: Updates achievement progress based on player actions

## 9. System Functions

### Key Functions
- `preupgrade()`: Prepares data for canister upgrades
- `postupgrade()`: Restores data after canister upgrades

## Interconnections Between Systems

1. **Player & Friend Systems**: The player system manages user accounts, while the friend system handles relationships between players. When a friend request is sent or accepted, it affects both systems.

2. **Friend & Notification Systems**: When friend-related actions occur (sending/accepting requests), the notification system is triggered to inform users.

3. **Player & Achievement Systems**: Player actions trigger achievement progress updates through the Progress Manager.

4. **Matchmaking & Statistics Systems**: When matches are completed, the statistics system records player performance.

5. **Statistics & Achievement Systems**: Game statistics are used to update achievement progress.

6. **Mission & Achievement Systems**: Both systems provide rewards to players for completing objectives, with different structures and timeframes.

## Data Flow Example: Friend Request Process

1. Player A sends a friend request to Player B using `sendFriendRequest()`
2. The request is stored in Player B's friend requests list
3. A notification is sent to Player B using `sendNotification()`
4. Player B accepts the request using `acceptFriendRequest()`
5. The request is removed from Player B's friend requests list
6. Both players are added to each other's friends lists using `addFriendToUser()`
7. A mutual friendship is recorded in `mutualFriendships`
8. A notification is sent to Player A about the acceptance
9. The "Add Friend" achievement is updated for both players using `updateAddFriendAchievement()` 