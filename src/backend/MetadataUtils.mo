import TypesICRC7 "/icrc7/types";

module MetadataUtils {
    // Define chest types with their associated properties
    private type ChestType = {
        name: Text;
        rarity: Nat;
        faction: TypesICRC7.Faction;
        description: Text;
        image: Text;
        minTokens: Nat;
        maxTokens: Nat;
    };

    private let chestTypes: [ChestType] = [
        // Original Chests - Adjusted descriptions and factions
        {   // Case 1: Cosmic Cache (Common)
            name = "Cosmic Cache";
            rarity = 1;
            faction = #Cosmicon;
            description = "A standard-issue container utilized by Cosmicon forces for storing basic resources. Constructed with precision engineering to maintain order in token distribution. Contains between 10 and 20 tokens.";
            image = "/assets/webp/cosmic-cache.webp";
            minTokens = 10;
            maxTokens = 20;
        },
        {   // Case 2: Stellar Box (Uncommon)
            name = "Stellar Box";
            rarity = 2;
            faction = #Spirat;
            description = "A repurposed cargo container favored by Spirat crews for stashing their plunder. Modified with multiple false compartments and cryptographic locks. Contains between 21 and 33 tokens.";
            image = "/assets/webp/stellar-box.webp";
            minTokens = 21;
            maxTokens = 33;
        },
        {   // Case 3: Nebula Cube (Rare)
            name = "Nebula Cube";
            rarity = 3;
            faction = #Webe;
            description = "A geometric data storage unit created by the Webes, utilizing quantum entanglement to store more tokens than should be physically possible. Contains between 33 and 47 tokens.";
            image = "/assets/webp/nebula-cube.webp";
            minTokens = 33;
            maxTokens = 47;
        },
        {   // Case 4: Galactic Crate (Epic)
            name = "Galactic Crate";
            rarity = 4;
            faction = #Spade;
            description = "A container corrupted by Void energy, featuring shifting dimensions and an unsettling aura. Its true contents remain hidden until opened, revealing between 49 and 65 tokens.";
            image = "/assets/webp/galactic-crate.webp";
            minTokens = 49;
            maxTokens = 65;
        },
        {   // Case 5: Astral Vault (Legendary)
            name = "Astral Vault";
            rarity = 5;
            faction = #Arch;
            description = "A relic found in the wake of Arch devastation, containing remnants of consumed civilizations. Opens only to those who speak the ancient tongue of destruction. Contains between 69 and 87 tokens.";
            image = "/assets/webp/astral-vault.webp";
            minTokens = 69;
            maxTokens = 87;
        },
        {   // Case 6: Celestial Locker (Mythical)
            name = "Celestial Locker";
            rarity = 6;
            faction = #Celestial;
            description = "A sacred vessel forged by the Celestials to preserve powerful artifacts imbued with Spiral Force. Its interior glows with divine light when opened. Contains between 93 and 113 tokens.";
            image = "/assets/webp/celestial-locker.webp";
            minTokens = 93;
            maxTokens = 113;
        },
        {   // Case 7: Quantum Chest (Exotic)
            name = "Quantum Chest";
            rarity = 7;
            faction = #Neutral;
            description = "A mysterious container of unknown origin that exists in multiple realities simultaneously. Tokens retrieved from it occasionally display properties from alternate dimensions. Contains between 121 and 143 tokens.";
            image = "/assets/webp/quantum-chest.webp";
            minTokens = 121;
            maxTokens = 143;
        },
        {   // Case 8: Ethereal Metacube (Divine)
            name = "Ethereal Metacube";
            rarity = 8;
            faction = #Cosmicon;
            description = "The pinnacle of Cosmicon engineering, created to safeguard their most precious resources. Each face displays a different constellation marking the empire's territorial boundaries. Contains between 153 and 177 tokens.";
            image = "/assets/webp/ethereal-metacube.webp";
            minTokens = 153;
            maxTokens = 177;
        },
        
        // Enhanced Creative Chests
        {   // Case 9: Spirat's Booty Bag (Common)
            name = "Spirat's Booty Bag";
            rarity = 1;
            faction = #Spirat;
            description = "A tattered sack used by rookie Spirat raiders for their first heists. Often smells of illegal substances and contraband. Contains a modest haul of between 8 and 15 tokens.";
            image = "/assets/webp/spirat-booty-bag.webp";
            minTokens = 8;
            maxTokens = 15;
        },
        {   // Case 10: Void Fragment (Common)
            name = "Void Fragment";
            rarity = 1;
            faction = #Spade;
            description = "A corrupted shard of reality that pulses with malevolent energy. Those who hold it report whispers of darkness and promises of power. Yields between 12 and 22 tokens.";
            image = "/assets/webp/void-fragment.webp";
            minTokens = 12;
            maxTokens = 22;
        },
        {   // Case 11: Webe Data Cluster (Uncommon)
            name = "Webe Data Cluster";
            rarity = 2;
            faction = #Webe;
            description = "A floating array of interconnected crystalline nodes where Webes store valuable information and resources. Interfacing with it requires compatible neural ports. Contains between 25 and 38 tokens.";
            image = "/assets/webp/webe-data-cluster.webp";
            minTokens = 25;
            maxTokens = 38;
        },
        {   // Case 12: Cosmicon Regulation Vault (Rare)
            name = "Cosmicon Regulation Vault";
            rarity = 3;
            faction = #Cosmicon;
            description = "A standardized containment unit issued to high-ranking Cosmicon officials. Features military-grade encryption and a self-destruct mechanism if tampered with. Contains between 35 and 50 tokens.";
            image = "/assets/webp/cosmicon-vault.webp";
            minTokens = 35;
            maxTokens = 50;
        },
        {   // Case 13: Arch Consumption Vessel (Epic)
            name = "Arch Consumption Vessel";
            rarity = 4;
            faction = #Arch;
            description = "A grotesque organic container formed from the compressed remains of devoured worlds. Occasionally shifts and pulses as if still digesting its contents. Contains between 52 and 70 tokens.";
            image = "/assets/webp/arch-vessel.webp";
            minTokens = 52;
            maxTokens = 70;
        },
        {   // Case 14: Spade Corruption Node (Epic)
            name = "Spade Corruption Node";
            rarity = 4;
            faction = #Spade;
            description = "A pulsating dark mass that corrupts nearby matter and converts it into resources valued by the Spades. Handling it directly causes nightmarish visions. Contains between 55 and 75 tokens.";
            image = "/assets/webp/spade-node.webp";
            minTokens = 55;
            maxTokens = 75;
        },
        {   // Case 15: Webe Chronosphere (Legendary)
            name = "Webe Chronosphere";
            rarity = 5;
            faction = #Webe;
            description = "An advanced AI construct that manipulates temporal fields to store vast amounts of data and resources across different timestreams. Contains between 75 and 95 tokens that occasionally revert to past or future states.";
            image = "/assets/webp/webe-chronosphere.webp";
            minTokens = 75;
            maxTokens = 95;
        },
        {   // Case 16: Celestial Light Prism (Legendary)
            name = "Celestial Light Prism";
            rarity = 5;
            faction = #Celestial;
            description = "A crystalline structure infused with pure Spiral Force that refracts divine light into physical resources. Touching it grants visions of cosmic harmony. Contains between 80 and 100 tokens.";
            image = "/assets/webp/celestial-prism.webp";
            minTokens = 80;
            maxTokens = 100;
        },
        {   // Case 17: Spirat Flagship Strongbox (Mythical)
            name = "Spirat Flagship Strongbox";
            rarity = 6;
            faction = #Spirat;
            description = "The personal treasure chest of a legendary Spirat captain, stolen from countless worlds and protected by deadly traps and false compartments. Contains between 95 and 120 tokens.";
            image = "/assets/webp/spirat-strongbox.webp";
            minTokens = 95;
            maxTokens = 120;
        },
        {   // Case 18: Cosmic Anomaly (Mythical)
            name = "Cosmic Anomaly";
            rarity = 6;
            faction = #Neutral;
            description = "A tear in reality that inexplicably contains stable matter in the form of valuable tokens. Scientists from all factions seek to study its impossible properties. Contains between 100 and 130 tokens.";
            image = "/assets/webp/cosmic-anomaly.webp";
            minTokens = 100;
            maxTokens = 130;
        },
        {   // Case 19: Cosmicon Emperor's Coffer (Exotic)
            name = "Cosmicon Emperor's Coffer";
            rarity = 7;
            faction = #Cosmicon;
            description = "A legendary treasury box used by the supreme rulers of the Cosmicon empire. Its mathematical proportions represent perfection in their ideology. Contains between 130 and 155 tokens.";
            image = "/assets/webp/emperor-coffer.webp";
            minTokens = 130;
            maxTokens = 155;
        },
        {   // Case 20: Spade Singularity Core (Exotic)
            name = "Spade Singularity Core";
            rarity = 7;
            faction = #Spade;
            description = "The compressed heart of a void entity, containing a pocket dimension filled with corrupted treasures. Reality warps around it, making extraction dangerous but rewarding. Contains between 135 and 160 tokens.";
            image = "/assets/webp/singularity-core.webp";
            minTokens = 135;
            maxTokens = 160;
        },
        {   // Case 21: Arch World-Eater Stomach (Divine)
            name = "Arch World-Eater Stomach";
            rarity = 8;
            faction = #Arch;
            description = "The preserved digestive organ of an ancient Arch entity, containing the compressed wealth of thousands of civilizations consumed over millennia. Contains between 160 and 185 tokens.";
            image = "/assets/webp/arch-stomach.webp";
            minTokens = 160;
            maxTokens = 185;
        },
        {   // Case 22: Celestial Spiral Nexus (Divine)
            name = "Celestial Spiral Nexus";
            rarity = 8;
            faction = #Celestial;
            description = "A convergence point of pure Spiral Force, shaped by the Celestials to manifest physical rewards for their most devoted followers. Contains between 170 and 200 tokens of extraordinary power.";
            image = "/assets/webp/spiral-nexus.webp";
            minTokens = 170;
            maxTokens = 200;
        },
        {   // Case 23: Ultimate Paradox Vault (Ultimate)
            name = "Ultimate Paradox Vault";
            rarity = 8;
            faction = #Neutral;
            description = "A legendary container that defies all known laws of physics, containing more tokens than should be possible in its dimensions. Those who open it risk glimpsing truths beyond comprehension. Contains between 180 and 250 tokens.";
            image = "/assets/webp/paradox-vault.webp";
            minTokens = 180;
            maxTokens = 250;
        },
        {   // Case 24: Webe Digital Hypercube (Exotic)
            name = "Webe Digital Hypercube";
            rarity = 7;
            faction = #Webe;
            description = "A fourth-dimensional storage unit created by advanced Webe engineers, utilizing dimensional compression algorithms to store vast amounts of data and tokens. Contains between 125 and 150 tokens.";
            image = "/assets/webp/webe-hypercube.webp";
            minTokens = 125;
            maxTokens = 150;
        },
        {   // Case 25: Spirat's Legendary Hoard (Divine)
            name = "Spirat's Legendary Hoard";
            rarity = 8;
            faction = #Spirat;
            description = "The mythical treasure of the original Spirat King, containing plunder from the first days of space piracy. Its location has been sought for centuries. Contains between 165 and 190 tokens.";
            image = "/assets/webp/spirat-hoard.webp";
            minTokens = 165;
            maxTokens = 190;
        },
        {   // Case 26: Celestial Harmony Box (Rare)
            name = "Celestial Harmony Box";
            rarity = 3;
            faction = #Celestial;
            description = "A small container that emanates a peaceful aura, crafted by novice Celestial artisans to hold tokens imbued with minor Spiral Force. Contains between 30 and 45 tokens.";
            image = "/assets/webp/harmony-box.webp";
            minTokens = 30;
            maxTokens = 45;
        },
        {   // Case 27: Arch Remnant Shard (Uncommon)
            name = "Arch Remnant Shard";
            rarity = 2;
            faction = #Arch;
            description = "A fragment broken off from a larger Arch entity, slowly metabolizing ambient energy into valuable tokens. Handling it induces a mild feeling of dread. Contains between 22 and 35 tokens.";
            image = "/assets/webp/arch-shard.webp";
            minTokens = 22;
            maxTokens = 35;
        },
        {   // Case 28: Neutral Zone Debris Cluster (Common)
            name = "Neutral Zone Debris Cluster";
            rarity = 1;
            faction = #Neutral;
            description = "A collection of space debris that has naturally collected resources over time in the ungoverned regions between faction territories. Contains between 10 and 18 tokens.";
            image = "/assets/webp/debris-cluster.webp";
            minTokens = 10;
            maxTokens = 18;
        },
        {   // Case 29: Intergalactic Tournament Prize (Legendary)
            name = "Intergalactic Tournament Prize";
            rarity = 5;
            faction = #Neutral;
            description = "A prestigious award given to champions of the cross-faction combat tournaments held in neutral territories. Contains between 72 and 90 tokens selected from all faction types.";
            image = "/assets/webp/tournament-prize.webp";
            minTokens = 72;
            maxTokens = 90;
        },
        {   // Case 30: Corrupted Celestial Artifact (Mythical)
            name = "Corrupted Celestial Artifact";
            rarity = 6;
            faction = #Spade;
            description = "Once a pure vessel of Spiral Force, now corrupted by Spade influence. The struggle between light and void continues within, manifesting as fluctuating token values. Contains between 90 and 115 tokens.";
            image = "/assets/webp/corrupted-artifact.webp";
            minTokens = 90;
            maxTokens = 115;
        }
    ];

    public func getChestMetadata(uuid: Nat, chestTypeIndex: Nat): TypesICRC7.Metadata {
        // Get chest type (defaulting to Cosmic Cache if index is out of bounds)
        let chestType = if (chestTypeIndex >= 1 and chestTypeIndex <= chestTypes.size()) {
            chestTypes[chestTypeIndex - 1];
        } else {
            chestTypes[0]; // Default to Cosmic Cache
        };

        // Define the general metadata using the chest type properties
        let generalMetadata: TypesICRC7.GeneralMetadata = {
            rarity = ?chestType.rarity;
            faction = ?chestType.faction;
            id = uuid;
            name = chestType.name;
            description = chestType.description;
            image = chestType.image;
        };

        // Return the complete metadata
        return {
            category = #Chest;
            general = generalMetadata;
            basic = null;
            skills = null;
            skins = null;
            soul = null;
        };
    };
};