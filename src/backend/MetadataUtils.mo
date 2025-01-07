import TypesICRC7 "/icrc7/types";

module MetadataUtils {

    public func getChestMetadata(uuid: Nat, rarity: Nat): TypesICRC7.Metadata {
        // Manually assign a faction based on rarity
        let faction = switch rarity {
            case (1) { #Cosmicon };
            case (2) { #Spirat };
            case (3) { #Webe };
            case (4) { #Spade };
            case (5) { #Arch };
            case (6) { #Celestial };
            case (7) { #Neutral };
            case (8) { #Cosmicon }; // Default case
            case (_) { #Cosmicon }; // Fallback case
        };

        // Define the general metadata
        let generalMetadata: TypesICRC7.GeneralMetadata = {
            rarity = ?rarity;
            faction = ?faction;
            id = uuid;
            name = switch rarity {
                case (1) { "Cosmic Cache" };
                case (2) { "Stellar Box" };
                case (3) { "Nebula Cube" };
                case (4) { "Galactic Crate" };
                case (5) { "Astral Vault" };
                case (6) { "Celestial Locker" };
                case (7) { "Quantum Chest" };
                case (8) { "Ethereal Metacube" };
                case (_) { "Cosmic Cache" }; // Default case
            };
            description = switch rarity {
                case (1) { "A simple box containing basic tokens and resources to kickstart your cosmic journey. Contains between 10 and 20 tokens." };
                case (2) { "A box filled with uncommon tokens and stellar materials for the aspiring explorer. Contains between 21 and 33 tokens." };
                case (3) { "A rare cube holding valuable tokens and rare nebula artifacts. Contains between 33 and 47 tokens." };
                case (4) { "An epic crate brimming with galactic tokens and advanced cosmic treasures. Contains between 49 and 65 tokens." };
                case (5) { "A legendary vault containing exclusive tokens and rare astral relics. Contains between 69 and 87 tokens." };
                case (6) { "A mythical locker filled with celestial tokens and powerful cosmic items. Contains between 93 and 113 tokens." };
                case (7) { "An exotic chest holding quantum tokens and exceptionally rare cosmic wonders. Contains between 121 and 143 tokens." };
                case (8) { "A divine metacube containing ethereal tokens and the most coveted cosmic treasures. Contains between 153 and 177 tokens." };
                case (_) { "A simple box containing basic tokens and resources to kickstart your cosmic journey. Contains between 10 and 20 tokens." }; // Default case
            };
            image = switch rarity {
                case (1) { "url_to_cosmic_cache_image" };
                case (2) { "url_to_stellar_box_image" };
                case (3) { "url_to_nebula_cube_image" };
                case (4) { "url_to_galactic_crate_image" };
                case (5) { "url_to_astral_vault_image" };
                case (6) { "url_to_celestial_locker_image" };
                case (7) { "url_to_quantum_chest_image" };
                case (8) { "url_to_ethereal_metacube_image" };
                case (_) { "url_to_cosmic_cache_image" }; // Default case
            };
        };

        // Return the complete metadata
        return {
            category = #Chest; // This is the correct category type for a chest
            general = generalMetadata;
            basic = null;
            skills = null;
            skins = null;
            soul = null;
        };
    };


}
