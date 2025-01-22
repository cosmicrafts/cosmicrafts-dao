use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{update, query};
use ic_cdk::api::time;
use ic_cdk::api::management_canister::main::raw_rand;
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk_timers::{TimerId, set_timer_interval};
use rstar::{RTree, RTreeObject, AABB, PointDistance};
use serde_json::json;


fn generate_star_cluster(
    cluster_type: &StarClusterType,
    cluster_coords: (f64, f64),
) -> Result<Vec<Principal>, String> {
    // Determine the number of stars
    let star_count = match cluster_type {
        StarClusterType::Asterism { min_stars, max_stars, .. }
        | StarClusterType::StellarAssociation { min_stars, max_stars, .. }
        | StarClusterType::CompactOpenCluster { min_stars, max_stars, .. }
        | StarClusterType::OpenCluster { min_stars, max_stars, .. }
        | StarClusterType::EmbeddedCluster { min_stars, max_stars, .. }
        | StarClusterType::SuperStarCluster { min_stars, max_stars, .. }
        | StarClusterType::YoungMassiveCluster { min_stars, max_stars, .. }
        | StarClusterType::GlobularCluster { min_stars, max_stars, .. }
        | StarClusterType::StellarComplex { min_stars, max_stars, .. }
        | StarClusterType::GalacticNucleus { min_stars, max_stars, .. } => {
            generate_random_in_range_f64(*min_stars as f64, *max_stars as f64).round() as usize
        }
        _ => 0, // Hypothetical cases do not generate stars
    };

    // Get star types for the cluster
    let star_types = match cluster_type {
        StarClusterType::Asterism { star_types, .. }
        | StarClusterType::StellarAssociation { star_types, .. }
        | StarClusterType::CompactOpenCluster { star_types, .. }
        | StarClusterType::OpenCluster { star_types, .. }
        | StarClusterType::EmbeddedCluster { star_types, .. }
        | StarClusterType::SuperStarCluster { star_types, .. }
        | StarClusterType::YoungMassiveCluster { star_types, .. }
        | StarClusterType::GlobularCluster { star_types, .. }
        | StarClusterType::GalacticNucleus { star_types, .. } => star_types,
        _ => &vec![],
    };

    let mut stars = Vec::new();
    for _ in 0..star_count {
        let radius = generate_random_in_range_f64(0.0, 10.0); // Scatter stars within 10 units
        let angle = generate_random_in_range_f64(0.0, 2.0 * std::f64::consts::PI);
        let star_coords = (
            cluster_coords.0 + radius * angle.cos(),
            cluster_coords.1 + radius * angle.sin(),
        );

        // Choose a random star type using time-based randomness
        let star_type = if !star_types.is_empty() {
            let current_time_nanos = ic_cdk::api::time() as u64;
            let index = (current_time_nanos % star_types.len() as u64) as usize;
            star_types[index].clone()
        } else {
            "Unknown".to_string()
        };
        
        let metadata = serde_json::json!({
            "type": "Star",
            "spectral_class": star_type,
            "coords": { "x": star_coords.0, "y": star_coords.1 },
            "luminosity": generate_random_in_range_f64(0.1, 10.0), // Example range
            "temperature": generate_random_in_range_f64(3000.0, 30000.0), // Example range in Kelvin
        })
        .to_string();

        if let Ok(star_id) = add_entity(
            EntityType::Star,
            LocationParams::Proximity {
                center: [star_coords.0, star_coords.1],
                max_distance: 0.0,
            },
            Some(metadata),
            None,
        ) {
            stars.push(star_id);
        }
    }
    Ok(stars)
}


//New 

    #[update]
    fn add_entity(
        entity_type: EntityType,
        location_params: LocationParams,
        metadata: Option<String>,
        star_cluster_type: Option<StarClusterType>,
    ) -> Result<Principal, String> {
        let caller = ic_cdk::caller();

        if entity_type == EntityType::StarCluster && star_cluster_type.is_none() {
            return Err("StarCluster requires a valid StarClusterType".to_string());
        }

        let unique_id = ENTITY_COUNTER.with(|counter| {
            let mut counter = counter.borrow_mut();
            *counter += 1;
            *counter
        });

        let unique_principal = Principal::self_authenticating(&unique_id.to_be_bytes());

        let coords = match location_params {
            LocationParams::Ring { inner_radius, outer_radius } => {
                let radius = generate_random_in_range_f64(inner_radius, outer_radius);
                let angle = generate_random_in_range_f64(0.0, 2.0 * std::f64::consts::PI);
                (radius * angle.cos(), radius * angle.sin())
            }
            _ => return Err("Unsupported location type".to_string()),
        };

        if let Some(cluster_type) = &star_cluster_type {
            if entity_type == EntityType::StarCluster {
                let stars = generate_star_cluster(cluster_type, coords)?;
                ic_cdk::println!(
                    "Generated {} stars for cluster {:?}",
                    stars.len(),
                    cluster_type
                );
            }
        }

        let entity = Entity {
            id: unique_principal,
            owner_id: caller,
            entity_type,
            coords: [coords.0, coords.1],
            metadata: metadata.unwrap_or_default(),
        };

        GALAXY_TREE.with(|tree| {
            tree.borrow_mut().insert(entity);
        });

        Ok(unique_principal)
    }


    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    struct Entity {
        id: Principal,
        owner_id: Principal,
        entity_type: EntityType,
        coords: [f64; 2],
        metadata: String, // JSON
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    enum EntityType {
        StarCluster,
        PlanetarySystem,
        Star,
        Planet,
        AsteroidBelt,
        Moon,
        Nebulae, // Areas with unique resources or visual effects.
        BlackHole, // High-risk, high-reward areas.
        AncientRuins, //  Provide lore, unique technologies, or resources.
        Artifacts,
        Fleet,
        Unit,
        Building,
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    enum LocationParams {
        Ring { inner_radius: f64, outer_radius: f64 },
        Proximity { center: [f64; 2], max_distance: f64 },
        Random { x_range: [f64; 2], y_range: [f64; 2] },
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    enum StarClusterType {
        // Small Clusters
        Asterism {
            min_stars: usize, // Minimum number of stars, typically < 10
            max_stars: usize, // Maximum number of stars, typically < 10
            star_types: Vec<String>, // Example: ["G", "K", "M"]
            phenomena: Vec<String>, // Example: ["Nebula", "Black Hole"]
        },
        StellarAssociation {
            min_stars: usize, // Minimum number of stars, typically dozens to a few hundred
            max_stars: usize, // Maximum number of stars, typically dozens to a few hundred
            star_types: Vec<String>, // Example: ["O", "B", "A"]
            subtype: AssociationType, // OB, T, or R
            phenomena: Vec<String>, // Example: ["Stellar Winds", "Protostars"]
        },
        CompactOpenCluster {
            min_stars: usize, // Minimum number of stars, typically < 200
            max_stars: usize, // Maximum number of stars, typically < 200
            star_types: Vec<String>, // Example: ["A", "F", "G"]
            phenomena: Vec<String>, // Example: ["Binary Stars", "Planetary Systems"]
        },
    
        // Medium Clusters
        OpenCluster {
            min_stars: usize, // Minimum number of stars, typically hundreds to thousands
            max_stars: usize, // Maximum number of stars, typically hundreds to thousands
            star_types: Vec<String>, // Example: ["A", "F", "G", "K"]
            phenomena: Vec<String>, // Example: ["Stellar Collisions", "Supernovae"]
        },
        EmbeddedCluster {
            min_stars: usize, // Minimum number of stars, typically hundreds to thousands
            max_stars: usize, // Maximum number of stars, typically hundreds to thousands
            star_types: Vec<String>, // Example: ["O", "B", "T Tauri"]
            embedded_in_nebula: bool, // Indicates if it's still in a molecular cloud
            phenomena: Vec<String>, // Example: ["Protostellar Disks", "Infrared Emission"]
        },
    
        // Large Clusters
        SuperStarCluster {
            min_stars: usize, // Minimum number of stars, typically 10,000+
            max_stars: usize, // Maximum number of stars, typically 10,000+
            star_types: Vec<String>, // Example: ["O", "B", "A", "F"]
            phenomena: Vec<String>, // Example: ["Starburst Activity", "Gamma-Ray Bursts"]
        },
        YoungMassiveCluster {
            min_stars: usize, // Minimum number of stars, typically 10,000+
            max_stars: usize, // Maximum number of stars, typically 10,000+
            star_types: Vec<String>, // Example: ["O", "B", "A", "F"]
            phenomena: Vec<String>, // Example: ["Massive Star Formation", "Supernova Remnants"]
        },
        GlobularCluster {
            min_stars: usize, // Minimum number of stars, typically 10,000 to millions
            max_stars: usize, // Maximum number of stars, typically 10,000 to millions
            star_types: Vec<String>, // Example: ["G", "K", "M"]
            age: f64, // Age in billions of years
            phenomena: Vec<String>, // Example: ["X-Ray Sources", "Blue Stragglers"]
        },
    
        // Larger Structures
        StellarComplex {
            min_stars: usize, // Minimum number of stars (can span multiple clusters)
            max_stars: usize, // Maximum number of stars (can span multiple clusters)
            regions: Vec<StarClusterType>, // Nested smaller clusters
            phenomena: Vec<String>, // Example: ["Star Formation Regions", "Superbubbles"]
        },
        GalacticNucleus {
            min_stars: usize, // Minimum number of stars, millions to billions
            max_stars: usize, // Maximum number of stars, millions to billions
            star_types: Vec<String>, // Example: ["O", "B", "A", "F"]
            has_supermassive_black_hole: bool, // True if a black hole exists at the center
            phenomena: Vec<String>, // Example: ["Active Galactic Nucleus", "Relativistic Jets"]
        },
    
        // Hypothetical Cases
        QuasiStar {
            mass: f64, // In solar masses
            description: String, // Details about its hypothetical properties
            phenomena: Vec<String>, // Example: ["Primordial Black Hole", "Super-Eddington Luminosity"]
        },
        DarkMatterStar {
            mass: f64, // In solar masses
            description: String, // Details about its hypothetical properties
            phenomena: Vec<String>, // Example: ["Dark Matter Annihilation", "Neutrino Emission"]
        },
    }

    #[derive(CandidType, Deserialize, Debug, Clone, PartialEq)]
    enum AssociationType {
        OB, // Contains O and B-type stars
        T,  // Contains T Tauri stars
        R,  // Associated with reflection nebulae
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    enum StarType {
        // Star Formation & Early Stages
        GiantMolecularCloud, // Vast, cold, dense clouds of gas and dust, star birthplaces
        BokGlobule,          // Small, dark clouds of gas and dust, precursors to protostars
        Protostar,           // Young stars still accumulating mass, no nuclear fusion yet
        TTauri,              // Low-mass pre-main sequence stars with strong stellar winds
        HerbigAeBe,          // Intermediate-mass pre-main sequence stars with disks
    
        // Main Sequence Stars
        O, // Blue, very hot, massive stars with short lifespans
        B, // Blue-white stars, hot and luminous
        A, // White stars, hotter and more massive than the Sun
        F, // Yellow-white stars, intermediate temperature
        G, // Yellow stars like the Sun, stable hydrogen fusion
        K, // Orange stars, cooler and less massive than the Sun
        M, // Red dwarfs, small, cool, and very long-lived
    
        // Evolved Stars
        Subgiant,            // Transitioning from main sequence to red giant
        RedGiant,            // Large, cooler stars in late life stages
        HorizontalBranch,    // Stars fusing helium in their cores after the red giant phase
        AsymptoticGiant,     // Late-stage stars with helium and hydrogen burning shells
        WolfRayet,           // Hot, massive stars losing outer hydrogen layers
        LuminousBlueVariable, // Unstable massive stars with episodic mass loss
    
        // Stellar Remnants
        WhiteDwarf,          // Dense remnants of low- to intermediate-mass stars
        BlackDwarf,          // Hypothetical, completely cooled white dwarfs
        NeutronStar,         // Extremely dense remnants of massive stars
        Pulsar,              // Rotating neutron stars emitting electromagnetic beams
        Magnetar,            // Neutron stars with extremely powerful magnetic fields
        StellarMassBlackHole, // Formed from the collapse of very massive stars
    
        // Other Objects
        BrownDwarf,          // "Failed stars," insufficient mass for hydrogen fusion
        QuarkStar,           // Hypothetical compact stars made of quark matter
        PreonStar,           // Hypothetical stars made of subcomponents of quarks
        BosonStar,           // Hypothetical stars made of bosonic particles
    }
    
    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    enum Phenomenon {
        // Stellar Formation Phenomena
        Nebula,              // Glowing clouds of gas and dust
        ProtostellarDisk,    // Disk of material around a forming star
        StellarWinds,        // Flows of gas ejected by stars
        StarburstActivity,   // Regions of intense star formation
    
        // Explosive Events
        Supernova,           // Explosive death of a massive star
        Hypernova,           // Extremely energetic supernovae
        Kilonova,            // Merger of neutron stars or neutron star-black hole systems
        Nova,                // Thermonuclear explosions on white dwarf surfaces
        GammaRayBurst,       // The most energetic electromagnetic events in the universe
    
        // Supernova Remnants
        SupernovaRemnant,    // Expanding gas and dust clouds after a supernova
        PulsarWindNebula,    // Nebula powered by pulsar winds
    
        // Compact Object Phenomena
        XRayBinary,          // Compact object accreting matter from a companion star
        Microquasar,         // Black holes or neutron stars with relativistic jets
        CataclysmicVariable, // Binary systems with recurring outbursts
    
        // High-Energy Phenomena
        RelativisticJets,    // High-energy particle jets from compact objects
        GammaRayEmission,    // Intense gamma-ray emission
        XRayEmission,        // High-energy X-ray radiation
        InfraredEmission,    // Infrared radiation from star-forming regions
    
        // Stellar Instabilities
        StellarCollisions,   // Collisions between stars
        MassLoss,            // Ejection of material from stars
        ThermalPulses,       // Episodic energy surges in evolved stars
    
        // Exotic Phenomena
        BlueStragglers,      // Stars that appear younger and hotter in clusters
        XRaySources,         // Compact objects emitting X-rays
        InfraredSources,     // Bright objects in infrared wavelengths
        GammaRaySources,     // Sources of gamma-ray emission
        DarkMatterAnnihilation, // Hypothetical emission from dark matter interactions
    
        // Gravitational Events
        GravitationalWaves,  // Ripples in spacetime from massive object mergers
        BlackHoleAccretionDisk, // Bright, energetic disk around black holes
    
        // Accretion Phenomena
        AccretionDisk,       // Disk of material falling into compact objects
        PolarJets,           // Jets of material ejected along magnetic poles
    
        // Unique Stellar Phenomena
        MagnetarFlares,      // Energetic bursts from magnetars
        StellarFlares,       // Sudden brightness increases in stars
        CoronalMassEjections, // Large plasma ejections from stellar coronae
    
        // Cosmological Phenomena
        DarkMatterHalo,      // Hypothetical halo of dark matter around galaxies
        CosmicJets,          // Large-scale particle jets in the universe
    }  

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    struct Star {
        id: Principal,                // Unique ID for the star
        star_type: StarType,          // Enum for the type of star
        coords: [f64; 2],             // Coordinates within the cluster
        temperature: f64,             // Star surface temperature (Kelvin)
        luminosity: f64,              // Relative to the Sun (1.0 = Sun's luminosity)
        mass: f64,                    // Relative to the Sun (1.0 = Sun's mass)
        radius: f64,                  // Relative to the Sun (1.0 = Sun's radius)
        age: f64,                     // Age of the star in billions of years
        parent_cluster_id: Principal, // ID of the parent star cluster
        metallicity: f64,             // Fraction of the star's mass made up of elements heavier than helium
        rotation_speed: f64,          // Surface rotation speed (km/s)
        phenomena: Vec<Phenomenon>,   // Associated phenomena (from the Phenomenon enum)
        is_binary: bool,              // Whether the star is part of a binary system
        companion_star_id: Option<Principal>, // ID of the companion star if it's part of a binary system
        spectral_class: String,       // Detailed spectral classification (e.g., "G2V")
        life_stage: String,           // Life stage description (e.g., "Main Sequence", "Red Giant")
        hp: u64,                    // Hitpoints (required)
        shield: Option<u64>,        // Optional shield for defense
        can_move: Option<bool>,     // Optional flag for movement capability
        can_attack: Option<bool>,   // Optional flag for attack capability
    }
    

    // #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    // struct Zone {
    //     id: u32,
    //     name: String,
    //     inner_radius: f64, // In light-years
    //     outer_radius: f64, // In light-years
    // }

    // fn define_zones() -> Vec<Zone> {
    //     vec![
    //         Zone {
    //             id: 0,
    //             name: "Galactic Core".to_string(),
    //             inner_radius: 0.0,
    //             outer_radius: 100.0
    //         },
    //         Zone {
    //             id: 1,
    //             name: "First Spiral Arm".to_string(),
    //             inner_radius: 100.0,
    //             outer_radius: 101.0
    //         },
    //         Zone {
    //             id: 2,
    //             name: "Local Bubble".to_string(),
    //             inner_radius: 101.0,
    //             outer_radius: 102.0
    //         },
    //     ]
    // }

    impl RTreeObject for Entity {
        type Envelope = AABB<[f64; 2]>;

        fn envelope(&self) -> Self::Envelope {
            AABB::from_point(self.coords)
        }
    }

    impl PointDistance for Entity {
        fn distance_2(&self, point: &[f64; 2]) -> f64 {
            let dx = self.coords[0] - point[0];
            let dy = self.coords[1] - point[1];
            dx * dx + dy * dy
        }
    }
   
    
    #[update]
    fn remove_entity(id: Principal) -> Result<(), String> {
        GALAXY_TREE.with(|tree| {
            let mut tree = tree.borrow_mut();

            // Find the entity to remove
            let entity_to_remove = tree.iter().find(|e| e.id == id).cloned();

            if let Some(entity) = entity_to_remove {
                tree.remove(&entity); // Remove entity
                Ok(())
            } else {
                Err("Entity not found.".to_string())
            }
        })
    }

    #[update]
    fn update_entity(
        id: Principal,
        new_coords: (f64, f64),
        new_metadata: Option<String>,
    ) -> Result<(), String> {
        GALAXY_TREE.with(|tree| {
            // Clone the entity (if found) to end the immutable borrow early
            let entity_to_update = tree.borrow().iter().find(|e| e.id == id).cloned();

            if let Some(entity) = entity_to_update {
                let mut tree_mut = tree.borrow_mut();
                tree_mut.remove(&entity);

                let updated_entity = Entity {
                    id,
                    owner_id: entity.owner_id, // Preserve the current owner
                    entity_type: entity.entity_type,
                    coords: [new_coords.0, new_coords.1],
                    metadata: new_metadata.unwrap_or(entity.metadata),
                };

                tree_mut.insert(updated_entity);
                Ok(())
            } else {
                Err("Entity not found.".to_string())
            }
        })
    }

    #[update]
    fn transfer_entity(entity_id: Principal, new_owner: Principal) -> Result<(), String> {
        GALAXY_TREE.with(|tree| {
            let mut tree_mut = tree.borrow_mut();
            let entity_to_transfer = tree_mut.iter().find(|e| e.id == entity_id).cloned();
    
            if let Some(mut entity) = entity_to_transfer {
                // Update ownership
                entity.owner_id = new_owner;
    
                // Remove the old entity and insert the updated one
                tree_mut.remove(&entity);
                tree_mut.insert(entity);
    
                Ok(())
            } else {
                Err("Entity not found.".to_string())
            }
        })
    }

    //Queries
    #[query]
    fn find_nearby_entities(x: f64, y: f64, radius: f64) -> Vec<Entity> {
        GALAXY_TREE.with(|tree| {
            tree.borrow()
                .locate_within_distance([x, y], radius.powi(2))
                .cloned()
                .collect()
        })
    }

    #[query]
    fn find_entities_in_area(lower: (f64, f64), upper: (f64, f64)) -> Vec<Entity> {
        GALAXY_TREE.with(|tree| {
            tree.borrow()
                .locate_in_envelope_intersecting(&AABB::from_corners([lower.0, lower.1], [upper.0, upper.1]))
                .cloned()
                .collect()
        })
    }

    #[query]
    fn export_entities() -> Vec<(f64, f64, String)> {
        GALAXY_TREE.with(|tree| {
            tree.borrow()
                .iter()
                .map(|entity| {
                    ic_cdk::println!(
                        "Entity ID: {}, Type: {:?}, Metadata: {}",
                        entity.id,
                        entity.entity_type,
                        entity.metadata
                    );
                    (entity.coords[0], entity.coords[1], entity.metadata.clone())
                })
                .collect()
        })
    }

    #[query]
    fn validate_entity_distances(parent_id: Principal, max_distance: f64) -> Result<bool, String> {
        let parent_entity = get_entity_by_id(parent_id).ok_or("Parent entity not found")?;
        let nearby_entities = find_nearby_entities(parent_entity.coords[0], parent_entity.coords[1], max_distance);

        for entity in nearby_entities {
            let distance = ((parent_entity.coords[0] - entity.coords[0]).powi(2)
                + (parent_entity.coords[1] - entity.coords[1]).powi(2))
            .sqrt();
            if distance > max_distance {
                return Err(format!(
                    "Entity {} exceeds max distance of {} from parent {}",
                    entity.id, max_distance, parent_id
                ));
            }
        }

        Ok(true)
    }
    
    #[query]
    fn get_entity_by_id(entity_id: Principal) -> Option<Entity> {
        GALAXY_TREE.with(|tree| {
            tree.borrow().iter().find(|e| e.id == entity_id).cloned()
        })
    }

        
    // Helpers
    fn map_to_range(random_value: u64, min: f64, max: f64) -> f64 {
        let fraction = (random_value as f64) / (u64::MAX as f64); // Normalize to [0, 1]
        min + fraction * (max - min) // Scale to [min, max]
    }

    fn validate_metadata(metadata: &str) -> Result<(), String> {
        serde_json::from_str::<serde_json::Value>(metadata)
            .map_err(|e| format!("Invalid metadata: {}", e))?;
        Ok(())
    }

    async fn random_orbit(parent_coords: (f64, f64), min_radius: f64, max_radius: f64) -> Result<(f64, f64), String> {
        let random_bytes = match raw_rand().await {
            Ok((bytes,)) => bytes,
            Err(_) => return Err("Failed to fetch randomness.".to_string()),
        };
    
        let radius_rand = u64::from_le_bytes(random_bytes[0..8].try_into().unwrap());
        let angle_rand = u64::from_le_bytes(random_bytes[8..16].try_into().unwrap());
    
        // Scale to light-years
        let radius = map_to_range(radius_rand, min_radius, max_radius);
        let angle = map_to_range(angle_rand, 0.0, 2.0 * std::f64::consts::PI);
    
        Ok((
            parent_coords.0 + radius * angle.cos(),
            parent_coords.1 + radius * angle.sin(),
        ))
    }

    fn random_star_type() -> String {
        // Spectral types and classes
        let spectral_types = vec!["O", "B", "A", "F", "G", "K", "M"];
        let stellar_classes = vec!["Main Sequence", "Giant", "Supergiant"];

        // Randomly select spectral type and subclass
        let spectral_index = generate_random_in_range(0, (spectral_types.len() - 1) as u64) as usize;
        let subclass = generate_random_in_range(0, 9); // Subclass (e.g., G2)
        let spectral_type = format!("{}{}", spectral_types[spectral_index], subclass);

        // Randomly select stellar class
        let class_index = generate_random_in_range(0, (stellar_classes.len() - 1) as u64) as usize;
        let stellar_class = stellar_classes[class_index].to_string();

        // Combine type and class
        format!("{} {}", spectral_type, stellar_class)
    }

    fn random_planet_type() -> (String, String, String) {
        // Categories and subcategories
        let categories = vec![
            "Terrestrial", "Gas Giant", "Ice World", "Desert", "Ocean World",
            "Lava World", "Dwarf Planet", "Super-Earth", "Carbon Planet",
            "Iron Planet", "Chthonian Planet", "Rogue",
        ];
        let subcategories = vec![
            vec!["Rocky", "Volcanic", "Metallic"],
            vec!["Jovian", "Neptunian"],
            vec!["Frozen", "Cryovolcanic"],
            vec!["Arid", "Sandy"],
            vec!["Water", "Ice-Covered"],
            vec!["Molten", "Magma"],
            vec!["Rocky", "Icy"],
            vec!["Rocky", "Oceanic"],
            vec!["Graphite", "Diamond"],
            vec!["Metallic", "Magnetic"],
            vec!["Core Remnant", "Evaporated"],
            vec!["Wandering"],
        ];

        // Randomly select a category and subcategory
        let category_index = generate_random_in_range(0, (categories.len() - 1) as u64) as usize;
        let category = categories[category_index].to_string();
        let subcategory = subcategories[category_index][generate_random_in_range(
            0,
            (subcategories[category_index].len() - 1) as u64,
        ) as usize]
            .to_string();

        // Randomly assign planet size
        let sizes = vec!["Tiny", "Small", "Medium", "Large", "Huge"];
        let size = sizes[generate_random_in_range(0, (sizes.len() - 1) as u64) as usize].to_string();

        (category, subcategory, size)
    }

    #[update]
    async fn create_planetary_system(
        star_id: Principal, // Parent star's ID
        owner_id: Principal,
    ) -> Result<(), String> {
        // Fetch the parent star's coordinates
        let star = get_entity_by_id(star_id).ok_or("Parent star not found")?;
        let star_coords = (star.coords[0], star.coords[1]);
    
        let num_planets = generate_random_in_range(1, 8); // Random number of planets
        for i in 0..num_planets {
            // Scale to light-years
            let min_orbit = 0.00001 + i as f64 * 0.00001; // Start at ~1 AU
            let max_orbit = min_orbit + 0.00001; // Range for each orbit
    
            // Generate planet coordinates
            let planet_coords = random_orbit(star_coords, min_orbit, max_orbit).await?;
    
            // Pass planet_coords to create_planet
            create_planet(star_id, owner_id, planet_coords).await?;
        }
        Ok(())
    }
    
    //Updates
    #[update]
    async fn create_star(star_coords: (f64, f64), owner_id: Principal) -> Result<(), String> {
        let star_type = random_star_type();
        let star_id = generate_principal();
    
        let metadata = json!({
            "id": star_id.to_text(),
            "type": "Star",
            "coords": { "x": star_coords.0, "y": star_coords.1 },
            "category": "Stellar Object",
            "subcategory": star_type,
            "owner": owner_id.to_text(),
            "timestamp": time()
        }).to_string();
    
        let star = Entity {
            id: star_id,
            owner_id,
            entity_type: EntityType::Star,
            coords: [star_coords.0, star_coords.1],
            metadata,
        };
    
        GALAXY_TREE.with(|tree| tree.borrow_mut().insert(star));
    
        // Call create_planetary_system with the updated signature
        create_planetary_system(star_id, owner_id).await?;
        Ok(())
    }
    
    #[update]
    async fn create_planet(
        star_id: Principal,          // Parent star's ID
        owner_id: Principal,         // Owner ID
        planet_coords: (f64, f64),   // Planet's coordinates
    ) -> Result<(), String> {
        // Generate planet metadata
        let (category, subcategory, size) = random_planet_type();
        let planet_id = generate_principal();
    
        let metadata = json!({
            "id": planet_id.to_text(),
            "type": "Planet",
            "coords": { "x": planet_coords.0, "y": planet_coords.1 },
            "category": category,
            "subcategory": subcategory,
            "size": size,
            "parent": star_id.to_text(),
            "owner": owner_id.to_text(),
            "timestamp": time()
        }).to_string();
    
        // Create the planet entity
        let planet = Entity {
            id: planet_id,
            owner_id,
            entity_type: EntityType::Planet,
            coords: [planet_coords.0, planet_coords.1],
            metadata,
        };
    
        // Insert the planet into the galaxy tree
        GALAXY_TREE.with(|tree| tree.borrow_mut().insert(planet));
    
        // Create moons
        let num_moons = generate_random_in_range(0, 3);
        for _ in 0..num_moons {
            create_moon(planet_id, owner_id).await?; // Pass planet_id to create_moon
        }
    
        Ok(())
    }

    #[update]
    async fn create_moon(
        planet_id: Principal, // Parent planet's ID
        owner_id: Principal,
    ) -> Result<(), String> {
        // Fetch the parent planet's coordinates
        let planet = get_entity_by_id(planet_id).ok_or("Parent planet not found")?;
        let planet_coords = (planet.coords[0], planet.coords[1]);
    
        // Generate moon coordinates in orbit around the planet
        let moon_coords = random_orbit(planet_coords, 0.00000004, 0.00000005).await?;
    
        // Generate a unique ID for the moon
        let moon_id = generate_principal();
    
        // Create structured metadata
        let metadata = json!({
            "id": moon_id.to_text(),
            "type": "Moon",
            "coords": { "x": moon_coords.0, "y": moon_coords.1 },
            "category": "Natural Satellite",
            "subcategory": "Moon",
            "size": "Small",
            "parent": planet_id.to_text(),
            "owner": owner_id.to_text(),
            "timestamp": time()
        }).to_string();
    
        // Validate metadata
        validate_metadata(&metadata)?;
    
        // Create the moon entity
        let moon = Entity {
            id: moon_id,
            owner_id,
            entity_type: EntityType::Moon,
            coords: [moon_coords.0, moon_coords.1],
            metadata,
        };
    
        // Insert the moon into the galaxy tree
        GALAXY_TREE.with(|tree| tree.borrow_mut().insert(moon));
    
        Ok(())
    }

    #[update]
    async fn create_asteroid_belt(
        star_id: Principal, // Parent star's ID
        owner_id: Principal,
    ) -> Result<(), String> {
        // Fetch the parent star's coordinates
        let star = get_entity_by_id(star_id).ok_or("Parent star not found")?;
        let star_coords = (star.coords[0], star.coords[1]);
    
        // Generate asteroid belt coordinates
        let belt_coords = random_orbit(star_coords, 0.0002, 0.0003).await?;
    
        // Create metadata
        let belt_id = generate_principal();
        let metadata = json!({
            "id": belt_id.to_text(),
            "type": "Asteroid Belt",
            "coords": { "x": belt_coords.0, "y": belt_coords.1 },
            "category": "Planetary Ring",
            "subcategory": "Asteroid Belt",
            "size": "Large",
            "parent": star_id.to_text(),
            "owner": owner_id.to_text(),
            "timestamp": time()
        }).to_string();
    
        // Create the asteroid belt entity
        let belt = Entity {
            id: belt_id,
            owner_id,
            entity_type: EntityType::AsteroidBelt,
            coords: [belt_coords.0, belt_coords.1],
            metadata,
        };
    
        // Insert into the galaxy tree
        GALAXY_TREE.with(|tree| tree.borrow_mut().insert(belt));
    
        Ok(())
    }

    

    #[update]
    async fn create_black_hole(coords: (f64, f64), owner_id: Principal) -> Result<(), String> {
        let black_hole_id = generate_principal();
    
        let metadata = json!({
            "id": black_hole_id.to_text(),
            "type": "Black Hole",
            "coords": { "x": coords.0, "y": coords.1 },
            "category": "Stellar Phenomenon",
            "subcategory": "Black Hole",
            "owner": owner_id.to_text(),
            "timestamp": time()
        }).to_string();
    
        let black_hole = Entity {
            id: black_hole_id,
            owner_id,
            entity_type: EntityType::BlackHole,
            coords: [coords.0, coords.1],
            metadata,
        };
    
        GALAXY_TREE.with(|tree| tree.borrow_mut().insert(black_hole));
        Ok(())
    }

    #[update]
    async fn create_nebula(coords: (f64, f64), owner_id: Principal) -> Result<(), String> {
        let nebula_id = generate_principal();

        let metadata = json!({
            "id": nebula_id.to_text(),
            "type": "Nebula",
            "coords": { "x": coords.0, "y": coords.1 },
            "category": "Stellar Phenomenon",
            "subcategory": "Nebula",
            "owner": owner_id.to_text(),
            "timestamp": time()
        }).to_string();

        let nebula = Entity {
            id: nebula_id,
            owner_id,
            entity_type: EntityType::Nebulae,
            coords: [coords.0, coords.1],
            metadata,
        };

        GALAXY_TREE.with(|tree| tree.borrow_mut().insert(nebula));
        Ok(())
    }

    #[update]
    fn benchmark_spawn(count: u64) -> u64 {
        let start = ic_cdk::api::performance_counter(0);

        GALAXY_TREE.with(|tree| {
            let mut tree_mut = tree.borrow_mut();
            for i in 0..count {
                let unique_id = ENTITY_COUNTER.with(|counter| {
                    let mut counter = counter.borrow_mut();
                    *counter += 1;
                    *counter
                });

                let unique_principal = Principal::self_authenticating(&unique_id.to_be_bytes());

                let entity = Entity {
                    id: unique_principal,
                    owner_id: ic_cdk::caller(),
                    entity_type: EntityType::Planet,
                    coords: [i as f64 * 10.0, i as f64 * 5.0],
                    metadata: format!("Entity {}", i),
                };

                tree_mut.insert(entity);
            }
        });

        let end = ic_cdk::api::performance_counter(0);
        end - start // Return the instructions used
    }

    #[update]
    async fn spawn_entities_auto_batched_backup(total: u64) -> Result<u64, String> {
        let max_batch_size = 50; // Maximum entities per batch
        let safe_zone_inner_radius = 1000.0; // Inner radius of the Safe Zone
        let safe_zone_outer_radius = 1010.0; // Outer radius of the Safe Zone
        let mut created = 0; // Counter for created entities
    
        while created < total {
            let batch_size = std::cmp::min(max_batch_size, total - created);
    
            GALAXY_TREE.with(|tree| {
                let mut tree_mut = tree.borrow_mut();
    
                for _ in 0..batch_size {
                    // Generate random radius and angle using the utility functions
                    let radius = generate_random_in_range_f64(safe_zone_inner_radius, safe_zone_outer_radius);
                    let angle = generate_random_in_range_f64(0.0, 2.0 * std::f64::consts::PI);
    
                    // Convert polar coordinates to Cartesian (x, y)
                    let x = radius * angle.cos();
                    let y = radius * angle.sin();
    
                    // Generate a unique entity ID
                    let unique_id = ENTITY_COUNTER.with(|counter| {
                        let mut counter = counter.borrow_mut();
                        *counter += 1;
                        *counter
                    });
    
                    let unique_principal = Principal::self_authenticating(&unique_id.to_be_bytes());
    
                    // Create the entity
                    let entity = Entity {
                        id: unique_principal,
                        owner_id: ic_cdk::caller(),
                        entity_type: EntityType::Planet,
                        coords: [x, y],
                        metadata: format!("Entity {}", created),
                    };
    
                    tree_mut.insert(entity);
                    created += 1;
                }
            });
        }
    
        Ok(created)
    }

    #[update]
    async fn spawn_entity(total: u64) -> Result<u64, String> {
        let max_batch_size = 50; // Maximum entities per batch
        let safe_zone_inner_radius = 1000.0; // Inner radius of the Safe Zone
        let safe_zone_outer_radius = 1010.0; // Outer radius of the Safe Zone
        let mut created = 0; // Counter for created entities

        while created < total {
            let batch_size = std::cmp::min(max_batch_size, total - created);

            GALAXY_TREE.with(|tree| {
                let mut tree_mut = tree.borrow_mut();

                for _ in 0..batch_size {
                    // Generate random radius and angle using the utility functions
                    let radius = generate_random_in_range_f64(safe_zone_inner_radius, safe_zone_outer_radius);
                    let angle = generate_random_in_range_f64(0.0, 2.0 * std::f64::consts::PI);

                    // Convert polar coordinates to Cartesian (x, y)
                    let x = radius * angle.cos();
                    let y = radius * angle.sin();

                    // Generate a unique entity ID
                    let unique_id = ENTITY_COUNTER.with(|counter| {
                        let mut counter = counter.borrow_mut();
                        *counter += 1;
                        *counter
                    });

                    let unique_principal = Principal::self_authenticating(&unique_id.to_be_bytes());

                    // Create metadata for the entity
                    let metadata = json!({
                        "id": unique_principal.to_text(),
                        "type": "Planet",
                        "coords": { "x": x, "y": y },
                        "category": "Celestial Object",
                        "subcategory": "Planet",
                        "size": "Standard",
                        "parent": "Safe Zone",
                        "owner": ic_cdk::caller().to_text(),
                        "timestamp": time()
                    }).to_string();

                    // Create the entity
                    let entity = Entity {
                        id: unique_principal,
                        owner_id: ic_cdk::caller(),
                        entity_type: EntityType::Planet,
                        coords: [x, y],
                        metadata: metadata.clone(),
                    };

                    // Print metadata for debugging
                    ic_cdk::println!("Entity created: {}", metadata);

                    // Insert the entity into the tree
                    tree_mut.insert(entity);
                    created += 1;
                }
            });
        }

        Ok(created)
    }

//--
// --- Player Management ---

    #[query]
    fn get_player() -> Option<Player> {
        let caller = ic_cdk::caller();
        PLAYERS.with(|players| players.borrow().get(&caller).cloned())
    }

    #[update]
    async fn signup(
        username: String,
        avatar: u32,
        referral_code: Option<String>,
        language: String,
    ) -> Result<(bool, Option<Player>, String), String> {
        let caller = ic_cdk::caller();
    
        // Reject anonymous calls
        if caller == Principal::anonymous() {
            return Err("Anonymous users cannot register.".to_string());
        }
    
        // Check if the username is valid
        if username.len() > 12 {
            return Err("Username must be 12 characters or less".to_string());
        }
    
        // Check if the player is already registered
        if PLAYERS.with(|players| players.borrow().contains_key(&caller)) {
            let existing_player = PLAYERS.with(|players| players.borrow().get(&caller).cloned());
            return Ok((false, existing_player, "User is already registered.".to_string()));
        }
    
        // Handle referral code scenarios
        let final_code = match referral_code {
            Some(code) => {
                // Simulate referral code assignment logic
                match assign_unassigned_referral_code(caller, code).await {
                    ReferralCodeResult::Ok(assigned_code) => assigned_code,
                    ReferralCodeResult::Err(err_msg) => return Err(err_msg),
                }
            }
            None => {
                // Generate a new referral code
                let (new_code, _) = assign_referral_code(caller, None).await;
                new_code
            }
        };
    
        // Create a StarCluster of type Asterism in ring mode
        add_entity(
            EntityType::StarCluster,
            LocationParams::Ring {
                inner_radius: 1000.0,
                outer_radius: 1100.0,
            },
            None, // No additional metadata
            Some(StarClusterType::Asterism {
                min_stars: 5, // Minimum number of stars
                max_stars: 10, // Maximum number of stars
                star_types: vec!["G".to_string(), "K".to_string(), "M".to_string()], // Example star types
                phenomena: vec!["Nebula".to_string(), "Black Hole".to_string()], // Example phenomena
            }),
        )
        .map_err(|e| format!("Failed to create StarCluster: {}", e))?;
    
        // Register the player
        let new_player = Player {
            id: caller,
            username,
            avatar,
            title: "Starbound Initiate".to_string(),
            description: "".to_string(),
            registration_date: time(),
            level: 1,
            elo: 1200.0,
            friends: Vec::new(),
            language,
        };
    
        PLAYERS.with(|players| {
            players.borrow_mut().insert(caller, new_player.clone());
        });
    
        // Initialize the player's multiplier
        MULTIPLIER_BY_PLAYER.with(|multiplier| {
            multiplier.borrow_mut().insert(caller, 1.0);
        });
    
        // Assign default avatars and titles
        AVAILABLE_AVATARS.with(|avatars| {
            avatars.borrow_mut().insert(caller, (1..=12).collect());
        });
    
        AVAILABLE_TITLES.with(|titles| {
            titles.borrow_mut().insert(caller, vec![1]);
        });
    
        Ok((
            true,
            Some(new_player),
            format!(
                "User registered successfully with referral code {}",
                final_code
            ),
        ))
    }
    

    // Mock functions for referral code handling
    async fn assign_unassigned_referral_code(_player_id: Principal, code: String) -> ReferralCodeResult {
        // Simulate referral code assignment logic
        ReferralCodeResult::Ok(code)
    }

    async fn assign_referral_code(_player_id: Principal, _code: Option<String>) -> (String, bool) {
        // Simulate referral code generation logic
        ("generated_code".to_string(), true)
    }


//--
// Utils
    fn generate_random_in_range(min: u64, max: u64) -> u64 {
        let current_time = ic_cdk::api::time(); // Nanoseconds since the Unix epoch
        min + (current_time as u64 % (max - min + 1))
    }

    fn generate_random_in_range_f64(min: f64, max: f64) -> f64 {
        let current_time = ic_cdk::api::time(); // Nanoseconds since the Unix epoch
        min + (current_time as f64 % (max - min + 1.0))
    }

    fn generate_principal() -> Principal {
        let unique_id = ENTITY_COUNTER.with(|counter| {
            let mut counter = counter.borrow_mut();
            *counter += 1;
            *counter
        });

        Principal::self_authenticating(&unique_id.to_be_bytes())
    }


//--
// --- R-Tree Points ---

    #[query]
    fn planets_in_area(lower: (f64, f64), upper: (f64, f64)) -> Vec<u64> {
        PLANET_TREE.with(|tree| {
            tree.borrow()
                .locate_in_envelope_intersecting(&AABB::from_corners([lower.0, lower.1], [upper.0, upper.1]))
                .map(|point| point.planet_id)
                .collect()
        })
    }
    // Locate nearby habitable planets, mining opportunities, or potential conflicts.
    #[query]
    fn nearby_planets(x: f64, y: f64, radius: f64) -> Vec<u64> {
        PLANET_TREE.with(|tree| {
            tree.borrow()
                .locate_within_distance([x, y], radius.powi(2))
                .map(|point| point.planet_id)
                .collect()
        })
    }

    #[query]
    fn nearby_buildings(x: f64, y: f64, radius: f64) -> Vec<u64> {
        BUILDING_TREE.with(|tree| {
            tree.borrow()
                .locate_within_distance([x, y], radius.powi(2))
                .map(|point| point.building_id)
                .collect()
        })
    }

    // When navigating the galaxy or placing a new object.
    #[query]
    fn nearest_star_system(x: f64, y: f64) -> Option<u64> {
        STAR_SYSTEM_TREE.with(|tree| {
            tree.borrow()
                .nearest_neighbor(&[x, y])
                .map(|point| point.system_id)
        })
    }

    // Identify fleets in proximity for combat, trade, or exploration.
    #[query]
    fn nearby_fleets(x: f64, y: f64, radius: f64) -> Vec<u64> {
        FLEET_TREE.with(|tree| {
            tree.borrow()
                .locate_within_distance([x, y], radius.powi(2))
                .map(|point| point.fleet_id)
                .collect()
        })
    }

    impl StarSystemPoint {
        fn new(system_id: u64, coords: (i64, i64)) -> Self {
            StarSystemPoint {
                system_id,
                coords: [coords.0 as f64, coords.1 as f64],
            }
        }
    }

    impl RTreeObject for StarSystemPoint {
        type Envelope = AABB<[f64; 2]>;

        fn envelope(&self) -> Self::Envelope {
            AABB::from_point(self.coords)
        }
    }

    impl PointDistance for StarSystemPoint {
        fn distance_2(&self, point: &[f64; 2]) -> f64 {
            let dx = self.coords[0] - point[0];
            let dy = self.coords[1] - point[1];
            dx * dx + dy * dy
        }
    }

    impl FleetPoint {
        fn new(fleet_id: u64, coords: (f64, f64)) -> Self {
            FleetPoint {
                fleet_id,
                coords: [coords.0, coords.1],
            }
        }
    }

    impl RTreeObject for FleetPoint {
        type Envelope = AABB<[f64; 2]>;

        fn envelope(&self) -> Self::Envelope {
            AABB::from_point(self.coords)
        }
    }

    impl PointDistance for FleetPoint {
        fn distance_2(&self, point: &[f64; 2]) -> f64 {
            let dx = self.coords[0] - point[0];
            let dy = self.coords[1] - point[1];
            dx * dx + dy * dy
        }
    }

    impl PlanetPoint {
        fn new(planet_id: u64, coords: (f64, f64)) -> Self {
            PlanetPoint {
                planet_id,
                coords: [coords.0, coords.1],
            }
        }
    }

    impl RTreeObject for PlanetPoint {
        type Envelope = AABB<[f64; 2]>;

        fn envelope(&self) -> Self::Envelope {
            AABB::from_point(self.coords)
        }
    }

    impl PointDistance for PlanetPoint {
        fn distance_2(&self, point: &[f64; 2]) -> f64 {
            let dx = self.coords[0] - point[0];
            let dy = self.coords[1] - point[1];
            dx * dx + dy * dy
        }
    }

    impl BuildingPoint {
        fn new(building_id: u64, coords: (f64, f64)) -> Self {
            BuildingPoint {
                building_id,
                coords: [coords.0, coords.1],
            }
        }
    }

    impl RTreeObject for BuildingPoint {
        type Envelope = AABB<[f64; 2]>;

        fn envelope(&self) -> Self::Envelope {
            AABB::from_point(self.coords)
        }
    }

    impl PointDistance for BuildingPoint {
        fn distance_2(&self, point: &[f64; 2]) -> f64 {
            let dx = self.coords[0] - point[0];
            let dy = self.coords[1] - point[1];
            dx * dx + dy * dy
        }
    }

// --- Data Structures ---
    
    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    struct StarSystemPoint {
        system_id: u64,
        coords: [f64; 2],
    }
    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]

    struct FleetPoint {
        fleet_id: u64,
        coords: [f64; 2],
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]

    struct PlanetPoint {
        planet_id: u64,
        coords: [f64; 2],
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    struct BuildingPoint {
        building_id: u64,
        coords: [f64; 2],
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct Player {
        id: Principal,
        username: String,
        avatar: u32, // Assuming AvatarID is a u32
        title: String,
        description: String,
        registration_date: u64, // Assuming RegistrationDate is a timestamp (u64)
        level: u32,
        elo: f64,
        friends: Vec<FriendDetails>, // Assuming FriendDetails is another struct
        language: String,
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct FriendDetails {
        id: Principal,
        username: String,
        avatar: u32
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    enum ResourceType {
        Energy,
        Matter
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct Resource {
        resource_type: ResourceType,
        amount: u64,
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct Building {
        id: u64,
        building_type: BuildingType,
        level: u64,
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    enum BuildingType {
        Mine,
        Shipyard,
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct Fleet {
        id: u64,
        owner_id: Principal,
        coordinates: (f64, f64),
        ships: Vec<Ship>,
    }

    #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
    enum ShipType {
        Scout,
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct Ship {
        id: u64,
        ship_type: ShipType,
        health: u64,
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct Planet {
        id: u64,
        name: String,
        system_id: u64,
        coordinates: (f64, f64),
        planet_category: String,
        planet_subcategory: String,
        planet_size: String,
        atmosphere: Vec<String>,
        temperature_range: (f64, f64),
        gravity: f64,
        orbital_period_days: u64,
        resources: Vec<Resource>,
        max_miner_capacity: u64,
        moons: Vec<Moon>,
        habitability: String,
        owner_id: Option<Principal>,
        buildings: Vec<Building>,
        orbiting_fleets: Vec<u64>,
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct Moon {
        id: u64,
        name: String,
        planet_id: u64, // The planet this moon orbits
        coordinates: (f64, f64), // Relative to the planet
        moon_type: String, // Rocky, Ice, Volcanic, etc.
        atmosphere: Vec<String>,
        temperature_range: (f64, f64),
        gravity: f64,
        habitability: String,
        owner_id: Option<Principal>, // If players can claim moons
        is_rogue: bool, // True if it's a rogue moon
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct AsteroidBelt {
        id: u64,
        name: String,
        // Add more properties as needed
    }

    #[derive(CandidType, Deserialize, Clone, Debug)]
    struct StarSystem {
        id: u64,
        name: String,
        stars: Vec<Star>,
        planets: Vec<Planet>,
        moons: Vec<Moon>,
        asteroid_belts: Vec<AsteroidBelt>,
        last_updated: u64,
        coordinates: (i64, i64),
    }

    #[derive(CandidType, Deserialize)]
    enum ReferralCodeResult {
        Ok(String),
        Err(String),
    }

// --- Database

    thread_local! {
        static ENTITY_COUNTER: RefCell<u64> = RefCell::new(0);
        static GALAXY_TREE: RefCell<RTree<Entity>> = RefCell::new(RTree::new());

        static PLAYERS: RefCell<HashMap<Principal, Player>> = RefCell::new(HashMap::new());
        static MULTIPLIER_BY_PLAYER: RefCell<HashMap<Principal, f64>> = RefCell::new(HashMap::new());
        static AVAILABLE_AVATARS: RefCell<HashMap<Principal, Vec<u32>>> = RefCell::new(HashMap::new());
        static AVAILABLE_TITLES: RefCell<HashMap<Principal, Vec<u32>>> = RefCell::new(HashMap::new());

        static TICK_TIMER: RefCell<Option<TimerId>> = RefCell::new(None);
        static TICK_COUNT: RefCell<u64> = RefCell::new(0);

        static NEXT_PLAYER_ID: RefCell<u64> = RefCell::new(1);
        static NEXT_BUILDING_ID: RefCell<u64> = RefCell::new(1);
        static NEXT_FLEET_ID: RefCell<u64> = RefCell::new(1);
        static NEXT_SHIP_ID: RefCell<u64> = RefCell::new(1);
        static NEXT_STAR_SYSTEM_ID: RefCell<u64> = RefCell::new(1);
        static NEXT_PLANET_ID: RefCell<u64> = RefCell::new(1);
        static NEXT_STAR_ID: RefCell<u64> = RefCell::new(1);

        static STAR_SYSTEMS: RefCell<HashMap<u64, StarSystem>> = RefCell::new(HashMap::new());
        static PLANETS: RefCell<HashMap<u64, Planet>> = RefCell::new(HashMap::new());
        static FLEETS: RefCell<HashMap<u64, Fleet>> = RefCell::new(HashMap::new());

        static STAR_SYSTEM_TREE: RefCell<RTree<StarSystemPoint>> = RefCell::new(RTree::new());
        static FLEET_TREE: RefCell<RTree<FleetPoint>> = RefCell::new(RTree::new());
        static PLANET_TREE: RefCell<RTree<PlanetPoint>> = RefCell::new(RTree::new());
        static BUILDING_TREE: RefCell<RTree<BuildingPoint>> = RefCell::new(RTree::new());
    }

// --- Initialization ---

    #[update]
    fn start_tick() {
        // Check if a timer is already running to prevent duplicates
        TICK_TIMER.with(|timer| {
        if timer.borrow().is_none() {
            let timer_id = set_timer_interval(std::time::Duration::from_secs(1), || {
        // Call your batch operations here
        ic_cdk::println!("Tick: Updating resources and processing operations...");
        perform_tick_operations();
            });
            *timer.borrow_mut() = Some(timer_id);
            ic_cdk::println!("Tick timer started.");
        } else {
            ic_cdk::println!("Tick timer is already running.");
        }
            });
    }

    #[update]
    fn stop_tick() {
        TICK_TIMER.with(|timer| {
        if let Some(timer_id) = timer.borrow_mut().take() {
            ic_cdk_timers::clear_timer(timer_id);
            ic_cdk::println!("Tick timer stopped.");
        } else {
            ic_cdk::println!("No tick timer is currently running.");
        }
            });
    }

    fn perform_tick_operations() {
        TICK_COUNT.with(|count| {
        let mut count = count.borrow_mut();
        *count += 1;
            });

            PLANETS.with(|planets| {
        let mut planets = planets.borrow_mut();
        for planet in planets.values_mut() {
            if let Some(resource) = planet.resources.iter_mut().find(|r| r.resource_type == ResourceType::Energy) {
        resource.amount += 10;
            }
        }
            });

        ic_cdk::println!("Tick operations performed.");
    }

    #[query]
    fn get_tick_count() -> u64 {
        TICK_COUNT.with(|count| *count.borrow())
    }



    // #[update]
    // fn init_game() {
    //     // Create an initial star system with some planets
    //     let initial_system_id = generate_star_system("Sol System".to_string());

    //     // Add a few planets to the initial system
    //     let planet_names = vec!["Earth", "Mars", "Venus"];
    //     for name in planet_names {
    // let planet = create_planet(name.to_string(), initial_system_id);
    // add_planet_to_system(initial_system_id, planet).expect("Failed to add planet to system");
    //     }
    // }



// --
// --- Star System Management ---
    // Update function to add a star to a star system
    #[update]
    fn add_star_to_system(system_id: u64, star: Star) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if let Some(system) = systems.get_mut(&system_id) {
            system.stars.push(star);
            system.last_updated = time();
            Ok(())
        } else {
            Err("Star system not found.".to_string())
        }
            })
    }

    // Function to add a planet to a star system
    #[update]
    fn add_planet_to_system(system_id: u64, planet: Planet) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if let Some(system) = systems.get_mut(&system_id) {
            system.planets.push(planet);
            system.last_updated = time();
            Ok(())
        } else {
            Err("Star system not found.".to_string())
        }
            })
    }

    // Function to add a moon to a planet in a star system
    #[update]
    fn add_moon_to_planet(system_id: u64, planet_id: u64, moon: Moon) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if let Some(system) = systems.get_mut(&system_id) {
            if let Some(planet) = system.planets.iter_mut().find(|p| p.id == planet_id) {
        planet.moons.push(moon);
        system.last_updated = time();
        Ok(())
            } else {
        Err(format!("Planet with ID {} not found in star system ID {}.", planet_id, system_id))
            }
        } else {
            Err(format!("Star system with ID {} not found.", system_id))
        }
            })
    }

    #[update]
    fn add_asteroid_belt_to_system(system_id: u64, asteroid_belt: AsteroidBelt) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if let Some(system) = systems.get_mut(&system_id) {
            system.asteroid_belts.push(asteroid_belt);
            system.last_updated = time();
            Ok(())
        } else {
            Err("Star system not found.".to_string())
        }
        })
    }

    #[update]
    fn remove_star_system(id: u64) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
            let mut systems = systems.borrow_mut();
            if let Some(system) = systems.remove(&id) {
                // Remove from STAR_SYSTEM_TREE
                STAR_SYSTEM_TREE.with(|tree| {
                    tree.borrow_mut().remove(&StarSystemPoint::new(id, system.coordinates));
                });
                Ok(())
            } else {
                Err("Star system not found.".to_string())
            }
        })
    }
    
    #[update]
    fn update_star_system(id: u64, new_coordinates: (i64, i64)) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
            let mut systems = systems.borrow_mut();
            if let Some(system) = systems.get_mut(&id) {
                let old_coordinates = system.coordinates;
                system.coordinates = new_coordinates;

                // Remove old point and insert updated point
                STAR_SYSTEM_TREE.with(|tree| {
                    let mut tree = tree.borrow_mut();
                    tree.remove(&StarSystemPoint::new(id, old_coordinates));
                    tree.insert(StarSystemPoint::new(id, new_coordinates));
                });

                Ok(())
            } else {
                Err("Star system not found.".to_string())
            }
        })
    }

    // // Function to remove a star from a star system
    // #[update]
    // fn remove_star_from_system(system_id: u64, star_id: u64) -> Result<(), String> {
    //     STAR_SYSTEMS.with(|systems| {
    //     let mut systems = systems.borrow_mut();
    //     if let Some(system) = systems.get_mut(&system_id) {
    //         if let Some(index) = system.stars.iter().position(|s| s.id == star_id) {
    //     system.stars.remove(index);
    //     system.last_updated = time();
    //     Ok(())
    //         } else {
    //     Err("Star not found in this star system.".to_string())
    //         }
    //     } else {
    //         Err("Star system not found.".to_string())
    //     }
    //         })
    // }

    // Function to remove a planet from a star system
    #[update]
    fn remove_planet_from_system(system_id: u64, planet_id: u64) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
            let mut systems = systems.borrow_mut();
            if let Some(system) = systems.get_mut(&system_id) {
                if let Some(index) = system.planets.iter().position(|p| p.id == planet_id) {
                    // Get planet coordinates before removing
                    let planet_coordinates = system.planets[index].coordinates;
    
                    // Remove the planet from the star system
                    system.planets.remove(index);
                    system.last_updated = time();
    
                    // Remove from PLANET_TREE
                    PLANET_TREE.with(|tree| {
                        tree.borrow_mut().remove(&PlanetPoint::new(planet_id, planet_coordinates));
                    });
    
                    Ok(())
                } else {
                    Err("Planet not found in this star system.".to_string())
                }
            } else {
                Err("Star system not found.".to_string())
            }
        })
    }

    // Function to remove a moon from a planet in a star system
    #[update]
    fn remove_moon_from_planet(system_id: u64, planet_id: u64, moon_id: u64) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if let Some(system) = systems.get_mut(&system_id) {
            if let Some(planet) = system.planets.iter_mut().find(|p| p.id == planet_id) {
        if let Some(index) = planet.moons.iter().position(|m| m.id == moon_id) {
            planet.moons.remove(index); // Remove the moon by its ID
            system.last_updated = time();
            Ok(())
        } else {
            Err("Moon not found on this planet.".to_string())
        }
            } else {
        Err("Planet not found in this star system.".to_string())
            }
        } else {
            Err("Star system not found.".to_string())
        }
            })
    }

    // Function to remove an asteroid belt from a star system
    #[update]
    fn remove_asteroid_belt_from_system(system_id: u64, belt_id: u64) -> Result<(), String> {
        STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if let Some(system) = systems.get_mut(&system_id) {
            if let Some(index) = system.asteroid_belts.iter().position(|ab| ab.id == belt_id) {
        system.asteroid_belts.remove(index);
        system.last_updated = time();
        Ok(())
            } else {
        Err("Asteroid belt not found in this star system.".to_string())
            }
        } else {
            Err("Star system not found.".to_string())
        }
            })
    }

    #[update]
    fn update_planet_coordinates(planet_id: u64, new_coordinates: (f64, f64)) -> Result<(), String> {
        PLANETS.with(|planets| {
            let mut planets = planets.borrow_mut();
            if let Some(planet) = planets.get_mut(&planet_id) {
                let old_coordinates = planet.coordinates;
                planet.coordinates = new_coordinates;

                // Update the R-Tree
                PLANET_TREE.with(|tree| {
                    let mut tree = tree.borrow_mut();
                    tree.remove(&PlanetPoint::new(planet_id, old_coordinates)); // Remove old position
                    tree.insert(PlanetPoint::new(planet_id, new_coordinates)); // Add new position
                });

                Ok(())
            } else {
                Err("Planet not found.".to_string())
            }
        })
    }



// --
// --- Planet Management ---

    // fn calculate_habitability(
    //         temperature_range: (f64, f64),
    //         gravity: f64,
    //         atmosphere: &str,
    //     ) -> String {
    //         let mut score = 0.0;

    //         // Temperature scoring
    //         if (10.0..=35.0).contains(&temperature_range.0) && (10.0..=35.0).contains(&temperature_range.1) {
    //             score += 1.5; // Ideal temperature
    //         } else if (-50.0..=50.0).contains(&temperature_range.0) && (-50.0..=50.0).contains(&temperature_range.1) {
    //             score += 1.0; // Moderate with a wider range
    //         } else if (-150.0..=100.0).contains(&temperature_range.0) && (-150.0..=100.0).contains(&temperature_range.1) {
    //             score += 0.5; // Harsh but survivable with tech
    //         } // Uninhabitable is default for extreme temperatures

    //         // Gravity scoring
    //         if (0.8..=1.2).contains(&gravity) {
    //             score += 1.5; // Ideal gravity
    //         } else if (0.5..=2.0).contains(&gravity) {
    //             score += 1.0; // Moderate gravity range
    //         } else if (0.3..=3.0).contains(&gravity) {
    //             score += 0.5; // Harsh gravity but potentially survivable
    //         } // Uninhabitable for gravity outside 0.3–3.0

    //         // Atmosphere scoring
    //         match atmosphere {
    //             "Moderate" => score += 1.5, // Ideal atmosphere
    //             "Thick" | "Thin" => score += 1.0, // Moderate atmosphere
    //             "None" | "Toxic" => score += 0.5, // Harsh atmosphere
    //             _ => (), // Uninhabitable for anything worse
    //         }

    //         // Final categorization
    //         match score {
    //             s if s >= 4.0 => "Ideal".to_string(),
    //             s if s >= 2.5 => "Moderate".to_string(),
    //             s if s >= 1.5 => "Harsh".to_string(),
    //             _ => "Uninhabitable".to_string(),
    //         }
    // }

    // #[update]
    // fn create_planet(name: String, system_id: u64) -> Planet {
    //     let planet_id = NEXT_PLANET_ID.with(|id| {
    //         let mut id = id.borrow_mut();
    //         let current_id = *id;
    //         *id += 1;
    //         current_id
    //     });

    //     // Get system coordinates
    //     let system_coordinates = STAR_SYSTEMS.with(|systems| {
    //         systems.borrow()
    //             .get(&system_id)
    //             .map(|s| s.coordinates)
    //             .unwrap_or((0, 0))
    //     });

    //     // Generate planet coordinates
    //     let coordinates = (
    //         system_coordinates.0 as f64 + generate_random_in_range_f64(-10.0, 10.0),
    //         system_coordinates.1 as f64 + generate_random_in_range_f64(-10.0, 10.0),
    //     );

    //     // Planet attributes
    //     let categories = vec![
    //         "Terrestrial", "Gas Giant", "Ice World", "Desert", "Ocean World",
    //         "Lava World", "Dwarf Planet", "Super-Earth", "Carbon Planet",
    //         "Iron Planet", "Chthonian Planet", "Rogue",
    //     ];
    //     let subcategories = vec![
    //         vec!["Rocky", "Volcanic", "Metallic"],
    //         vec!["Jovian", "Neptunian"],
    //         vec!["Frozen", "Cryovolcanic"],
    //         vec!["Arid", "Sandy"],
    //         vec!["Water", "Ice-Covered"],
    //         vec!["Molten", "Magma"],
    //         vec!["Rocky", "Icy"],
    //         vec!["Rocky", "Oceanic"],
    //         vec!["Graphite", "Diamond"],
    //         vec!["Metallic", "Magnetic"],
    //         vec!["Core Remnant", "Evaporated"],
    //         vec!["Wandering"],
    //     ];
    //     let random_category_index = generate_random_in_range(0, (categories.len() - 1) as u64) as usize;
    //     let planet_category = categories[random_category_index].to_string();
    //     let planet_subcategory = subcategories[random_category_index][generate_random_in_range(
    //         0,
    //         (subcategories[random_category_index].len() - 1) as u64,
    //     ) as usize]
    //         .to_string();

    //     // Planet size
    //     let planet_size_options = vec!["Tiny", "Small", "Medium", "Large", "Huge"];
    //     let random_size_index = generate_random_in_range(0, (planet_size_options.len() - 1) as u64) as usize;
    //     let planet_size = planet_size_options[random_size_index].to_string();

    //     // Atmosphere Composition
    //     let atmosphere_options = vec![
    //         vec!["None"],
    //         vec!["Thin", "Moderate"],
    //         vec!["Moderate", "Thick"],
    //         vec!["Thick", "Toxic"],
    //         vec!["Toxic", "Superdense"],
    //     ];
    //     let atmosphere = atmosphere_options[random_size_index][generate_random_in_range(
    //         0,
    //         (atmosphere_options[random_size_index].len() - 1) as u64,
    //     ) as usize]
    //         .to_string();

    //     // Temperature Range
    //     let base_temperature_ranges = vec![
    //         (-88.0, 58.0),   // Earth-like
    //         (-200.0, -100.0), // Frozen
    //         (-100.0, 0.0),   // Cold
    //         (100.0, 500.0),  // Hot
    //         (430.0, 700.0),  // Scorching
    //     ];
    //     let random_temp_index = generate_random_in_range(0, (base_temperature_ranges.len() - 1) as u64) as usize;
    //     let base_temperature_range = base_temperature_ranges[random_temp_index];
    //     let temperature_range = (
    //         base_temperature_range.0 - generate_random_in_range(0, 20) as f64,
    //         base_temperature_range.1 + generate_random_in_range(0, 20) as f64,
    //     );

    //     // Gravity
    //     let base_gravity = match planet_size.as_str() {
    //         "Tiny" => 0.5,
    //         "Small" => 1.0,
    //         "Medium" => 1.5,
    //         "Large" => 2.0,
    //         "Huge" => 2.5,
    //         _ => 1.0,
    //     };
    //     let gravity = base_gravity + generate_random_in_range(0, 50) as f64 / 100.0;

    //     // Orbital Period
    //     let orbital_period_days = if planet_category == "Rogue" {
    //         0
    //     } else {
    //         generate_random_in_range(50, 1000)
    //     };

    //     // Habitability
    //     let habitability = calculate_habitability(temperature_range, gravity, &atmosphere);

    //     // Create the planet
    //     let planet = Planet {
    //         id: planet_id,
    //         name,
    //         system_id,
    //         coordinates,
    //         planet_category,
    //         planet_subcategory,
    //         planet_size,
    //         atmosphere: vec![atmosphere],
    //         temperature_range,
    //         gravity,
    //         orbital_period_days,
    //         resources: vec![],
    //         max_miner_capacity: 100,
    //         moons: vec![],
    //         habitability,
    //         owner_id: None,
    //         buildings: vec![],
    //         orbiting_fleets: vec![],
    //     };

    //     PLANETS.with(|planets| {
    //         planets.borrow_mut().insert(planet_id, planet.clone());
    //     });

    //     // Add to PLANET_TREE using PlanetPoint
    //     PLANET_TREE.with(|tree| {
    //         tree.borrow_mut().insert(PlanetPoint::new(planet_id, coordinates));
    //     });

    //     planet
    // }

    #[query]
    fn get_planet(planet_id: u64) -> Option<Planet> {
        PLANETS.with(|planets| planets.borrow().get(&planet_id).cloned())
    }

    #[update]
    fn claim_planet(planet_id: u64) -> Result<(), String> {
        let caller = ic_cdk::caller();

        // Reject anonymous calls
        if caller == Principal::anonymous() {
            return Err("Anonymous users cannot claim planets.".to_string());
        }

        // Check if the player is registered
        if !PLAYERS.with(|players| players.borrow().contains_key(&caller)) {
            return Err("Player not registered.".to_string());
        }

        PLANETS.with(|planets| {
            let mut planets = planets.borrow_mut();
            if let Some(planet) = planets.get_mut(&planet_id) {
                if planet.owner_id.is_none() {
                    planet.owner_id = Some(caller); // Assign the caller's Principal

                    // Update the R-Tree to reflect ownership change
                    PLANET_TREE.with(|tree| {
                        let mut tree = tree.borrow_mut();
                        tree.remove(&PlanetPoint::new(planet_id, planet.coordinates));
                        tree.insert(PlanetPoint::new(planet_id, planet.coordinates));
                    });

                    Ok(())
                } else {
                    Err("Planet is already owned.".to_string())
                }
            } else {
                Err("Planet not found.".to_string())
            }
        })
    }


// --
// --- Resource Management ---

    fn deplete_resource(planet: &mut Planet, resource_type: ResourceType, amount: u64) -> Result<(), String> {
        if let Some(resource) = planet.resources.iter_mut().find(|r| r.resource_type == resource_type) {
        if resource.amount >= amount {
            resource.amount -= amount;
            Ok(())
        } else {
            Err("Insufficient resources.".to_string())
        }
            } else {
        Err("Resource type not found on planet.".to_string())
            }
    }

// --
// --- Building Management ---

    #[update]
    fn build_structure(planet_id: u64, building_type: BuildingType) -> Result<u64, String> {
        let caller = ic_cdk::caller();

        // Reject anonymous calls
        if caller == Principal::anonymous() {
            return Err("Anonymous users cannot build structures.".to_string());
        }

        // Check if the player is registered
        if !PLAYERS.with(|players| players.borrow().contains_key(&caller)) {
            return Err("Player not registered.".to_string());
        }

        // Check if the player owns the planet
        let is_owner = PLANETS.with(|planets| {
            planets.borrow().get(&planet_id).map(|planet| planet.owner_id) == Some(Some(caller))
        });

        if !is_owner {
            return Err("Player does not own this planet.".to_string());
        }

        // Generate building ID
        let building_id = NEXT_BUILDING_ID.with(|id| {
            let mut id = id.borrow_mut();
            let current_id = *id;
            *id += 1;
            current_id
        });

        let cost = match building_type {
            BuildingType::Mine => 500,
            BuildingType::Shipyard => 1000,
        };

        PLANETS.with(|planets| {
            let mut planets = planets.borrow_mut();
            if let Some(planet) = planets.get_mut(&planet_id) {
                // Check if the planet has enough resources
                let has_enough_resources = planet.resources.iter()
                    .filter(|r| r.resource_type == ResourceType::Energy)
                    .map(|r| r.amount)
                    .sum::<u64>() >= cost;

                if has_enough_resources {
                    // Deduct the resources
                    deplete_resource(planet, ResourceType::Energy, cost)?;

                    // Add the building
                    let building = Building {
                        id: building_id,
                        building_type,
                        level: 1,
                    };

                    planet.buildings.push(building);

                    // Add to BUILDING_TREE
                    let building_coords = planet.coordinates; // Use planet's coordinates for the building
                    BUILDING_TREE.with(|tree| {
                        tree.borrow_mut().insert(BuildingPoint::new(building_id, building_coords));
                    });

                    Ok(building_id)
                } else {
                    Err("Insufficient resources to build structure.".to_string())
                }
            } else {
                Err("Planet not found.".to_string())
            }
        })
    }

    #[update]
    fn upgrade_building(planet_id: u64, building_id: u64) -> Result<(), String> {
        let caller = ic_cdk::caller();

        // Check if the player is registered
        if !PLAYERS.with(|players| players.borrow().contains_key(&caller)) {
            return Err("Player not registered.".to_string());
        }

        // Check if the player owns the planet
        let is_owner = PLANETS.with(|planets| {
            planets.borrow().get(&planet_id).map(|planet| planet.owner_id) == Some(Some(caller))
        });

        if !is_owner {
            return Err("Player does not own this planet.".to_string());
        }

        PLANETS.with(|planets| {
        let mut planets = planets.borrow_mut();
        if let Some(planet) = planets.get_mut(&planet_id) {
            if let Some(building) = planet.buildings.iter_mut().find(|b| b.id == building_id) {
        let upgrade_cost = match building.building_type {
            BuildingType::Mine => 250, // Example upgrade cost
            BuildingType::Shipyard => 500, // Example upgrade cost
        };

        // Check if the planet has enough resources
        let total_energy = planet.resources.iter()
            .filter(|r| r.resource_type == ResourceType::Energy)
            .map(|r| r.amount)
            .sum::<u64>();

        if total_energy >= upgrade_cost {
            // Deduct the resources
            if let Some(resource) = planet.resources.iter_mut()
        .find(|r| r.resource_type == ResourceType::Energy) {
        resource.amount -= upgrade_cost;
            }

            building.level += 1;
            Ok(())
        } else {
            Err("Insufficient resources to upgrade building.".to_string())
        }
            } else {
        Err("Building not found.".to_string())
            }
        } else {
            Err("Planet not found.".to_string())
        }
            })
    }

    #[update]
    fn move_building(building_id: u64, new_coords: (f64, f64)) -> Result<(), String> {
        BUILDING_TREE.with(|tree| {
            let mut tree = tree.borrow_mut();
    
            // First, find the building point (immutable borrow)
            let point_to_move = tree.iter()
                .find(|point| point.building_id == building_id)
                .cloned();
    
            if let Some(point) = point_to_move {
                // Remove the old position (mutable borrow)
                tree.remove(&point);
    
                // Insert the new position (mutable borrow)
                tree.insert(BuildingPoint::new(building_id, new_coords));
    
                Ok(())
            } else {
                Err("Building not found.".to_string())
            }
        })
    }

    #[update]
    fn remove_building(building_id: u64) -> Result<(), String> {
        BUILDING_TREE.with(|tree| {
            let mut tree = tree.borrow_mut();

            // First, find the building point (immutable borrow)
            let point_to_remove = tree.iter()
                .find(|point| point.building_id == building_id)
                .cloned();

            if let Some(point) = point_to_remove {
                // Remove the building point (mutable borrow)
                tree.remove(&point);
                Ok(())
            } else {
                Err("Building not found.".to_string())
            }
        })
    }


//--
// --- Fleet and Ship Management ---

    #[update]
    fn build_ship(planet_id: u64, ship_type: ShipType) -> Result<u64, String> {
        let caller = ic_cdk::caller();

        // Check if the player is registered
        if !PLAYERS.with(|players| players.borrow().contains_key(&caller)) {
            return Err("Player not registered.".to_string());
        }

        // Check if the player owns the planet and if the planet has a shipyard
        let has_shipyard = PLANETS.with(|planets| {
            planets.borrow().get(&planet_id).map(|planet| {
                planet.owner_id == Some(caller)
                    && planet.buildings.iter().any(|b| b.building_type == BuildingType::Shipyard)
            }) == Some(true)
        });

        if !has_shipyard {
            return Err("Player does not own this planet or there is no shipyard.".to_string());
        }

        // Get the cost for the ship type
        let cost = match ship_type {
            ShipType::Scout => 100, // Example cost for a scout
        };

        // Check if the planet has enough resources
        let has_enough_resources = PLANETS.with(|planets| {
            planets.borrow().get(&planet_id).map(|planet| {
                planet.resources.iter()
                    .filter(|r| r.resource_type == ResourceType::Energy)
                    .map(|r| r.amount)
                    .sum::<u64>() >= cost
            }) == Some(true)
        });

        if !has_enough_resources {
            return Err("Insufficient resources to build ship.".to_string());
        }

        // Deduct the resources from the planet
        PLANETS.with(|planets| {
            let mut planets = planets.borrow_mut();
            if let Some(planet) = planets.get_mut(&planet_id) {
                deplete_resource(planet, ResourceType::Energy, cost)?;
            }
            Ok::<(), String>(())
        })?;

        // Create a new ship
        let ship_id = NEXT_SHIP_ID.with(|id| {
            let mut id = id.borrow_mut();
            let current_id = *id;
            *id += 1;
            current_id
        });

        let new_ship = Ship {
            id: ship_id,
            ship_type,
            health: 100, // Example health for a scout
        };

        // Add the ship to the player's fleet
        let fleet_id_result = FLEETS.with(|fleets| {
            let mut fleets = fleets.borrow_mut();
            let fleet_ids: Vec<u64> = fleets.keys().cloned().collect();

            for fleet_id in fleet_ids {
                if let Some(fleet) = fleets.get_mut(&fleet_id) {
                    if fleet.owner_id == caller {
                        fleet.ships.push(new_ship);
                        return Ok(fleet_id);
                    }
                }
            }

            // If no existing fleet is found, create a new one
            let new_fleet_id = NEXT_FLEET_ID.with(|id| {
                let mut id = id.borrow_mut();
                let current_id = *id;
                *id += 1;
                current_id
            });

            let coordinates = (0.0, 0.0); // Default coordinates for a new fleet
            let new_fleet = Fleet {
                id: new_fleet_id,
                owner_id: caller,
                coordinates,
                ships: vec![new_ship],
            };

            fleets.insert(new_fleet_id, new_fleet);

            // Add to FLEET_TREE
            FLEET_TREE.with(|tree| {
                tree.borrow_mut().insert(FleetPoint::new(new_fleet_id, coordinates));
            });

            Ok(new_fleet_id)
        });

        fleet_id_result
    }

    #[update]
    fn create_fleet() -> Result<u64, String> {
        let caller = ic_cdk::caller();

        // Check if the player is registered
        if !PLAYERS.with(|players| players.borrow().contains_key(&caller)) {
            return Err("Player not registered.".to_string());
        }

        // Create a new fleet
        let fleet_id = NEXT_FLEET_ID.with(|id| {
            let mut id = id.borrow_mut();
            let current_id = *id;
            *id += 1;
            current_id
        });
        let coordinates = (0.0, 0.0);
        let new_fleet = Fleet {
            id: fleet_id,
            owner_id: caller,
            coordinates,
            ships: Vec::new(),
        };

        FLEETS.with(|fleets| {
            fleets.borrow_mut().insert(fleet_id, new_fleet);
        });

        // Add to FLEET_TREE
        FLEET_TREE.with(|tree| {
            tree.borrow_mut().insert(FleetPoint::new(fleet_id, coordinates));
        });

        Ok(fleet_id)
    }

    #[update]
    fn move_fleet(fleet_id: u64, new_coords: (f64, f64)) -> Result<(), String> {
        FLEETS.with(|fleets| {
            let mut fleets = fleets.borrow_mut();
            if let Some(fleet) = fleets.get_mut(&fleet_id) {
                // Update the R-Tree
                FLEET_TREE.with(|tree| {
                    let mut tree = tree.borrow_mut();
                    tree.remove(&FleetPoint::new(fleet_id, fleet.coordinates)); // Remove old position
                    tree.insert(FleetPoint::new(fleet_id, new_coords)); // Add new position
                });
    
                // Update the fleet's coordinates
                fleet.coordinates = new_coords;
                Ok(())
            } else {
                Err("Fleet not found.".to_string())
            }
        })
    }
    
    #[update]
    fn remove_fleet(fleet_id: u64) -> Result<(), String> {
        FLEETS.with(|fleets| {
            let mut fleets = fleets.borrow_mut();
            if let Some(fleet) = fleets.remove(&fleet_id) {
                // Remove from FLEET_TREE
                FLEET_TREE.with(|tree| {
                    tree.borrow_mut().remove(&FleetPoint::new(fleet_id, fleet.coordinates));
                });
                Ok(())
            } else {
                Err("Fleet not found.".to_string())
            }
        })
    }



//--
// Tests
    #[cfg(test)]
    mod tests { use super::*;

    #[test]
    fn test_initial_tree_is_empty() {
        GALAXY_TREE.with(|tree| {
            assert!(
                tree.borrow().iter().next().is_none(),
                "Galaxy tree should start empty"
            );
        });
    }


   
    }
// --
// Export the Candid interface
ic_cdk::export_candid!();