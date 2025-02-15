import Types "Types";

module AchievementData {

    public type AchievementCategory = Types.AchievementCategory;
    public type AchievementLine = Types.AchievementLine;
    public type IndividualAchievement = Types.IndividualAchievement;
    public type AchievementReward = Types.AchievementReward;
    public type AchievementRewardsType = Types.AchievementRewardsType;
    public type AchievementType = Types.AchievementType;

    // Define each individual achievement for Twitter
    let indAchievementsTwitter: [IndividualAchievement] = [
        { id = 1; achievementId = 1; name = "Connect with X"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Stardust; amount = 10 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 2; achievementId = 1; name = "Follow us on X"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 2 }, { rewardType = #XP; amount = 35 }]; progress = 0; claimed = false },
        { id = 3; achievementId = 1; name = "Like/Share/Comment on X"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 3 }, { rewardType = #XP; amount = 45 }]; progress = 0; claimed = false },
        { id = 4; achievementId = 1; name = "Post and tag us on X"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 4 }, { rewardType = #XP; amount = 55 }]; progress = 0; claimed = false },
    ];

    // Define each individual achievement for Discord
    let indAchievementsDiscord: [IndividualAchievement] = [
        { id = 5; achievementId = 2; name = "Connect with Discord"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Stardust; amount = 10 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 6; achievementId = 2; name = "Follow us on Discord"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 2 }, { rewardType = #XP; amount = 35 }]; progress = 0; claimed = false },
        { id = 7; achievementId = 2; name = "Like/Share/Comment on Discord"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 3 }, { rewardType = #XP; amount = 45 }]; progress = 0; claimed = false },
        { id = 8; achievementId = 2; name = "Join Discord Server"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 4 }, { rewardType = #XP; amount = 55 }]; progress = 0; claimed = false },
        { id = 9; achievementId = 2; name = "Add Faction Role"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 5 }, { rewardType = #XP; amount = 65 }]; progress = 0; claimed = false },
    ];

    // Define each individual achievement for DSCVR
    let indAchievementsDSCVR: [IndividualAchievement] = [
        { id = 10; achievementId = 3; name = "Connect with DSCVR"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Stardust; amount = 10 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 11; achievementId = 3; name = "Follow us on DSCVR"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 2 }, { rewardType = #XP; amount = 35 }]; progress = 0; claimed = false },
        { id = 12; achievementId = 3; name = "Like/Share/Comment on DSCVR"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 3 }, { rewardType = #XP; amount = 45 }]; progress = 0; claimed = false },
        { id = 13; achievementId = 3; name = "Post and tag us on DSCVR"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 4 }, { rewardType = #XP; amount = 55 }]; progress = 0; claimed = false },
    ];

    // Define each individual achievement for Tiktok
    let indAchievementsTiktok: [IndividualAchievement] = [
        { id = 14; achievementId = 4; name = "Connect with Tiktok"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Stardust; amount = 10 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 15; achievementId = 4; name = "Follow us on Tiktok"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 2 }, { rewardType = #XP; amount = 35 }]; progress = 0; claimed = false },
        { id = 16; achievementId = 4; name = "Like/Share/Comment on Tiktok"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 3 }, { rewardType = #XP; amount = 45 }]; progress = 0; claimed = false },
        { id = 17; achievementId = 4; name = "Post and tag us on Tiktok"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 4 }, { rewardType = #XP; amount = 55 }]; progress = 0; claimed = false },
    ];

    // Define each individual achievement for Facebook
    let indAchievementsFacebook: [IndividualAchievement] = [
        { id = 18; achievementId = 5; name = "Connect with Facebook"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Stardust; amount = 10 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 19; achievementId = 5; name = "Follow us on Facebook"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 2 }, { rewardType = #XP; amount = 35 }]; progress = 0; claimed = false },
        { id = 20; achievementId = 5; name = "Like/Share/Comment on Facebook"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 3 }, { rewardType = #XP; amount = 45 }]; progress = 0; claimed = false },
        { id = 21; achievementId = 5; name = "Post and tag us on Facebook"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 4 }, { rewardType = #XP; amount = 55 }]; progress = 0; claimed = false },
    ];

    // Define each individual achievement for Instagram
    let indAchievementsInstagram: [IndividualAchievement] = [
        { id = 22; achievementId = 6; name = "Connect with Instagram"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Stardust; amount = 10 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 23; achievementId = 6; name = "Follow us on Instagram"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 2 }, { rewardType = #XP; amount = 35 }]; progress = 0; claimed = false },
        { id = 24; achievementId = 6; name = "Like/Share/Comment on Instagram"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 3 }, { rewardType = #XP; amount = 45 }]; progress = 0; claimed = false },
        { id = 25; achievementId = 6; name = "Post and tag us on Instagram"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Chest; amount = 4 }, { rewardType = #XP; amount = 55 }]; progress = 0; claimed = false },
    ];


    // Define each individual achievement for the Referrals Program
    let indAchievementsReferrals: [IndividualAchievement] = [
        { id = 26; achievementId = 7; name = "1 Referral"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Stardust; amount = 10 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 27; achievementId = 7; name = "3 Referrals"; achievementType = #Social; requiredProgress = 3; completed = false; reward = [{ rewardType = #Stardust; amount = 35 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 28; achievementId = 7; name = "5 Referrals"; achievementType = #Social; requiredProgress = 5; completed = false; reward = [{ rewardType = #Stardust; amount = 75 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 29; achievementId = 7; name = "10 Referrals"; achievementType = #Social; requiredProgress = 10; completed = false; reward = [{ rewardType = #Stardust; amount = 150 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false },
        { id = 30; achievementId = 7; name = "25 Referrals"; achievementType = #Social; requiredProgress = 25; completed = false; reward = [{ rewardType = #Stardust; amount = 500 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 25 }]; progress = 0; claimed = false }
    ];

    let indAchievementsFeedback: [IndividualAchievement] = [
        { id = 31; achievementId = 8; name = "Send Feedback after 1 Game"; achievementType = #Social; requiredProgress = 1; completed = false; reward = [{ rewardType = #Multiplier; amount = 1 }]; progress = 0; claimed = false },
        { id = 32; achievementId = 8; name = "Send Feedback after 3 Games"; achievementType = #Social; requiredProgress = 3; completed = false; reward = [{ rewardType = #Multiplier; amount = 1 }]; progress = 0; claimed = false },
        { id = 33; achievementId = 8; name = "Send Feedback after 5 Games"; achievementType = #Social; requiredProgress = 5; completed = false; reward = [{ rewardType = #Multiplier; amount = 1 }]; progress = 0; claimed = false },
        { id = 34; achievementId = 8; name = "Send Feedback after 10 Games"; achievementType = #Social; requiredProgress = 10; completed = false; reward = [{ rewardType = #Multiplier; amount = 2 }]; progress = 0; claimed = false },
        { id = 35; achievementId = 8; name = "Send Feedback after 25 Games"; achievementType = #Social; requiredProgress = 25; completed = false; reward = [{ rewardType = #Multiplier; amount = 3 }]; progress = 0; claimed = false },
        { id = 36; achievementId = 8; name = "Send Feedback after 50 Games"; achievementType = #Social; requiredProgress = 50; completed = false; reward = [{ rewardType = #Multiplier; amount = 4 }]; progress = 0; claimed = false },
        { id = 37; achievementId = 8; name = "Send Feedback after 100 Games"; achievementType = #Social; requiredProgress = 100; completed = false; reward = [{ rewardType = #Multiplier; amount = 5 }]; progress = 0; claimed = false }
    ];


    // Define all achievement lines including the Referrals Program
    let achievementLines: [AchievementLine] = [
        { id = 1; name = "Twitter"; individualAchievements = indAchievementsTwitter; categoryId = 1; reward = [{ rewardType = #Title; amount = 91 }, { rewardType = #Stardust; amount = 100 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 50 }]; requiredProgress = 4; completed = false; progress = 0; claimed = false },
        { id = 2; name = "Discord"; individualAchievements = indAchievementsDiscord; categoryId = 1; reward = [{ rewardType = #Title; amount = 92 }, { rewardType = #Stardust; amount = 100 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 50 }]; requiredProgress = 5; completed = false; progress = 0; claimed = false },
        { id = 3; name = "DSCVR"; individualAchievements = indAchievementsDSCVR; categoryId = 1; reward = [{ rewardType = #Title; amount = 93 }, { rewardType = #Stardust; amount = 100 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 50 }]; requiredProgress = 4; completed = false; progress = 0; claimed = false },
        { id = 4; name = "Tiktok"; individualAchievements = indAchievementsTiktok; categoryId = 1; reward = [{ rewardType = #Title; amount = 94 }, { rewardType = #Stardust; amount = 100 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 50 }]; requiredProgress = 4; completed = false; progress = 0; claimed = false },
        { id = 5; name = "Facebook"; individualAchievements = indAchievementsFacebook; categoryId = 1; reward = [{ rewardType = #Title; amount = 95 }, { rewardType = #Stardust; amount = 100 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 50 }]; requiredProgress = 4; completed = false; progress = 0; claimed = false },
        { id = 6; name = "Instagram"; individualAchievements = indAchievementsInstagram; categoryId = 1; reward = [{ rewardType = #Title; amount = 96 }, { rewardType = #Stardust; amount = 100 }, { rewardType = #Chest; amount = 1 }, { rewardType = #XP; amount = 50 }]; requiredProgress = 4; completed = false; progress = 0; claimed = false },
        { id = 7; name = "Referrals Program"; individualAchievements = indAchievementsReferrals; categoryId = 1; reward = [{ rewardType = #Title; amount = 98 }, { rewardType = #Avatar; amount = 98 }, { rewardType = #Stardust; amount = 1000 }, { rewardType = #Chest; amount = 10 }, { rewardType = #XP; amount = 1000 }]; requiredProgress = 5; completed = false; progress = 0; claimed = false },
        { id = 8; name = "Feedback Rewards"; individualAchievements = indAchievementsFeedback; categoryId = 1; reward = [{ rewardType = #Multiplier; amount = 10 }, { rewardType = #XP; amount = 100 }]; requiredProgress = 7; completed = false; progress = 0; claimed = false }

    ];

    // Define the category "Tiers"
    let categoryTiers: AchievementCategory = {
        id = 1;
        name = "Tiers";
        achievements = achievementLines;
        reward = [{ rewardType = #NFT; amount = 1 }, { rewardType = #Title; amount = 99 }, { rewardType = #Avatar; amount = 99 }, { rewardType = #Stardust; amount = 1000 }, { rewardType = #Chest; amount = 10 }, { rewardType = #XP; amount = 1000 }];
        requiredProgress = 7;
        completed = false;
        progress = 0;
        claimed = false;
    };

    // Export the category
    public func getTiersCategory(): AchievementCategory {
        return categoryTiers;
    };
}
