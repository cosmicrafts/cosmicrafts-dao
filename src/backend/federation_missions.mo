/**
 * Federation Missions Canister
 * 
 * This canister implements a global mission board where commanders pick up
 * assignments from the federation. Unlike personal missions, these are
 * worldwide/community missions where players can see who else is working
 * on missions and compete for limited slots.
 */

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Random "mo:base/Random";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Timer "mo:base/Timer";

actor FederationMissions {
  
  // Types for mission system
  type MissionId = Text;
  type PlayerId = Principal;
  type Timestamp = Int;
  
  type MissionRarity = {
    #Common;
    #Uncommon;
    #Rare;
    #Epic;
    #Legendary;
  };
  
  type MissionStatus = {
    #Available;    // In mission pool, can be accepted
    #Active;       // Accepted by players, in progress
    #Completed;    // Successfully finished
    #Failed;       // Not completed before expiry
    #Expired;      // No longer available for acceptance
  };
  
  type MissionReward = {
    tokenAmount: Nat;
    xpAmount: Nat;
    rareLoot: ?Text;  // Special NFT or item ID
  };
  
  type MissionRequirement = {
    minLevel: Nat;
    shipClass: ?Text;   // Optional specific ship requirement
    numShips: Nat;      // Number of ships needed
    specialItem: ?Text; // Optional special item required
  };
  
  type Mission = {
    id: MissionId;
    name: Text;
    description: Text;
    faction: ?Text;     // Optional faction-specific mission
    rarity: MissionRarity;
    status: MissionStatus;
    reward: MissionReward;
    requirements: MissionRequirement;
    createdAt: Timestamp;
    expiresAt: Timestamp;
    duration: Nat;      // Time to complete in seconds once accepted
    maxParticipants: Nat; // How many commanders can accept this mission
    currentParticipants: Nat; // Current count of commanders on this mission
  };
  
  type PlayerMission = {
    missionId: MissionId;
    acceptedAt: Timestamp;
    completesAt: Timestamp;
    status: {
      #InProgress;
      #ReadyToComplete;
      #Completed;
      #Failed;
    };
  };
  
  // Mission pool - all available federation missions
  private stable var missionEntries : [(MissionId, Mission)] = [];
  private var missions = HashMap.HashMap<MissionId, Mission>(10, Text.equal, Text.hash);
  
  // Player mission assignments
  private stable var playerMissionEntries : [(PlayerId, [PlayerMission])] = [];
  private var playerMissions = HashMap.HashMap<PlayerId, [PlayerMission]>(10, Principal.equal, Principal.hash);
  
  // Mission templates for generation
  private let missionTemplates = [
    {
      name = "Stellar Defense";
      description = "Deploy ships to defend a federation outpost from pirate raids";
      baseDuration = 3600; // 1 hour
      baseReward = { tokenAmount = 50; xpAmount = 100; rareLoot = null; };
      baseRequirements = { minLevel = 1; shipClass = null; numShips = 1; specialItem = null; };
    },
    {
      name = "Resource Expedition";
      description = "Collect rare resources from an asteroid field";
      baseDuration = 7200; // 2 hours
      baseReward = { tokenAmount = 100; xpAmount = 200; rareLoot = null; };
      baseRequirements = { minLevel = 2; shipClass = null; numShips = 1; specialItem = null; };
    },
    {
      name = "Deep Space Exploration";
      description = "Map a newly discovered sector of space";
      baseDuration = 14400; // 4 hours
      baseReward = { tokenAmount = 200; xpAmount = 400; rareLoot = null; };
      baseRequirements = { minLevel = 3; shipClass = null; numShips = 2; specialItem = null; };
    },
    {
      name = "Faction Diplomacy";
      description = "Conduct diplomatic negotiations with alien factions";
      baseDuration = 28800; // 8 hours
      baseReward = { tokenAmount = 400; xpAmount = 800; rareLoot = null; };
      baseRequirements = { minLevel = 5; shipClass = null; numShips = 1; specialItem = "Diplomatic Seal"; };
    },
    {
      name = "Dark Rift Expedition";
      description = "Investigate anomalies within the Dark Rift";
      baseDuration = 43200; // 12 hours
      baseReward = { tokenAmount = 600; xpAmount = 1200; rareLoot = "Dark Matter Fragment"; };
      baseRequirements = { minLevel = 8; shipClass = "Exploration Vessel"; numShips = 2; specialItem = null; };
    }
  ];
  
  // System initialization
  system func preupgrade() {
    missionEntries := Iter.toArray(missions.entries());
    playerMissionEntries := Iter.toArray(playerMissions.entries());
  };
  
  system func postupgrade() {
    missions := HashMap.fromIter<MissionId, Mission>(
      missionEntries.vals(), 10, Text.equal, Text.hash);
      
    playerMissions := HashMap.fromIter<PlayerId, [PlayerMission]>(
      playerMissionEntries.vals(), 10, Principal.equal, Principal.hash);
      
    missionEntries := [];
    playerMissionEntries := [];
  };
  
  // Generate new federation missions
  private func generateMissions(count : Nat) : async () {
    let now = Time.now();
    let seed = Int.abs(now);
    let randomGenerator = Random.Finite(seed);
    
    for (i in Iter.range(0, count - 1)) {
      let templateIndex = randomGenerator.range(0, missionTemplates.size() - 1);
      let template = missionTemplates[templateIndex];
      
      // Randomize rarity
      let rarityRoll = randomGenerator.range(1, 100);
      let rarity = if (rarityRoll <= 60) {
        #Common
      } else if (rarityRoll <= 85) {
        #Uncommon
      } else if (rarityRoll <= 95) {
        #Rare
      } else if (rarityRoll <= 99) {
        #Epic
      } else {
        #Legendary
      };
      
      // Scale rewards based on rarity
      let rewardMultiplier = switch (rarity) {
        case (#Common) 1;
        case (#Uncommon) 2;
        case (#Rare) 3;
        case (#Epic) 5;
        case (#Legendary) 10;
      };
      
      let tokenAmount = template.baseReward.tokenAmount * rewardMultiplier;
      let xpAmount = template.baseReward.xpAmount * rewardMultiplier;
      
      // Rare loot for higher rarities
      let rareLoot = if (rarityRoll > 90) {
        switch(rarity) {
          case (#Epic) ?"Epic Ship Blueprint";
          case (#Legendary) ?"Legendary Commander Badge";
          case (_) template.baseReward.rareLoot;
        }
      } else {
        template.baseReward.rareLoot
      };
      
      // Create mission
      let missionId = "mission-" # Int.toText(now) # "-" # Int.toText(i);
      let expiryTime = now + (86400 * 1_000_000_000); // 24 hours in nanoseconds
      
      let newMission : Mission = {
        id = missionId;
        name = template.name;
        description = template.description;
        faction = null; // TODO: Add faction-specific missions
        rarity = rarity;
        status = #Available;
        reward = {
          tokenAmount = tokenAmount;
          xpAmount = xpAmount;
          rareLoot = rareLoot;
        };
        requirements = template.baseRequirements;
        createdAt = now;
        expiresAt = expiryTime;
        duration = template.baseDuration * 1_000_000_000; // convert to nanoseconds
        maxParticipants = 10 + randomGenerator.range(0, 20); // Random max participants 
        currentParticipants = 0;
      };
      
      missions.put(missionId, newMission);
    }
  };
  
  // Public method to get available missions
  public query func getAvailableMissions(level : Nat) : async [Mission] {
    let now = Time.now();
    let availableMissions = Buffer.Buffer<Mission>(10);
    
    for ((id, mission) in missions.entries()) {
      if (mission.status == #Available and 
          mission.expiresAt > now and 
          mission.requirements.minLevel <= level and
          mission.currentParticipants < mission.maxParticipants) {
        availableMissions.add(mission);
      }
    }
    
    return Buffer.toArray(availableMissions);
  };
  
  // Accept a mission
  public shared(msg) func acceptMission(missionId : MissionId) : async Result.Result<PlayerMission, Text> {
    let player = msg.caller;
    
    switch (missions.get(missionId)) {
      case (null) {
        return #err("Mission not found");
      };
      case (?mission) {
        if (mission.status != #Available) {
          return #err("Mission is not available");
        };
        
        if (mission.currentParticipants >= mission.maxParticipants) {
          return #err("Mission is already at max capacity");
        };
        
        let now = Time.now();
        if (mission.expiresAt <= now) {
          return #err("Mission has expired");
        };
        
        // TODO: Verify player level and requirements
        
        // Update mission participants
        let updatedMission = {
          mission with 
          currentParticipants = mission.currentParticipants + 1;
        };
        missions.put(missionId, updatedMission);
        
        // Create player mission assignment
        let playerMission : PlayerMission = {
          missionId = missionId;
          acceptedAt = now;
          completesAt = now + mission.duration;
          status = #InProgress;
        };
        
        // Add to player's missions
        let currentMissions = Option.get(playerMissions.get(player), []);
        let updatedMissions = Array.append(currentMissions, [playerMission]);
        playerMissions.put(player, updatedMissions);
        
        return #ok(playerMission);
      };
    }
  };
  
  // Get player missions
  public query(msg) func getPlayerMissions() : async [PlayerMission] {
    Option.get(playerMissions.get(msg.caller), [])
  };
  
  // Complete mission
  public shared(msg) func completeMission(missionId : MissionId) : async Result.Result<MissionReward, Text> {
    let player = msg.caller;
    let now = Time.now();
    
    // Check if player has missions
    if (Option.isNull(playerMissions.get(player))) {
      return #err("No missions found for player");
    };
    
    let playerMissionList = Option.get(playerMissions.get(player), []);
    
    // Find the mission in player's missions
    var missionIndex : ?Nat = null;
    for (i in Iter.range(0, playerMissionList.size() - 1)) {
      let mission = playerMissionList[i];
      if (mission.missionId == missionId) {
        missionIndex := ?i;
      };
    };
    
    // Check if mission was found
    if (Option.isNull(missionIndex)) {
      return #err("Mission not found in player's active missions");
    };
    
    let index = Option.get(missionIndex, 0);
    let playerMission = playerMissionList[index];
    
    // Check mission status
    if (playerMission.status != #InProgress and playerMission.status != #ReadyToComplete) {
      return #err("Mission cannot be completed in its current state");
    };
    
    // Check if mission is ready to complete
    if (playerMission.completesAt > now) {
      return #err("Mission is still in progress");
    };
    
    // Get mission details
    let originalMission = missions.get(missionId);
    if (Option.isNull(originalMission)) {
      return #err("Original mission not found");
    };
    
    // Update player mission status
    let updatedMissions = Array.tabulate<PlayerMission>(
      playerMissionList.size(),
      func (i) {
        if (i == index) {
          {
            playerMission with
            status = #Completed;
          }
        } else {
          playerMissionList[i]
        }
      }
    );
    
    playerMissions.put(player, updatedMissions);
    
    // Return reward
    return #ok(Option.get(originalMission, { 
      id = ""; 
      name = ""; 
      description = ""; 
      faction = null; 
      rarity = #Common; 
      status = #Available; 
      reward = { tokenAmount = 0; xpAmount = 0; rareLoot = null; }; 
      requirements = { minLevel = 0; shipClass = null; numShips = 0; specialItem = null; };
      createdAt = 0;
      expiresAt = 0;
      duration = 0;
      maxParticipants = 0;
      currentParticipants = 0;
    }).reward);
  };
  
  // Function to initialize the canister with starting missions
  public shared(msg) func initialize() : async Text {
    assert(msg.caller == Principal.fromText("2vxsx-fae")); // Replace with admin principal

    await generateMissions(20);
    return "Initialized with 20 federation missions";
  };
  
  // Function to get mission by ID (useful for UI)
  public query func getMissionById(id : MissionId) : async ?Mission {
    missions.get(id)
  };
  
  // Timer id for periodic mission generation
  private var missionGenerationTimer : ?Timer.TimerId = null;
  
  // Set up periodic mission generation (every 6 hours)
  system func init() {
    // Generate initial missions
    ignore generateMissions(20);
    
    // Set up timer for mission generation
    missionGenerationTimer := ?Timer.recurringTimer(
      #seconds(6 * 60 * 60), // 6 hours
      func() : async () {
        await generateMissions(5); // Add 5 new missions every 6 hours
        await expireOldMissions();
        await updatePlayerMissionStatuses();
      }
    );
  };
  
  // Expire old missions
  private func expireOldMissions() : async () {
    let now = Time.now();
    
    for ((id, mission) in missions.entries()) {
      if (mission.expiresAt <= now and mission.status == #Available) {
        let expiredMission = {
          mission with
          status = #Expired;
        };
        missions.put(id, expiredMission);
      };
    };
  };
  
  // Update player mission statuses
  private func updatePlayerMissionStatuses() : async () {
    let now = Time.now();
    let sixHours = 6 * 60 * 60 * 1_000_000_000;
    
    for ((playerId, playerMissionList) in playerMissions.entries()) {
      let updatedMissions = Array.map<PlayerMission, PlayerMission>(
        playerMissionList,
        func (mission) {
          if (mission.status == #InProgress and mission.completesAt <= now) {
            {
              mission with
              status = #ReadyToComplete;
            }
          } else if (mission.status == #ReadyToComplete and (mission.completesAt + sixHours) <= now) {
            // Auto-fail missions that weren't claimed within 6 hours of completion
            {
              mission with
              status = #Failed;
            }
          } else {
            mission
          }
        }
      );
      
      playerMissions.put(playerId, updatedMissions);
    };
  };
} 