# Cosmicrafts Friends System Documentation

## Overview

The Cosmicrafts Friends System provides social networking capabilities within the platform, allowing users to connect, interact, and play together. This document outlines the current implementation, the frontend-backend interaction, and provides recommendations for future improvements.

## Current Implementation

### Frontend Components

#### FriendsSection.vue
The main component that manages the display and interaction with the friends system in the dashboard. It includes:

- **Tabs**: All Friends, Friend Requests, Blocked Users, and Find Friends
- **Search Functionality**: Search for users by username or principal ID
- **Friend Management**: Add, remove, message, and view profiles
- **Privacy Settings**: Control who can send friend requests

#### FriendCard.vue
Displays individual friend information with options to:
- View profile
- Send messages
- Remove friend

#### FriendRequestCard.vue
Displays incoming friend requests with options to:
- Accept request
- Decline request
- View profile

#### BlockedUserCard.vue
Displays blocked users with options to:
- Unblock user
- View profile

#### PlayerSearchResult.vue
Displays search results when looking for new friends with options to:
- Send friend request
- Block user
- View profile

### Frontend-Backend Interaction

#### Authentication and Identity
- Uses `authStore` to manage user identity
- Principal IDs serve as unique identifiers for users

#### Friend Management API Calls
1. **Viewing Friends**
   - Frontend calls `getFriendsList()` from the canister
   - Processes the returned list of principal IDs
   - Fetches detailed profile info for each friend using `getProfile(principalId)`

2. **Friend Requests**
   - Send: `sendFriendRequest(playerId)`
   - Accept: `acceptFriendRequest(playerId)`
   - Decline: `declineFriendRequest(playerId)`
   - View pending: `getFriendRequests()`

3. **Blocking Users**
   - Block: `blockUser(playerId)`
   - Unblock: `unblockUser(playerId)`
   - View blocked: `getBlockedUsers()`

4. **Searching Users**
   - By username: `searchUserByUsername(username)`
   - By principal ID: Directly uses the principal ID to fetch a specific profile

#### Data Flow
1. User initiates action (e.g., sending a friend request)
2. Frontend calls the appropriate canister method
3. Backend processes the request and updates state
4. Frontend refreshes the relevant data and updates the UI
5. Notification is displayed to confirm the action

## Backend Canister Methods

The backend provides these methods related to the friend system:

```javascript
// Friend Management
sendFriendRequest: (playerId: Principal) => [Boolean, Text]
acceptFriendRequest: (playerId: Principal) => [Boolean, Text]
declineFriendRequest: (playerId: Principal) => [Boolean, Text]
blockUser: (playerId: Principal) => [Boolean, Text]
unblockUser: (playerId: Principal) => [Boolean, Text]

// Data Retrieval
getFriendsList: () => [Opt<Vec<PlayerId>>]
getFriendRequests: () => [Vec<FriendRequest>]
getBlockedUsers: () => [Vec<PlayerId>]
getProfile: (playerId: PlayerId) => [Opt<Player>]
searchUserByUsername: (username: Text) => [Vec<Player>]

// Privacy
setPrivacySetting: (setting: PrivacySetting) => [Boolean, Text]
getMyPrivacySettings: () => [PrivacySetting]
```

## User Experience

The current implementation provides basic friend management capabilities:

1. **Discovery**: Users can search for others by username or principal ID
2. **Connection**: Send, accept, and decline friend requests
3. **Management**: View friends list, remove friends, block users
4. **Privacy**: Control who can send friend requests
5. **Communication**: Basic messaging capability (placeholder)

## Recommendations for Improvement

Based on analysis of the current system and best practices from platforms like Facebook, Battle.net, and Steam, here are recommendations for enhancing the Cosmicrafts social experience:

### 1. Enhanced Friend Relationships

#### Backend Improvements:
```javascript
// Friend relationship status tracking
getFriendRelationship: (playerId: Principal) => FriendRelationshipStatus
// Where FriendRelationshipStatus could be:
// - NotFriends
// - Pending (outgoing request)
// - RequestReceived (incoming request)
// - Friends
// - Blocked
// - FavoriteFriend

addFavorite: (playerId: Principal) => [Boolean, Text]
removeFavorite: (playerId: Principal) => [Boolean, Text]
getFavorites: () => [Vec<PlayerId>]

// Friend notes (visible only to user)
addFriendNote: (playerId: Principal, note: Text) => [Boolean, Text]
getFriendNote: (playerId: Principal) => [Opt<Text>]
```

### 2. Rich Presence System

#### Backend Improvements:
```javascript
// Status updates
setStatus: (status: UserStatus, customMessage: Opt<Text>) => [Boolean, Text]
getPlayerStatus: (playerId: Principal) => [UserStatus, Opt<Text>]

// Activity tracking
setCurrentActivity: (activity: UserActivity) => [Boolean, Text]
getCurrentActivity: (playerId: Principal) => [Opt<UserActivity>]

// Where UserStatus could be: Online, Away, Busy, Offline, Invisible
// And UserActivity could track: Playing a specific game, In lobby, Spectating, etc.
```

### 3. Social Groups and Clans

#### Backend Improvements:
```javascript
// Clan/guild system
createClan: (name: Text, description: Text, logo: Opt<Blob>) => [ClanId, Text]
joinClan: (clanId: ClanId) => [Boolean, Text]
leaveClan: (clanId: ClanId) => [Boolean, Text]
inviteToClan: (playerId: Principal, clanId: ClanId) => [Boolean, Text]
getClanMembers: (clanId: ClanId) => [Vec<PlayerId>]

// Friend groups (user-defined categories)
createFriendGroup: (name: Text) => [GroupId, Text]
addFriendToGroup: (playerId: Principal, groupId: GroupId) => [Boolean, Text]
removeFriendFromGroup: (playerId: Principal, groupId: GroupId) => [Boolean, Text]
getFriendGroups: () => [Vec<FriendGroup>]
```

### 4. Social Activity Feed

#### Backend Improvements:
```javascript
// Activity feed
getFriendActivities: (limit: Nat) => [Vec<FriendActivity>]
createActivity: (activityType: ActivityType, data: ActivityData) => [Boolean, Text]
likeActivity: (activityId: ActivityId) => [Boolean, Text]
commentOnActivity: (activityId: ActivityId, comment: Text) => [Boolean, Text]

// Friend achievements
getFriendAchievements: (playerId: Principal, limit: Nat) => [Vec<Achievement>]
```

### 5. Cross-Game Integration

#### Backend Improvements:
```javascript
// Game invites
sendGameInvite: (playerId: Principal, gameId: GameId, message: Opt<Text>) => [Boolean, Text]
getGameInvites: () => [Vec<GameInvite>]
respondToGameInvite: (inviteId: InviteId, accept: Boolean) => [Boolean, Text]

// Match history with friends
getMatchesWithFriend: (playerId: Principal) => [Vec<MatchSummary>]
```

### 6. Advanced Communication

#### Backend Improvements:
```javascript
// Rich messaging
sendMessage: (playerId: Principal, message: MessageContent) => [Boolean, Text]
getMessages: (playerId: Principal, limit: Nat, offset: Nat) => [Vec<Message>]
markMessageAsRead: (messageId: MessageId) => [Boolean, Text]

// Voice chat integration
createVoiceChannel: (name: Text) => [ChannelId, Text]
inviteToVoiceChannel: (playerId: Principal, channelId: ChannelId) => [Boolean, Text]
```

### 7. Privacy and Reputation

#### Backend Improvements:
```javascript
// Enhanced privacy controls
setPrivacyOptions: (options: PrivacyOptions) => [Boolean, Text]
// Where PrivacyOptions could include:
// - Who can see online status
// - Who can see game activity
// - Who can see achievements
// - Who can send messages
// - Who can invite to games

// Reputation system
reportPlayer: (playerId: Principal, reason: Text, evidence: Opt<Blob>) => [Boolean, Text]
endorsePlayer: (playerId: Principal, skill: PlayerSkill) => [Boolean, Text]
getPlayerReputation: (playerId: Principal) => [ReputationScore]
```

### 8. Friend Recommendations

#### Backend Improvements:
```javascript
// Smart friend suggestions
getFriendSuggestions: (limit: Nat) => [Vec<PlayerWithReason>]
// Where reasons could include: mutual friends, similar play styles, etc.

// "People you may know" feature
getMutualFriends: (playerId: Principal) => [Vec<PlayerId>]
```

## Implementation Priorities

Given the current state of the system, these improvements should be prioritized:

1. **Rich Presence System**: Showing who's online and what they're doing creates a more vibrant community
2. **Enhanced Communication**: Expanding messaging capabilities with read receipts and rich media
3. **Friend Activity Feed**: Seeing what friends are achieving increases engagement
4. **Social Groups**: Allowing players to organize their social connections
5. **Cross-Game Integration**: Making it easy to play together

## Conclusion

The current Cosmicrafts friend system provides a solid foundation for social interactions, but implementing these recommendations would significantly enhance user engagement and retention by fostering stronger social bonds within the platform. The most successful gaming platforms prioritize robust social features that keep players connected both in and out of games.

By adopting these improvements, Cosmicrafts can transform from a collection of individual players into a thriving social ecosystem where relationships enhance the gaming experience. 