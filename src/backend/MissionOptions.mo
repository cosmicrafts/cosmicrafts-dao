import Types "Types";

module MissionOptions {

    // Constant of Concurrent Missions
    public let hourlyMissions: [Types.MissionTemplate] = [
        {
            name = "Complete 1 Game";
            missionCategory = #Hourly;
            missionType = #GamesCompleted;
            rewardType = #Stardust;
            minReward = 18;
            maxReward = 36;
            total = 1;
            hoursActive = 1;
        },
        {
            name = "Win 1 Game";
            missionCategory = #Hourly;
            missionType = #GamesWon;
            rewardType = #Chest;
            minReward = 2;
            maxReward = 4;
            total = 1;
            hoursActive = 1;
        },
        {
            name = "Deal 1000 Damage";
            missionCategory = #Hourly;
            missionType = #DamageDealt;
            rewardType = #Stardust;
            minReward = 20;
            maxReward = 42;
            total = 1000;
            hoursActive = 1;
        },
        {
            name = "Take 500 Damage";
            missionCategory = #Hourly;
            missionType = #DamageTaken;
            rewardType = #Chest;
            minReward = 1;
            maxReward = 3;
            total = 500;
            hoursActive = 1;
        },
        {
            name = "Use 35 Energy";
            missionCategory = #Hourly;
            missionType = #EnergyUsed;
            rewardType = #Stardust;
            minReward = 22;
            maxReward = 38;
            total = 35;
            hoursActive = 1;
        },
        {
            name = "Deploy 20 NFTs";
            missionCategory = #Hourly;
            missionType = #UnitsDeployed;
            rewardType = #Stardust;
            minReward = 22;
            maxReward = 42;
            total = 20;
            hoursActive = 1;
        },
        {
            name = "Earn 150 XP";
            missionCategory = #Hourly;
            missionType = #XPEarned;
            rewardType = #Chest;
            minReward = 2;
            maxReward = 3;
            total = 150;
            hoursActive = 1;
        },
        {
            name = "Destroy 15 enemies";
            missionCategory = #Hourly;
            missionType = #Kills;
            rewardType = #Chest;
            minReward = 2;
            maxReward = 4;
            total = 15;
            hoursActive = 1;
        }
    ];

    public let dailyMissions: [Types.MissionTemplate] = [
        {
            name = "Complete 5 Games";
            missionCategory = #Daily;
            missionType = #GamesCompleted;
            rewardType = #Stardust;
            minReward = 128;
            maxReward = 256;
            total = 5;
            hoursActive = 24;
        },
        {
            name = "Win 3 Games";
            missionCategory = #Daily;
            missionType = #GamesWon;
            rewardType = #Chest;
            minReward = 4;
            maxReward = 6;
            total = 3;
            hoursActive = 24;
        },
        {
            name = "Deal 10000 Damage";
            missionCategory = #Daily;
            missionType = #DamageDealt;
            rewardType = #Stardust;
            minReward = 128;
            maxReward = 256;
            total = 10000;
            hoursActive = 24;
        },
        {
            name = "Take 9000 Damage";
            missionCategory = #Daily;
            missionType = #DamageTaken;
            rewardType = #Chest;
            minReward = 4;
            maxReward = 6;
            total = 9000;
            hoursActive = 24;
        },
        {
            name = "Use 300 Energy";
            missionCategory = #Daily;
            missionType = #EnergyUsed;
            rewardType = #Stardust;
            minReward = 128;
            maxReward = 360;
            total = 300;
            hoursActive = 24;
        },
        {
            name = "Deploy 100 NFTs";
            missionCategory = #Daily;
            missionType = #UnitsDeployed;
            rewardType = #Stardust;
            minReward = 128;
            maxReward = 300;
            total = 100;
            hoursActive = 24;
        },
        {
            name = "Earn 450 XP";
            missionCategory = #Daily;
            missionType = #XPEarned;
            rewardType = #Chest;
            minReward = 3;
            maxReward = 4;
            total = 450;
            hoursActive = 24;
        },
        {
            name = "Destroy 50 Enemies";
            missionCategory = #Daily;
            missionType = #Kills;
            rewardType = #Chest;
            minReward = 3;
            maxReward = 4;
            total = 50;
            hoursActive = 24;
        }
    ];

    public let weeklyMissions: [Types.MissionTemplate] = [
        {
            name = "Complete 20 Games";
            missionCategory = #Weekly;
            missionType = #GamesCompleted;
            rewardType = #Stardust;
            minReward = 768;  // Adjusted to fit the 20% more/less range
            maxReward = 1728;  // Adjusted to fit the 20% more/less range
            total = 20;
            hoursActive = 168;  // 7 days
        },
        {
            name = "Win 12 Games";
            missionCategory = #Weekly;
            missionType = #GamesWon;
            rewardType = #Chest;
            minReward = 7;  // Chest rewards
            maxReward = 8;  // Chest rewards
            total = 12;
            hoursActive = 168;  // 7 days
        },
        {
            name = "Deal 50000 Damage";
            missionCategory = #Weekly;
            missionType = #DamageDealt;
            rewardType = #Stardust;
            minReward = 800;  // Adjusted to fit the 20% more/less range
            maxReward = 2200;  // Adjusted to fit the 20% more/less range
            total = 50000;
            hoursActive = 168;  // 7 days
        },
        {
            name = "Take 25000 Damage";
            missionCategory = #Weekly;
            missionType = #DamageTaken;
            rewardType = #Chest;
            minReward = 6;  // Chest rewards
            maxReward = 8;  // Chest rewards
            total = 25000;
            hoursActive = 168;  // 7 days
        },
        {
            name = "Use 1000 Energy";
            missionCategory = #Weekly;
            missionType = #EnergyUsed;
            rewardType = #Stardust;
            minReward = 768;  // Adjusted to fit the 20% more/less range
            maxReward = 1728;  // Adjusted to fit the 20% more/less range
            total = 1000;
            hoursActive = 168;  // 7 days
        },
        {
            name = "Deploy 250 NFTs";
            missionCategory = #Weekly;
            missionType = #UnitsDeployed;
            rewardType = #Stardust;
            minReward = 900;  // Adjusted to fit the 20% more/less range
            maxReward = 2400;  // Adjusted to fit the 20% more/less range
            total = 250;
            hoursActive = 168;  // 7 days
        },
        {
            name = "Earn 2000 XP";
            missionCategory = #Weekly;
            missionType = #XPEarned;
            rewardType = #Chest;
            minReward = 6;  // Chest rewards
            maxReward = 8;  // Chest rewards
            total = 2000;
            hoursActive = 168;  // 7 days
        },
        {
            name = "Destroy 200 Enemies";
            missionCategory = #Weekly;
            missionType = #Kills;
            rewardType = #Chest;
            minReward = 6;  // Chest rewards
            maxReward = 8;  // Chest rewards
            total = 200;
            hoursActive = 168;  // 7 days
        }
    ];


    public let dailyFreeReward: [Types.MissionTemplate] = [
        {
        name = "Daily Free Chest";
        missionCategory = #Free;
        missionType = #GamesCompleted; // Not tied to gameplay
        rewardType = #Chest;
        minReward = 1;
        maxReward = 2;
        total = 0; // No gameplay required
        hoursActive = 4;
        },
        {
        name = "Daily Free STDs";
        missionCategory = #Free;
        missionType = #GamesCompleted; // Not tied to gameplay
        rewardType = #Stardust;
        minReward = 10;
        maxReward = 30;
        total = 0; // No gameplay required
        hoursActive = 4;
        }
    ];

    public func getXpRange(missionCategory: Types.MissionCategory): (Nat, Nat) {
    switch (missionCategory) {
        case (#Free) {
            return (10, 20);
        };
        case (#Hourly) {
            return (20, 30);
        };
        case (#Daily) {
            return (50, 100);
        };
        case (#Weekly) {
            return (200, 300);
        };
        case (#Achievement) {
            return (100, 200);
        };
    }
}

}
