use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{update, query};
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk_timers::TimerId;
use rstar::{RTree, RTreeObject, AABB, PointDistance};
use serde::Serialize;


fn generate_star_cluster(
    cluster_type: &StarClusterType,
    cluster_coords: Coordinates, // Use the Coordinates struct
) -> Result<Vec<Principal>, String> {
    // Determine the number of stars based on cluster type
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
        _ => 0, // Hypothetical clusters do not generate stars
    };

    // Create a vector to hold the star types
    let empty_star_types = vec![];

    // Get star types from the cluster type
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
        _ => &empty_star_types,
    };

    // Generate stars
    let mut stars = Vec::new();
    for _ in 0..star_count {
        let radius = generate_random_in_range_f64(0.0, 10.0); // Scatter stars within 10 units
        let angle = generate_random_in_range_f64(0.0, 2.0 * std::f64::consts::PI);
        let star_coords = cluster_coords.offset(&Coordinates::from_polar(radius, angle)); // Use offset with polar coordinates

        // Pick a random star type
        let star_type = if !star_types.is_empty() {
            let current_time_nanos = ic_cdk::api::time() as u64;
            let index = (current_time_nanos % star_types.len() as u64) as usize;
            star_types[index].clone()
        } else {
            "Unknown".to_string()
        };

        // Construct the Metadata::Star variant with all required fields
        let star_metadata = Metadata::Star(Star {
            name: "Unnamed Star".to_string(),
            description: "A procedurally generated star".to_string(),
            star_type: StarType::G, // Default to a G-type star; adjust based on star_type if needed
            coords: [star_coords.x, star_coords.y],
            parent_cluster_id: Principal::anonymous(), // Replace with the actual cluster Principal ID
            temperature: generate_random_in_range_f64(3000.0, 30000.0), // Example range in Kelvin
            luminosity: generate_random_in_range_f64(0.1, 10.0), // Relative to the Sun
            mass: generate_random_in_range_f64(0.1, 50.0), // Relative to the Sun
            radius: generate_random_in_range_f64(0.1, 10.0), // Relative to the Sun
            age: generate_random_in_range_f64(0.01, 10.0), // Example: Age in billions of years
            metallicity: generate_random_in_range_f64(0.001, 0.03), // Metallicity fraction
            rotation_speed: generate_random_in_range_f64(1.0, 500.0), // Example: Rotation speed in km/s
            phenomena: vec![], // Default to no phenomena; can add based on logic
            spectral_class: star_type.clone(),
            life_stage: "Main Sequence".to_string(), // Default to main sequence; adjust if needed
            hp: 1000, // Default HP for stars
            shield: if star_type == "O" { Some(500) } else { None }, // Example shield logic
            can_move: Some(false),
            can_attack: Some(false),
        });

        // Add each star as an entity
        if let Ok(star_id) = add_entity(
            EntityType::Star,
            LocationParams::Proximity {
                center: [star_coords.x, star_coords.y],
                max_distance: 10.0,
            },
            Some(star_metadata),
            None,
        ) {
            stars.push(star_id);
        }
    }

    Ok(stars)
}

    
    fn add_entity(
        entity_type: EntityType,
        location_params: LocationParams,
        metadata: Option<Metadata>,
        star_cluster_type: Option<StarClusterType>,
    ) -> Result<Principal, String> {
        let caller = ic_cdk::caller();
    
        if entity_type == EntityType::StarCluster && star_cluster_type.is_none() {
            return Err("StarCluster requires a valid StarClusterType".to_string());
        }
    
        // Validate metadata
        let entity_metadata = metadata.ok_or_else(|| "Metadata is required for the entity".to_string())?;
    
        // Ensure metadata matches the entity type
        match (&entity_type, &entity_metadata) {
            (EntityType::StarCluster, Metadata::StarCluster(_)) => {} // Valid case
            (EntityType::Star, Metadata::Star(_)) => {} // Add validation for other entity types
            _ => return Err("Mismatched metadata type for entity".to_string()),
        }
    
        // Create a unique entity ID
        let unique_id = ENTITY_COUNTER.with(|counter| {
            let mut counter = counter.borrow_mut();
            *counter += 1;
            *counter
        });
        let unique_principal = Principal::self_authenticating(&unique_id.to_be_bytes());
    
        // Generate coordinates based on location_params
        let coords = match location_params {
            LocationParams::Ring { inner_radius, outer_radius } => {
                let radius = generate_random_in_range_f64(inner_radius, outer_radius);
                let angle = generate_random_in_range_f64(0.0, 2.0 * std::f64::consts::PI);
                Coordinates::from_polar(radius, angle)
            }
            LocationParams::Proximity { center, max_distance } => {
                let distance = generate_random_in_range_f64(0.0, max_distance);
                let angle = generate_random_in_range_f64(0.0, 2.0 * std::f64::consts::PI);
                Coordinates {
                    x: center[0] + distance * angle.cos(),
                    y: center[1] + distance * angle.sin(),
                }
            }
            LocationParams::Random { x_range, y_range } => Coordinates {
                x: generate_random_in_range_f64(x_range[0], x_range[1]),
                y: generate_random_in_range_f64(y_range[0], y_range[1]),
            },
        };
    
        // If it's a StarCluster, generate stars
        if let Some(cluster_type) = &star_cluster_type {
            if entity_type == EntityType::StarCluster {
                let stars = generate_star_cluster(cluster_type, coords.clone())?;
                ic_cdk::println!(
                    "Generated {} stars for cluster {:?}",
                    stars.len(),
                    cluster_type
                );
            }
        }
    
        // Create and store the entity
        let entity = Entity {
            id: unique_principal,
            owner_id: caller,
            entity_type,
            coords: coords.to_array(),
            metadata: entity_metadata,
        };
    
        GALAXY_TREE.with(|tree| {
            tree.borrow_mut().insert(entity);
        });
    
        Ok(unique_principal)
    }
    
// --- Data Structures ---
    
    #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
    enum ResourceType {
        Energy,
        Matter
    }

    enum ReferralCodeResult {
        Ok(String),
        _Err(String),
    }

    // Types

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum EntityType {
            StarCluster,
            Star,
            Planet,
            Asteroid,
            Moon,
            Nebulae, // Areas with unique resources or visual effects.
            BlackHole, // High-risk, high-reward areas.
            Colony, // Habitats 
            AncientRuins, //  Provide lore, unique technologies, or resources.
            Artifacts,
            Fleet,
            Unit,
            Building,
            NPC,    // Non-playable characters with unique behaviors
            Player, // Real-world players
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum Metadata {
            StarCluster(StarCluster),
            Star(Star),
            Planet(Planet),
            Asteroid(Asteroid),
            Moon(Moon),
            Nebula(Nebula),
            BlackHole(BlackHole),
            AncientRuins(AncientRuins),
            Artifacts(Artifact),
            Fleet(Fleet),
            Unit(Unit),
            Building(Building),
            NPC(NPC),
            Player(Player),
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
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

        #[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
        enum AssociationType {
            OB, // Contains O and B-type stars
            T,  // Contains T Tauri stars
            R,  // Associated with reflection nebulae
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
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

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum PlanetType {
            // --- Terrestrial Planets (Rocky) ---
            // Based on composition and characteristics
            Terrestrial,       // General rocky planet (e.g., Earth, Mars, Venus)
            IronPlanet,        // High density, primarily composed of an iron core (e.g., Mercury-like)
            SilicatePlanet,    // Primarily composed of silicate rocks (most common terrestrial type)
            CarbonPlanet,      // Rich in carbon, potentially with diamond/graphite layers (e.g., 55 Cancri e)
            CorelessPlanet,    // Theoretical, rocky planet with no metallic core
            LavaPlanet,       // Extremely hot, surface covered in molten rock (e.g., Kepler-10b)
            SuperEarth,       // Rocky planet more massive than Earth, but less massive than ice giants (many examples found)

            // --- Gas Giants (Gaseous) ---
            // Based on composition and temperature
            GasGiant,           // General gas giant, mostly H and He (e.g., Jupiter, Saturn)
            HotJupiter,         // Gas giant orbiting very close to its star, high temperatures (e.g., 51 Pegasi b)
            PuffyPlanet,        // Gas giant with very low density, large radius (e.g., Kepler-51b, c, d)
            EccentricJupiter,   // Gas giant with a highly elliptical orbit
            SuperJupiter,      // Gas giant more massive than Jupiter (e.g., Beta Pictoris b)
            SubJupiter,        // Gas giant less massive than Jupiter or Saturn

            // --- Ice Giants ---
            // Based on composition and temperature
            IceGiant,           // Composed of water, ammonia, methane ices (e.g., Uranus, Neptune)
            SuperNeptune,       // More massive than Neptune, but smaller than Saturn
            SubNeptune,       // Smaller than Neptune, may have thick H/He atmospheres or be "mini-Neptunes"

            // --- Dwarf Planets ---
            // Based on size, hydrostatic equilibrium
            DwarfPlanet,        // In hydrostatic equilibrium (round), but hasn't cleared its orbit (e.g., Pluto, Ceres)
            Plutoid,           // Dwarf planet beyond Neptune's orbit (e.g., Pluto, Eris, Makemake)
            IceDwarf,           // Dwarf planet primarily composed of ice (e.g., Pluto)

            // --- Other Planets ---
            // Based on unique features, location, or formation
            Exoplanet,         // General term for any planet outside our solar system
            RoguePlanet,        // Not gravitationally bound to any star (also called free-floating or interstellar planets)
            CircumbinaryPlanet, // Orbits two stars (e.g., Kepler-16b)
            CircumstellarPlanet, // Orbits one star within a multi-star system
            PulsarPlanet,       // Orbits a pulsar (rapidly rotating neutron star) (e.g., Draugr, Poltergeist, Phobetor)
            GoldilocksPlanet,   // In the habitable zone of a star, where liquid water could exist (e.g., Proxima Centauri b)
            EyeballPlanet,      // Tidally locked, one side always faces the star (hot), the other always faces away (cold)
            ChthonianPlanet,    // Remnant core of a gas giant that had its atmosphere stripped away (e.g., Corot-7b)
            OceanPlanet,        // Hypothetical, completely covered by a deep ocean of water
            DesertPlanet,        // Arid, desert-like planet with little to no surface water (e.g., possibly Mars in the past)

            // --- Hypothetical or Theoretical Planets ---
            // Based on models and speculation
            Blanet,                // Hypothetical planet that orbits a black hole
            ElectroweakPlanet,    // Hypothetical, supported by electroweak burning in its core
            HeliumPlanet,         // Formed from a white dwarf that has lost most of its hydrogen, leaving helium
            HyceanPlanet,         // Hot, water-covered planets with hydrogen-rich atmospheres
            IronRichPlanet,      // A planet composed mainly of iron.
            Mesoplanet,           // A planet with a size between that of Mercury and Ceres.
            MiniNeptune,           // A planet smaller than Neptune but larger than Earth.
            OceanicPlanet,        // A planet covered entirely by a deep ocean.
            Protoplanet,          // A large planetary embryo that is forming within a protoplanetary disk.
            SuperPuffPlanet,       // A planet with extremely low density for its size.
            SubEarth,               // A rocky planet smaller than Earth.
            TrojanPlanet,          // A planet that orbits in the L4 or L5 Lagrange point of another, more massive planet.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum MoonType {
            // --- Regular Moons ---
            // Generally formed in orbit around a planet
            Regular,          // Typically prograde orbit (same direction as planet's rotation), relatively small, often tidally locked
            SphericalMoon,     // Large enough for gravity to pull it into a spherical shape (e.g., Moon, Europa, Titan)
            EllipsoidalMoon,   // Not massive enough to be fully spherical, but still has a regular, somewhat rounded shape
            
            // --- Irregular Moons ---
            // Often captured, have eccentric or retrograde orbits
            Irregular,         // Typically small, irregular shape, eccentric or retrograde orbit, often captured (e.g., Phobos, Deimos)
            Captured,          // Specifically an irregular moon that was captured by the planet's gravity
            Retrograde,        // Orbits in the opposite direction of the planet's rotation

            // --- Moons Based on Composition ---
            IcyMoon,           // Primarily composed of ice (water, methane, ammonia) (e.g., Europa, Enceladus, Triton)
            RockyMoon,         // Primarily composed of rock and metal (e.g., the Moon)
            MetallicMoon,      // Hypothetical, primarily composed of metal
            DifferentiatedMoon, // Has a distinct core, mantle, and crust (e.g., the Moon, Ganymede, Callisto)
            UndifferentiatedMoon, // Interior is relatively uniform, not separated into layers

            // --- Moons with Unique Features ---
            VolcanicMoon,      // Exhibits volcanic activity (e.g., Io)
            CryovolcanicMoon,   // Exhibits cryovolcanism (volcanoes that erupt water, ammonia, methane) (e.g., Enceladus, Triton)
            SubsurfaceOceanMoon, // Has a liquid ocean beneath an icy crust (e.g., Europa, Enceladus, Ganymede)
            AtmosphericMoon,    // Has a significant atmosphere (e.g., Titan)
            MagnetosphericMoon, // Has its own magnetic field (e.g., Ganymede)
            RingMoon,         // Has its own system of rings.
            ShepherdMoon,     // Orbits near the edge of a planetary ring, gravitationally shaping it (e.g., Prometheus, Pandora)
            CoOrbitalMoon,     // Two or more moons sharing the same orbit (e.g., Janus and Epimetheus)
            
            // --- Hypothetical or Specialized Types ---
            CapturedAsteroid,  // An asteroid captured into orbit around a planet
            TrojanMoon,        // Shares the orbit of a larger moon at the L4 or L5 Lagrange points
            DoublePlanet,      // A moon so large that the system is sometimes considered a double planet instead (e.g., Pluto and Charon)
            
            // --- Other ---
            MiniMoon,           // A very small moon or moonlet.
            Moonlet,           // A very small moon, often found within planetary rings (e.g., Daphnis, Pan)
            Subsatellite,      // A natural satellite orbiting a moon.
            
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum AsteroidType {
            // --- Main Belt Asteroid Types (Compositional) ---
            CType, // Carbonaceous: dark, low albedo, rich in carbon, most common Type (e.g., Ceres, before its reclassification)
            SType, // Silicaceous: moderately bright, composed of silicate minerals and metals (e.g., Juno, Eros)
            MType, // Metallic: relatively bright, composed of metallic iron and nickel (e.g., Psyche)
        
            // --- Other Main Belt Asteroid Types (Less Common) ---
            BType, // SubType of C-Type, bluish, found in the outer main belt
            FType, // SubType of C-Type, featureless spectra
            GType, // SubType of C-Type, low albedo, UV absorption feature (e.g., Ceres)
            PType, // Very low albedo, red-sloped spectra, possibly organic-rich
            DType, // Very low albedo, red-sloped spectra, possibly organic-rich (e.g., many Trojan asteroids)
            TType, // Dark, moderate albedo, unknown composition
            AType, // High albedo, strong olivine feature
            QType, // Moderate albedo, strong olivine and pyroxene features, similar to ordinary chondrite meteorites
            RType, // Moderate albedo, strong olivine and pyroxene features, red-sloped spectra
            VType, // Moderate albedo, basaltic, similar to Vesta (e.g., Vesta, other Vestoids)
        
            // --- Near-Earth Asteroid (NEA) Types ---
            Aten,  // Orbits mostly inside Earth's orbit (semi-major axis < 1 AU, aphelion > 0.983 AU)
            Apollo, // Crosses Earth's orbit (semi-major axis > 1 AU, perihelion < 1.017 AU)
            Amor,  // Approaches Earth's orbit but doesn't cross (perihelion between 1.017 and 1.3 AU)
            Atira, // Entirely inside Earth's orbit (aphelion < 0.983 AU)
            PotentiallyHazardous, // Any NEA that comes within 0.05 AU of Earth and is large enough (absolute magnitude H ≤ 22) to cause significant damage
        
            // --- Other Asteroid Locations/Groups ---
            Trojan,        // Shares an orbit with a planet at the L4 or L5 Lagrange points (e.g., Jupiter Trojans, Neptune Trojans)
            NearEarth,    // General term for asteroids whose orbits bring them close to Earth
            MainBelt,      // Located in the asteroid belt between Mars and Jupiter
            Hilda,         // In 3:2 orbital resonance with Jupiter, beyond the main belt
            Centaurs,      // Unstable orbits between Jupiter and Neptune, may originate from the Kuiper Belt
            KuiperBeltObject, // Icy bodies beyond Neptune, some are classified as dwarf planets (e.g., Pluto, although now considered a dwarf planet)
            ScatteredDiskObject, // Beyond the Kuiper Belt, highly eccentric orbits, may be the source of some comets (e.g., Eris)
        
            // --- Hypothetical or Specialized Types ---
            Vulcanoid,    // Hypothetical, within Mercury's orbit
            BinaryAsteroid, // Two asteroids orbiting each other
            ContactBinary,  // Two asteroids that have touched and are now joined (e.g., 25143 Itokawa)
            RubblePile,    // Loose collection of smaller rocks and dust held together by gravity (e.g., 25143 Itokawa, 162173 Ryugu)
            ActiveAsteroid, // Shows comet-like activity (dust or gas emission) (e.g., 3200 Phaethon)
        
            // --- Other ---
            Metallic, // Asteroids composed primarily of metal.
            Rocky,   // Asteroids composed primarily of rock.
            Icy,     // Asteroids containing significant amounts of ice.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum PhenomenonType {
            // --- Ancient Ruins Phenomena ---
            PsionicMonuments,        // Ruins emanating psychic energy, influencing mental states.
            TimeDilationChambers,    // Ruins where time flows at a different rate.
            EnergyNexusRuins,        // Ruins generating or storing vast amounts of energy.
            GravitationalAnomaly,    // Ruins altering gravity in the surrounding area.
            CosmicStormRuins,        // Ruins emitting cosmic energy storms.
            DimensionalRiftRuins,    // Ruins creating portals to other dimensions.
            AncientEnergyWells,      // Ruins with deep reservoirs of ancient energy.
            ResonanceCrystals,       // Ruins with crystals that amplify sound or energy.
            ForgottenPsionicBeacon,  // Ruins emitting psychic signals across vast distances.
            ChronoRelicSite,         // Ruins housing artifacts that manipulate time.
        
            // --- Fleet Phenomena ---
            PsionicFleet,            // Fleet powered or controlled by psychic energy.
            DimensionalFleet,        // Fleet capable of traversing alternate dimensions.
            EnergyNexusFleet,        // Fleet generating or storing vast amounts of energy.
            GravitationalFleet,      // Fleet altering gravity in the surrounding area.
            CosmicStormFleet,        // Fleet emitting cosmic energy storms.
            StealthFieldFleet,       // Fleet cloaked by advanced stealth technology.
            QuantumEntanglementFleet, // Fleet using quantum entanglement for coordination.
            PlasmaStormFleet,        // Fleet surrounded by plasma storms for defense.
            TemporalFleet,           // Fleet capable of manipulating time for tactical advantages.
            HiveMindFleet,           // Fleet controlled by a collective consciousness.
        
            // --- Building Phenomena ---
            EnergyNexusBuilding,     // A hub of energy generation or storage.
            TemporalAnomalyBuilding, // A region where time flows differently.
            PsionicFieldBuilding,    // A field that enhances psychic abilities.
            GravitationalDistortionBuilding, // A region with altered gravity.
            CosmicStormBuilding,     // A storm of cosmic energy.
            DimensionalRiftBuilding, // A portal to another dimension.
            LivingBuildingGrowth,    // A bio-engineered structure that grows and evolves.
            WeatherControlField,     // A building that manipulates local weather patterns.
            StellarEnergyCollector,  // A building harvesting energy from stars.
            QuantumComputingHub,     // A building housing advanced quantum computers.
        
            // --- Artifact Phenomena ---
            PsionicAmplifier,        // Enhances psychic or mental powers.
            TemporalAnomalyArtifact, // Causes time to flow differently.
            EnergyNexusArtifact,     // Generates or stores vast amounts of energy.
            GravitationalDistortionArtifact, // Alters gravity in the surrounding area.
            CosmicStormArtifact,     // Emits cosmic energy storms.
            DimensionalRiftArtifact, // Creates portals to other dimensions.
            SoulShard,               // Contains the fragmented essence of a being.
            RealityAnchorArtifact,   // Stabilizes reality in chaotic environments.
            QuantumMirror,           // Reflects alternate timelines or universes.
            InfiniteEnergyCore,      // An artifact providing limitless energy.
        
            // --- Stellar Phenomena ---
            Nebula,                  // Glowing clouds of gas and dust.
            ProtostellarDisk,        // Disk of material around a forming star.
            StellarWinds,            // Flows of gas ejected by stars.
            StarburstActivity,       // Regions of intense star formation.
            Supernova,               // Explosive death of a massive star.
            Hypernova,               // Extremely energetic supernovae.
            Kilonova,                // Merger of neutron stars or neutron star-black hole systems.
            Nova,                    // Thermonuclear explosions on white dwarf surfaces.
            GammaRayBurst,           // The most energetic electromagnetic events in the universe.
            SupernovaRemnant,        // Expanding gas and dust clouds after a supernova.
            PulsarWindNebula,        // Nebula powered by pulsar winds.
            XRayBinary,              // Compact object accreting matter from a companion star.
            Microquasar,             // Black holes or neutron stars with relativistic jets.
            CataclysmicVariable,     // Binary systems with recurring outbursts.
            RelativisticJets,        // High-energy particle jets from compact objects.
            GammaRayEmission,        // Intense gamma-ray emission.
            XRayEmission,            // High-energy X-ray radiation.
            InfraredEmission,        // Infrared radiation from star-forming regions.
            StellarCollisions,       // Collisions between stars.
            MassLoss,                // Ejection of material from stars.
            ThermalPulses,           // Episodic energy surges in evolved stars.
            BlueStragglers,          // Stars that appear younger and hotter in clusters.
            XRaySources,             // Compact objects emitting X-rays.
            InfraredSources,         // Bright objects in infrared wavelengths.
            GammaRaySources,         // Sources of gamma-ray emission.
            DarkMatterAnnihilation,  // Hypothetical emission from dark matter interactions.
            GravitationalWaves,      // Ripples in spacetime from massive object mergers.
            BlackHoleAccretionDisk,  // Bright, energetic disk around black holes.
            AccretionDisk,           // Disk of material falling into compact objects.
            PolarJets,               // Jets of material ejected along magnetic poles.
            MagnetarFlares,          // Energetic bursts from magnetars.
            StellarFlares,           // Sudden brightness increases in stars.
            CoronalMassEjections,    // Large plasma ejections from stellar coronae.
            DarkMatterHalo,          // Hypothetical halo of dark matter around galaxies.
            CosmicJets,              // Large-scale particle jets in the universe.
        
            // --- Planetary Phenomena ---
            PlanetaryRings,          // Rings of dust and ice surrounding a planet.
            VolcanicEruptions,       // Massive volcanic activity on a planet.
            TectonicActivity,        // Shifting of planetary crusts causing earthquakes.
            AtmosphericStorms,       // Violent storms in a planet's atmosphere.
            MagneticAnomalies,       // Unusual magnetic fields affecting technology.
            SubsurfaceOceans,        // Oceans hidden beneath a planet's surface.
            Cryovolcanism,           // Volcanic activity involving water or other volatiles.
            PlanetaryAuroras,        // Light displays caused by solar wind interactions.
            DustStorms,              // Massive storms of dust covering a planet.
            Geysers,                 // Jets of water or gas erupting from a planet's surface.
        
            // --- Galactic Phenomena ---
            GalacticCoreActivity,    // Intense energy emissions from a galaxy's core.
            SpiralArmFormation,      // Formation of spiral arms in a galaxy.
            GalacticCollisions,      // Collisions between galaxies.
            DarkMatterFilaments,     // Filaments of dark matter connecting galaxies.
            QuasarActivity,          // Bright, energetic centers of distant galaxies.
            GalacticWinds,           // Outflows of gas from a galaxy.
            StarStreams,             // Streams of stars torn from smaller galaxies.
            SupermassiveBlackHole,   // A black hole at the center of a galaxy.
            GalacticMagneticFields,  // Magnetic fields spanning entire galaxies.
            IntergalacticVoid,       // Vast, empty regions between galaxies.
        
            // --- Cosmic Phenomena ---
            CosmicMicrowaveBackground, // Residual radiation from the Big Bang.
            DarkEnergyInfluence,     // The mysterious force accelerating the universe's expansion.
            CosmicVoids,             // Vast, empty regions of space.
            LargeScaleStructure,     // The web-like structure of the universe.
            InflationaryEpoch,       // Rapid expansion of the universe after the Big Bang.
            PrimordialBlackHoles,    // Hypothetical black holes formed in the early universe.
            CosmicStrings,           // Hypothetical one-dimensional defects in spacetime.
            MultiversePortals,       // Hypothetical gateways to other universes.
            QuantumFoam,             // Fluctuations in spacetime at the smallest scales.
            TimeCrystals,            // Hypothetical structures with repeating patterns in time.
        
            // --- Miscellaneous Phenomena ---
            Wormholes,               // Hypothetical shortcuts through spacetime.
            QuantumEntanglement,     // Particles linked across vast distances.
            ZeroPointEnergy,         // Energy present in a vacuum at absolute zero.
            AntimatterAnnihilation,  // Explosive reactions between matter and antimatter.
            HawkingRadiation,        // Radiation emitted by black holes.
            VacuumDecay,             // Hypothetical catastrophic event altering the universe.
            BoltzmannBrains,         // Hypothetical self-aware entities arising from random fluctuations.
            HolographicPrinciple,    // The idea that the universe is a hologram.
            SimulationGlitches,      // Hypothetical anomalies if the universe is a simulation.
            CosmicConsciousness,     // The idea that the universe itself is conscious.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum NebulaType {
            // --- Formation Nebulae ---
            DarkNebula,            // Dense clouds of gas and dust that block visible light (e.g., Horsehead Nebula)
            MolecularCloud,        // Cold, dense regions of molecular hydrogen and dust (e.g., Orion Molecular Cloud)
            GiantMolecularCloud,   // Massive molecular clouds, star formation nurseries (e.g., Sagittarius B2)
            BokGlobule,            // Small, dense dark clouds within molecular clouds, often forming stars (e.g., Barnard 68)
            ProtostellarNebula,    // Nebulae surrounding forming protostars

            // --- Emission Nebulae ---
            HIIRegion,             // Regions of ionized hydrogen, often around hot young stars (e.g., Eagle Nebula)
            StarburstRegion,       // Intense star-forming nebulae, emitting in multiple wavelengths (e.g., 30 Doradus in the LMC)
            PhotoionizedNebula,    // Nebula ionized by ultraviolet light from stars (e.g., Tarantula Nebula)
            WolfRayetBubble,       // Nebula created by stellar winds from Wolf-Rayet stars (e.g., NGC 6888, Crescent Nebula)

            // --- Reflection Nebulae ---
            ReflectionNebula,      // Dust clouds reflecting the light of nearby stars (e.g., Pleiades Reflection Nebula)

            // --- Planetary Nebulae ---
            PlanetaryNebula,       // Expanding shell of ionized gas from dying stars (e.g., Ring Nebula)
            BipolarNebula,         // Nebulae with two symmetric lobes due to stellar outflows (e.g., Butterfly Nebula)
            ProtoplanetaryNebula,  // Transitional stage between Asymptotic Giant Branch (AGB) stars and planetary nebulae
            InfraredNebula,        // Planetary nebulae emitting primarily in the infrared (e.g., Helix Nebula)

            // --- Supernova Remnant Nebulae ---
            SupernovaRemnantNebula, // Expanding clouds from supernova explosions (e.g., Crab Nebula)
            PulsarWindNebula,       // Nebula powered by the energetic winds of a pulsar (e.g., Vela Pulsar Wind Nebula)
            HypernovaRemnant,       // Hypothetical nebulae from extremely energetic supernovae (hypernovae)
            KilonovaRemnant,        // Hypothetical nebulae formed from neutron star mergers

            // --- Circumstellar Nebulae ---
            CircumstellarNebula,    // Gas and dust surrounding stars, often from mass loss (e.g., Egg Nebula)
            StellarEjectaNebula,    // Ejected material from evolved stars (e.g., Homunculus Nebula around Eta Carinae)
            DiskNebula,             // Protoplanetary or accretion disks emitting light (e.g., HL Tauri Disk)

            // --- High-Energy Nebulae ---
            GammaRayNebula,         // Nebulae emitting in gamma-ray wavelengths, often from pulsars or compact objects
            XRayNebula,             // Nebulae emitting in X-rays, associated with compact objects or stellar winds
            PolarJetNebula,         // Nebulae shaped by polar jets from compact stars or black holes

            // --- Galactic and Extragalactic Nebulae ---
            Superbubble,            // Large cavities formed by stellar winds and supernovae (e.g., Cygnus Superbubble)
            IntergalacticNebula,    // Nebulae in the intergalactic medium, often faint and diffuse
            CosmicFilamentNebula,   // Hypothetical nebulae in large-scale cosmic structures

            // --- Exotic and Hypothetical Nebulae ---
            DarkMatterNebula,       // Hypothetical nebulae composed of dark matter and baryonic matter
            QuarkNebula,            // Hypothetical remnants from exotic quark-based explosions
            BosonNebula,            // Hypothetical nebulae formed from condensates of bosonic particles
            MagnetarNebula,         // Hypothetical nebulae formed by magnetic field interactions around magnetars
            PreonNebula,            // Hypothetical nebulae formed by exotic preonic matter
            BlackHoleNebula,        // Hypothetical nebulae formed around accreting black holes with relativistic jets

            // --- Other Observational Types ---
            DiffuseNebula,          // General term for nebulae not clearly defined (e.g., Gum Nebula)
            CompactNebula,          // Small and dense nebulae, distinct from the surrounding medium
            FilamentaryNebula,      // Nebulae with a filament-like structure (e.g., Veil Nebula)
            KnottyNebula,           // Nebulae with clumps or knots, often in planetary or supernova remnants
            BowShockNebula,         // Nebulae shaped by stellar winds colliding with interstellar medium (e.g., LL Orionis)

            // --- Cosmological Phenomena ---
            PrimordialNebula,       // Hypothetical nebulae from the early universe
            CosmicNebula,           // Large-scale gaseous structures in the cosmos
            ReionizationNebula,     // Nebulae from the reionization era of the universe
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum BlackHoleType {
            // --- Based on Mass ---
            StellarMassBlackHole,      // Formed from the collapse of massive stars, typically 3-20 solar masses
            IntermediateMassBlackHole, // Intermediate size, ~100-100,000 solar masses, observed in dense star clusters
            SupermassiveBlackHole,     // Millions to billions of solar masses, located at galaxy centers (e.g., Sagittarius A*)
            PrimordialBlackHole,       // Hypothetical, formed in the early universe, could range from subatomic to planetary masses
            MiniBlackHole,             // Hypothetical black holes with masses smaller than a star, possibly from cosmic string loops

            // --- Based on Spin ---
            SchwarzschildBlackHole,    // Non-rotating, described by Schwarzschild geometry
            KerrBlackHole,             // Rotating black hole, has frame-dragging effects
            KerrNewmanBlackHole,       // Rotating black hole with electric charge
            ReissnerNordstromBlackHole,// Charged, non-rotating black hole, hypothetical due to likely charge neutralization

            // --- Based on Charge ---
            ChargedBlackHole,          // General term for black holes with electric charge
            ExtremalBlackHole,         // A black hole with maximum charge or spin allowed by general relativity

            // --- Based on Accretion ---
            QuiescentBlackHole,        // Dormant, not actively accreting material, hard to detect
            ActiveBlackHole,           // Actively accreting matter, often observed as AGNs or quasars
            Microquasar,               // Stellar-mass black hole with relativistic jets (e.g., GRS 1915+105)

            // --- Based on Relativistic Effects ---
            NakedSingularity,          // Hypothetical, singularity visible without an event horizon, violating cosmic censorship hypothesis
            PlanckScaleBlackHole,      // Hypothetical, quantum-sized black holes at the Planck mass/length scale

            // --- Based on Environment ---
            BinaryBlackHole,           // Pair of black holes orbiting each other, often sources of gravitational waves
            TripleBlackHoleSystem,     // Three black holes in a gravitationally bound system
            GalacticCoreBlackHole,     // Located in the centers of galaxies, synonymous with supermassive black holes
            RogueBlackHole,            // Black holes moving through interstellar space, not gravitationally bound to a galaxy
            IntergalacticBlackHole,    // Black holes found in the space between galaxies

            // --- Based on Emissions ---
            XRayBinaryBlackHole,       // Black hole in a binary system emitting X-rays (e.g., Cygnus X-1)
            GammaRayBurstBlackHole,    // Hypothetical, formed during long gamma-ray bursts from collapsing stars
            GravitationalWaveSource,   // Black holes detected through emitted gravitational waves (e.g., GW150914)

            // --- Exotic and Hypothetical Black Holes ---
            WormholeBlackHole,         // Hypothetical black hole that connects two spacetime regions (Einstein-Rosen bridge)
            WhiteHole,                 // Hypothetical "time-reversed" black hole that ejects matter instead of absorbing it
            Fuzzball,                  // String theory-based model of black holes, replacing singularities with quantum fuzz
            FireWallBlackHole,         // Hypothetical, with high-energy "firewalls" near the event horizon
            Gravastar,                 // Hypothetical alternative to black holes with no event horizon, supported by exotic matter
            DarkMatterBlackHole,       // Hypothetical black holes formed primarily from dark matter
            QuantumBlackHole,          // Hypothetical, governed by quantum mechanics, especially at very small scales
            HolographicBlackHole,      // Hypothetical, described using holographic principles of spacetime
            ExoticChargedBlackHole,    // Hypothetical, formed by exotic particles with unique charges
            BosonStarBlackHole,        // Hypothetical, involving collapse of bosonic fields instead of fermionic matter
            ExoticCompactObject, // Hypothetical alternatives to black holes without singularities (e.g., gravastars)

            // --- Cosmological Black Holes ---
            DarkEnergyBlackHole,       // Hypothetical, with properties influenced by dark energy
            MultiverseBlackHole,       // Hypothetical, linking to other universes in a multiverse
            BigBangRemnantBlackHole,   // Hypothetical black holes formed from the Big Bang singularity
            CosmologicalConstantBlackHole, // Hypothetical, properties influenced by the universe's cosmological constant

            // --- Based on Observational Phenomena ---
            BlazarBlackHole,           // Supermassive black holes emitting relativistic jets pointed at Earth
            QuasarBlackHole,           // Bright active galactic nuclei powered by accreting supermassive black holes
            RadioLoudBlackHole,        // Emits significant radio waves, often associated with jets
            MagnetizedBlackHole,       // Black holes with powerful magnetic fields influencing their environment
            PolarJetBlackHole,         // Black holes emitting highly collimated polar jets

            // --- Based on Interaction ---
            StellarDisruptionBlackHole,// Black hole disrupting nearby stars via tidal forces
            HypernovaProgenitorBlackHole, // Black hole formed during hypernova events
            AccretingIntermediateBlackHole, // Intermediate black holes actively accreting matter
            ClusterCoreBlackHole,      // Black hole found in the dense cores of star clusters

            // --- Other Specialized Types ---
            HawkingRadiationBlackHole, // Hypothetical evaporating black holes emitting Hawking radiation
            EvaporatingMiniBlackHole,  // Small black holes losing mass via Hawking radiation
            Collapsar,                 // A specific type of black hole formed during a collapsing massive star
            PseudoBlackHole,           // Hypothetical objects mimicking black hole properties without a true event horizon
            SpinFlippedBlackHole,      // Black holes that undergo spin-flip events due to accretion or mergers
            UltraMassiveBlackHole,     // Extremely large black holes beyond the typical supermassive range (>100 billion solar masses)
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum ColonyType {
            // --- Current and Near-Future Scales ---
            Hamlet,        // Less than 100 people, tiny rural collection of homes.
            Village,       // 100 - 1,000 people, small, close-knit community.
            Town,          // 1,000 - 20,000 people, larger, some specialized services.
            SmallCity,     // 20,000 - 100,000 people, distinct urban centers.
            City,          // 100,000 - 300,000 people, significant urban areas.
            LargeCity,     // 300,000 - 1 million people, major regional hubs.
            Metropolis,    // 1 million - 5 million people, culturally and economically significant.
            Megalopolis,   // 5 million+ people, vast urban sprawl or merged metropolitan regions.

            // --- Far-Future Hypothetical Scales ---
            Ecumenopolis,      // A single, planet-wide city, population in the trillions.
            ArcologyWorld,     // Self-contained megastructures the size of small moons or planets, population in billions to trillions.
            Stellaris,         // System-wide development of interconnected ecumenopolises or other large centers, trillions upon trillions.
            DysonCity,         // Built around a star, potentially in the quadrillions, part of a Dyson Sphere or Swarm.
            GalacticCoreCity,  // Built within or around dense star clusters at the galaxy’s core, incomprehensible population.
            NexusCivilization, // Spanning multiple star systems or galaxies, populations beyond trillions.
            MacroverseMegalopolis, // Extending across multiple dimensions or universes, populations beyond meaningful comprehension.

            // --- Specialized or Thematic Types ---
            ResearchOutpost,   // Small settlements dedicated to scientific exploration and study.
            MiningColony,      // Focused on resource extraction, often in remote or dangerous locations.
            TradeHub,          // Centers for interstellar trade and commerce, varying in size.
            AgriculturalColony, // Dedicated to food production, supplying larger population centers.
            MilitaryBase,      // Strategic settlements for defense or conquest.
            RefugeeSettlement, // Temporary or permanent homes for displaced populations.
            CulturalCenter,    // Focused on arts, history, and diplomacy, often hubs for inter-civilization interaction.
            ReligiousSanctuary, // Dedicated to religious or spiritual purposes, often with unique architecture.
            LuxuryHabitat,     // Designed for the wealthy, offering unparalleled amenities and environments.
            TerraformingBase,  // Established to initiate or monitor planetary terraforming processes.
            AutonomousColony,  // Fully self-sufficient settlements, independent from external control.

            // --- Unique and Hypothetical Concepts ---
            CloudCity,         // Floating settlements in the atmospheres of gas giants or planets (e.g., Bespin in *Star Wars*).
            OceanColony,       // Built on or under oceans, thriving in aquatic environments.
            HollowPlanet,      // Colony built within a planet's interior, utilizing subterranean spaces.
            NomadicFleet,      // Mobile settlements, often composed of interconnected spaceships or space stations.
            RingworldColony,   // Settlements built along the surface of a ringworld structure (e.g., *Halo*).
            ONeillCylinder,   // Rotating space habitats designed to support millions to billions of people.
            SpaceElevatorHub,  // Colonies around the base or stations of a space elevator.
            WormholeStation,   // Settlements built around wormholes, acting as gateways to other systems.
            TesseractCity,     // Hypothetical, existing in higher dimensions beyond standard 3D space.
            DysonSwarmNode,    // A singular node in a Dyson Swarm, forming part of a larger star-encompassing system.
            HiveColony,        // Highly dense, vertical settlements optimized for maximum population within minimal space.
            QuantumHabitat,    // Hypothetical, leveraging quantum phenomena to exist in multiple locations or dimensions simultaneously.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum AncientRuinsType {
            // --- Earth-Like Civilization Ruins (Generalized for Cosmic Scales) ---
            StoneMonoliths,            // Gigantic monoliths arranged in mysterious patterns (e.g., Stonehenge).
            TempleComplex,             // Ruins of massive temples used for worship or rituals.
            UndergroundCities,         // Vast subterranean networks (e.g., Derinkuyu, expanded for planetary or cosmic scales).
            PyramidalStructures,       // Pyramids with unique alignments or purposes (e.g., Giza Pyramids).
            ZigguratRuins,             // Terraced step pyramids (e.g., Mesopotamian structures).
            ColossalStatues,           // Massive statues depicting gods, leaders, or unknown beings.
            Obelisks,                  // Tall, slender monuments, often inscribed with forgotten scripts.
            CircularStoneStructures, // Megalithic circles with astronomical significance.
            CliffsideRuins,           // Settlements carved into cliffs or mountains.
            FloatingIslands,          // Ancient, suspended ruins on levitating islands.
            FortressRuins,            // Remains of defensive structures like castles or fortresses.
            BurialChambers,           // Ancient tombs for rulers, with complex layouts and traps.
            Mausoleums,                // Massive memorials dedicated to significant figures.
            Amphitheaters,             // Ruins of grand theaters used for entertainment or rituals.
            Aqueducts,                 // Advanced water transport systems left behind by ancient civilizations.
            ShipwreckRuins,           // Ancient starships or watercraft buried under oceans or sand.

            // --- Cosmic Ruins ---
            PlanetaryRingRuins,      // Fragments of ancient structures orbiting a planet.
            DysonSphereFragments,      // Ruins of a partially collapsed Dyson Sphere.
            StellarForge,             // Ancient factories built around stars for harnessing energy.
            OrbitalMegastructures,    // Ruins of massive stations orbiting planets or stars.
            GalacticGateways,         // Collapsed or inactive wormhole structures.
            CraterCities,             // Ruins of cities built in meteor impact craters.
            MoonExcavations,          // Ancient mines or bases dug into moons.
            SunkenRuins,              // Structures submerged in alien oceans.
            FossilizedCities,         // Cities preserved in stone due to cosmic or geological events.
            SpaceArks,                // Ancient generational ships left adrift in space.
            BlackHoleTemples,        // Sacred ruins built near or around black holes.
            PlanetaryCanals,          // Massive canal systems spanning entire planets.
            NebulaShrines,            // Mysterious ruins suspended within nebulae.
            AsteroidHabitats,         // Collapsed habitats or mining stations on asteroids.
            StarseedVaults,           // Ruins holding ancient biological samples for reseeding planets.

            // --- Intergalactic Ruins ---
            InterdimensionalPortals,  // Ruins of gateways leading to other dimensions.
            GalaxySpanningBridges,   // Fragments of structures connecting galaxies.
            GravitationalTethers,     // Ruins designed to manipulate or stabilize stars.
            TheGreatSpiral,          // A helical megastructure abandoned across multiple systems.
            VoidCities,               // Ruins found in the empty space between galaxies.
            UniversalAnchors,         // Structures believed to stabilize universal constants.
            CosmicTreeTemples,       // Ruins resembling colossal trees, possibly alive once.
            TimeDilationChambers,    // Ruins where time flows differently, likely for research or defense.
            StarCradles,              // Ruins that nurtured stars, possibly for energy or life creation.

            // --- Hypothetical and Exotic Ruins ---
            QuantumPalaces,           // Ruins that phase in and out of existence.
            CrystalCathedrals,        // Structures built from enormous, glowing crystals.
            PsionicMonuments,         // Ruins built with psychic energy, still emanating mental signals.
            LightBridges,             // Collapsed structures of solidified light.
            SingularityCores,         // Ruins built to contain or harness singularities.
            PlasmaTemples,            // Glowing structures built from high-energy plasma fields.
            ShiftingLabyrinths,       // Ruins that rearrange themselves, seemingly alive.
            GeneticArks,              // Vaults preserving DNA or genetic material of ancient species.
            DreamRealms,              // Psionically created ruins existing in a dream-like state.
            DimensionalAnchors,       // Ruins stabilizing certain dimensions or timelines.
            LivingRuins,              // Bio-mechanical ruins still functioning like living organisms.

            // --- Ruins Based on Function ---
            Observatories,             // Ruins built for stargazing or cosmic observation.
            Libraries,                 // Ancient repositories of knowledge in the form of tablets, holograms, or alien media.
            Laboratories,              // Research centers, possibly dangerous due to leftover experiments.
            Foundries,                 // Gigantic factories for forging metals or starship parts.
            TradeCenters,             // Ruins of intergalactic trade hubs.
            PowerStations,            // Collapsed facilities designed to harness cosmic energy sources.
            Vaults,                    // Hidden chambers containing treasures or secrets.
            Battlefields,              // Remains of large-scale conflicts, including weapons and destroyed vehicles.
            PenalColonies,            // Ancient prisons or penal settlements.

            // --- Inspired by Earth but on a Cosmic Scale ---
            SpiralTemples,            // Temples built in spirals, symbolizing galaxies or cosmic flows.
            StepPyramids,             // Pyramidal structures on alien worlds, possibly aligned with celestial bodies.
            InfiniteMazes,            // Endless labyrinths, theorized to be used for ceremonies or trials.
            WeatheredMonoliths,       // Ancient markers eroded by cosmic winds or time.
            RuinedBiospheres,         // Collapsed domes once sustaining life.
            LavaSubmergedTemples,    // Structures built near or submerged in magma flows.
            IceCities,                // Ruins frozen in glaciers, preserved for eons.

            // --- Mystical or Lore-Focused Ruins ---
            Godshrines,                // Ruins dedicated to unknown deities, with no recognizable language.
            Warshrines,                // Memorials to wars fought long ago, still radiating hostility.
            EternityVaults,           // Ruins believed to hold secrets to immortality.
            StasisChambers,           // Ruins with functioning cryogenic systems.
            TeleportationRelics,      // Devices for instant travel, now broken or unstable.
            RelicSpires,              // Massive spires left as cultural symbols or warnings.
            ShadowRuins,              // Only visible under specific wavelengths or dimensions.

            // --- Ruins from Past Galactic Empires ---
            PrecursorsCities,        // Left behind by the oldest known galactic civilizations.
            ForerunnerOutposts,       // Remote bases of ancient explorers or conquerors.
            EmpireCapitals,           // Former capitals of galaxy-spanning empires.
            CollapsedThrones,         // Massive structures symbolizing ancient imperial authority.

            // --- Unique and Rare Ruins ---
            MemoryTemples,            // Ruins with artifacts capable of replaying the past.
            ZerogGardens,            // Gardens floating in zero gravity, abandoned and overgrown.
            CosmicNurseries,          // Ruins designed for creating or nurturing life on a galactic scale.
            VoidTemples,              // Ruins only accessible by traversing dangerous anomalies.
            TerraformingEngines,      // Gigantic devices left behind after planetary modifications.
            ArtifactVaults,           // Secure chambers holding mysterious and powerful relics.
            EnergyWells,              // Ruins containing massive reservoirs of ancient energy.
            ChronoHalls,              // Time-bending ruins where history is physically layered.
            InterstellarGraveyards,   // Burial grounds for intergalactic species, spanning entire planets.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum ArtifactType {
            // --- Earth-Inspired Artifacts (Generalized for Cosmic Scales) ---
            StoneRelic,              // Simple carved stones with symbols or inscriptions.
            CeremonialDagger,        // Ornate daggers used in ancient rituals.
            RitualMask,              // Masks crafted for ceremonial or religious purposes.
            Scepter,                 // Symbol of power and authority.
            Crown,                   // Decorative headpiece indicating rulership.
            Amulet,                  // Worn for protection, luck, or mystical power.
            Idol,                    // Small statues representing gods or mythical beings.
            Scroll,                  // Written records or spells preserved on ancient material.
            ObsidianBlade,          // Razor-sharp tools or weapons carved from volcanic glass.
            Chalice,                 // Ornate cup used in sacred rituals or ceremonies.
            Totem,                   // Carved poles or objects representing ancestral spirits.

            // --- Technological Artifacts ---
            HolographicCodex,       // Interactive records stored as holograms.
            StarshipCore,           // The engine or heart of an ancient starship.
            EnergyCrystal,          // Crystals capable of storing or emitting vast amounts of energy.
            TerraformingModule,     // Devices used to modify planetary conditions.
            PlasmaForge,            // Advanced tools for creating weapons or structures.
            NeuralInterface,        // Devices allowing direct connection to the brain.
            AntiGravityGenerator,  // Artifacts capable of nullifying gravity.
            QuantumProcessor,       // Advanced computing devices using quantum states.
            WormholeKey,            // Device used to activate or stabilize wormholes.
            ShieldEmitter,          // Portable devices capable of creating energy shields.
            NanoSwarmCapsule,      // Capsules containing swarms of self-replicating nanomachines.

            // --- Mystical and Religious Artifacts ---
            CosmicOrb,              // Glowing spheres radiating mysterious energy.
            EternalFlame,           // Flames that burn without fuel and never extinguish.
            RelicofImmortality,    // Artifact rumored to grant eternal life.
            PsionicAmplifier,       // Devices enhancing psychic or mental powers.
            AstralCompass,          // A tool for navigating through dimensions or planes.
            DivineTablet,           // Inscribed with knowledge from an advanced or divine source.
            SoulGem,                // Crystals believed to house the essence of living beings.
            SpiritBeacon,           // Artifacts used to summon or communicate with spirits.
            ChaliceOfEternity,     // Mythical cup said to grant endless vitality.
            RuneStone,              // Carved stones imbued with magical inscriptions.

            // --- Weapons and Armory ---
            Starblade,               // Blades forged with advanced or mystical materials.
            GravityHammer,           // Weapon capable of manipulating gravitational fields.
            PlasmaBow,               // Bow firing energy-based projectiles.
            PhaseRifle,              // Gun firing phased energy that bypasses matter.
            CryoGauntlet,            // Glove capable of freezing objects or enemies.
            EnergyLance,             // A spear-like weapon made of pure energy.
            ArcBlade,                // Weapon generating arcs of electricity upon impact.
            BlackHoleGrenade,        // Portable device creating miniature singularities.
            ShadowCloak,             // Armor that renders the wearer nearly invisible.
            StellarShield,           // Defensive artifact capable of blocking cosmic energy.

            // --- Cosmic and Intergalactic Artifacts ---
            DysonFragment,           // Pieces of a Dyson Sphere imbued with ancient technology.
            StarlightPendant,        // Jewelry radiating the light of a captured star.
            NebulaPrism,             // Crystals infused with the colors and energy of a nebula.
            ChronoRelic,             // Device capable of manipulating time.
            SingularityCore,         // Object containing the energy of a black hole.
            StellarCodex,            // Encyclopedia of galactic knowledge encoded in light.
            GravitonAnvil,           // Device used for crafting using gravitational forces.
            PlanetseedCapsule,       // Artifact containing the means to create life on a barren planet.
            VoidKey,                 // Device granting access to interdimensional spaces.
            CelestialMap,            // Ancient star charts that reveal hidden pathways in space.

            // --- Ancient Empire Artifacts ---
            CrownOfThePrecursors,    // Worn by rulers of the first galactic civilizations.
            ForerunnerBeacon,        // Devices used to summon or guide ships across galaxies.
            EmpireSeal,              // Symbol of authority for an ancient interstellar empire.
            EternalThrone,           // Artifact believed to enhance rulership over vast territories.
            GalacticArchive,         // Repository of knowledge from an ancient civilization.
            WarEngineCore,           // Power source for colossal war machines.
            StellarBeacon,           // Guiding light for ancient interstellar travel.
            SolarLance,              // A weapon capable of harnessing the power of a star.
            LegacyArtifact,          // Item passed down through generations of rulers.

            // --- Hypothetical and Exotic Artifacts ---
            QuantumMirror,           // Reflects alternate timelines or universes.
            InfiniteKey,             // Unlocks any door, physical or metaphysical.
            EnergyRibbon,            // Artifact that appears as a shimmering band of light.
            ChronoSphere,            // Manipulates local or universal time.
            VoidPrism,               // An artifact that absorbs and nullifies energy.
            PsionicLens,             // Enhances or focuses mental energy.
            CosmicTether,            // Links two points in space or time.
            PlanarAnchor,            // Stabilizes dimensional rifts or interdimensional gates.
            PlasmaHeart,             // Artifact that acts as an unlimited power source.
            DreamcatcherRelic,       // Collects and stores psychic or dream energy.

            // --- Functional Artifacts ---
            StasisPod,               // Devices capable of suspending living beings in time.
            TranslatorStone,         // Enables communication across any language.
            HealingStone,            // Emits energy that heals wounds and illnesses.
            MolecularReconstructor,  // Repairs or rebuilds objects at a molecular level.
            EnvironmentalModulator,  // Adapts surroundings to support life or terraform areas.
            LightCapsule,            // Emits a constant, undying light source.
            OrbitalBeacon,           // Signals across vast distances in space.
            TerraformingSphere,      // Miniature device used for large-scale environmental change.
            DimensionalShard,        // Stabilizes or manipulates interdimensional portals.
            RelicOfMemory,           // Records and replays ancient events or messages.

            // --- Unique and Rare Artifacts ---
            HeartOfTheGalaxy,        // A legendary artifact said to control entire star systems.
            EyeOfTheVoid,            // Grants the ability to see into other dimensions.
            ShardOfInfinity,         // Believed to contain infinite energy or knowledge.
            StarbornRelic,           // An artifact found at the heart of a dying star.
            OrbOfCreation,           // Mythical artifact said to create worlds.
            VeilOfShadows,           // Grants invisibility and shrouds the wearer in darkness.
            TitansHelm,              // Helmet said to enhance physical and mental abilities.
            AuroraCrystal,           // Radiates the colors and energy of an aurora.
            EternalEngine,           // Perpetual motion machine of unknown origin.
            CrownOfStars,            // A crown that glows with the light of miniature stars.

            // --- Mystical and Metaphysical Artifacts ---
            EtherialTalisman,        // Exists partially in another plane of existence.
            SoulShard,               // Contains the fragmented essence of a being.
            VoidRelic,               // Emits an unsettling void energy, possibly alive.
            ParadoxCube,             // Manipulates reality, often with unpredictable results.
            RealityAnchor,           // Prevents dimensional shifts or reality warping.
            PhoenixCore,             // Artifact that regenerates itself and its user.
            OmegaLens,               // Allows the user to perceive the entire universe at once.
            InfinityStone,           // A cosmic artifact representing an aspect of the universe.
            UniversalKey,            // Unlocks pathways to higher planes of existence.
            RelicOfTheAllKnowing,    // Grants glimpses of infinite knowledge.

            // --- Artifacts from Extinct Civilizations ---
            ForerunnerRelic,         // Item left by an ancient advanced civilization.
            WarLordsBlade,           // Weapon used in interstellar conquest.
            AncientDataCore,         // Contains fragmented knowledge of a lost civilization.
            SealedCryptKey,          // Unlocks hidden burial sites or tombs of rulers.
            CivilizationCodex,       // Documents an entire civilization’s history and culture.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum BuildingType {
            // --- Earth-Inspired Building Types ---
            VillageHut,              // Small, simple shelters for basic living.
            Cottage,                 // Small rural homes with natural materials.
            Townhouse,               // Urban multi-level homes for families.
            Manor,                   // Large homes for the wealthy, often historical.
            Fortress,                // Defensive structures with walls and towers.
            Watchtower,              // Towers for observation and defense.
            Castle,                  // Large, fortified homes of rulers or nobles.
            Cathedral,               // Massive places of worship with intricate designs.
            Amphitheater,            // Open-air venues for performances or gatherings.
            Bazaar,                  // Open marketplaces for trade and commerce.
            Aqueduct,                // Structures for transporting water.
            Lighthouse,              // Tall towers with lights for guiding ships.
        
            // --- Urban and Modern Building Types ---
            Skyscraper,              // High-rise buildings with offices or residences.
            Mall,                    // Large complexes for retail and entertainment.
            TrainStation,            // Hubs for public transport networks.
            Airport,                 // Facilities for air travel and logistics.
            Hospital,                // Centers for medical treatment and research.
            School,                  // Facilities for education and learning.
            Library,                 // Buildings for storing and accessing knowledge.
            PowerPlant,              // Energy-generating facilities, such as nuclear or solar.
            Stadium,                 // Large venues for sports and entertainment.
            IndustrialFactory,       // Factories for manufacturing goods.
            Laboratory,              // Buildings for scientific research.
        
            // --- Futuristic and Sci-Fi Buildings ---
            Arcology,                // Self-sustaining megastructures combining residential, commercial, and natural spaces.
            SpacePort,               // Facilities for launching and receiving spacecraft.
            SpaceStation,               //explain why lol
            BioDome,                    // Enclosed habitats for life support and agriculture.
            StarshipHangar,             // Facilities for housing and repairing starships.
            AIHub,                      // Centralized buildings housing artificial intelligence systems.
            QuantumComputingCenter,     // Advanced buildings for quantum research and development.
            NanotechFoundry,            // Facilities for manufacturing nanotechnology.
            HoverwayTerminal,           // Transportation hubs for hover vehicles.
            ZeroGravityArena,           // Structures for recreational activities in zero gravity.
            TerraformingControlCenter,  // Buildings used to manage planetary transformation processes.
            CryogenicStorageFacility,   // Buildings for storing biological samples or people in stasis.

            // --- Galactic Civilization Structures ---
            DysonStation,               // Habitats or facilities built on Dyson Swarms.
            OrbitalRing,                // Large structures encircling a planet in orbit.
            StellarObservatory,         // Advanced telescopes observing cosmic phenomena.
            WormholeGate,               // Portals for interstellar travel.
            PlanetaryDefenseArray,      // Structures protecting planets from external threats.
            StarForge,                  // Massive factories for producing ships and weapons using stellar energy.
            BlackHoleResearchStation,   // Facilities studying black holes and singularities.
            AntimatterRefinery,         // Buildings for producing and storing antimatter.
            SpaceElevatorTerminal,      // Base stations for planetary space elevators.
            InterstellarEmbassy,        // Diplomatic hubs for intergalactic relations.

            // --- Mystical and Metaphysical Buildings ---
            CrystalSpire,               // Tower-like structures made from glowing crystals.
            PsionicTemple,              // Places enhancing psychic abilities and training.
            AstralGateway,              // Portals for travel to other dimensions or planes.
            SoulArchive,                // Facilities storing the essences or memories of beings.
            EternalFlameShrine,         // Buildings housing never-extinguishing flames.
            ShadowCathedral,            // Dark structures that manipulate light and shadows.
            EtherialSanctum,            // Buildings that exist partially in another dimension.
            DreamNexus,                 // Structures used to connect and explore collective dreams.
            RealityAnchorSpire,         // Buildings stabilizing reality in chaotic environments.

            // --- Industrial and Specialized Buildings ---
            MiningFacility,             // Structures for extracting planetary or asteroid resources.
            Refinery,                   // Facilities for processing raw materials.
            FactoryComplex,             // Large-scale manufacturing centers.
            ResearchOutpost,            // Small research stations in remote locations.
            AgriculturalFacility,       // Buildings for growing food and sustaining life.
            HydroelectricPlant,         // Energy facilities using water currents.
            SolarFarm,                  // Large-scale solar energy collectors.
            OrbitalDockyard,            // Shipyards for constructing and repairing spacecraft.
            Megaforge,                  // Facilities for producing colossal industrial materials.
            WeatherControlCenter,       // Facilities for modifying or regulating planetary weather.

            // --- Civic and Cultural Buildings ---
            GalacticSenate,             // Centralized government structures for galactic administration.
            CulturalMuseum,             // Buildings preserving art, history, and artifacts.
            ConcertHall,                // Venues for performances and cultural events.
            PlanetaryArchive,           // Facilities for storing planetary or intergalactic history.
            HallOfHeroes,               // Buildings honoring significant figures in history.
            UnityMonument,              // Iconic structures symbolizing peace and cooperation.
            GrandLibrary,               // Facilities holding vast intergalactic knowledge.
            WarMemorial,                // Structures commemorating past conflicts.
            TradeGuildHall,             // Hubs for interstellar trade negotiations.

            // --- Unique and Exotic Structures ---
            FloatingCitadel,            // Massive structures hovering over land or oceans.
            SubterraneanCity,           // Entire cities built underground.
            LavaFortress,               // Structures built near or within volcanic regions.
            IcePalace,                  // Buildings carved out of frozen landscapes.
            SkyBridge,                  // Structures connecting floating or elevated platforms.
            BioTower,                   // Buildings incorporating living organisms into their structure.
            TemporalObservatory,        // Structures monitoring time anomalies.
            CloudCity,                  // Habitats floating within planetary atmospheres.
            OrbitalBeacon,              // Structures broadcasting signals across space.
            NebulaHabitat,              // Buildings suspended within colorful nebulae.

            // --- Hypothetical and Extraterrestrial Structures ---
            HiveTower,                  // Massive structures built by insect-like species.
            PlasmaDome,                 // Buildings encased in high-energy plasma fields.
            GravitationalFortress,      // Structures utilizing gravity as defense or power.
            LivingBuilding,             // Bio-engineered structures that grow and repair themselves.
            ThoughtSanctum,             // Structures storing collective memories or ideas of a civilization.
            MegaSphere,                 // Spherical structures housing entire ecosystems.
            EnergyNexus,                // Buildings acting as hubs for galactic energy distribution.
            StarCathedral,              // Religious structures built around stars.
            InterdimensionalHub,        // Structures connecting various dimensions or planes.
            VoidFortress,               // Buildings suspended in deep space near voids or anomalies.
            CelestialForge,             // Buildings capable of crafting celestial or planetary bodies.

            // --- Ruins and Decayed Structures ---
            AncientRuins,               // Collapsed or partially intact structures from lost civilizations.
            ForgottenVault,             // Underground buildings holding treasures or secrets.
            CrumbledMonolith,           // Towering structures reduced to rubble.
            GhostCity,                  // Abandoned urban areas with remnants of life.
            FossilizedTemple,           // Buildings turned to stone by time and cosmic forces.
            CollapsedRingworld,         // Ruins of enormous ringworlds now broken and scattered.
            OvergrownShrine,            // Sacred places overtaken by alien flora.

            // --- Miscellaneous Buildings ---
            StarHarbor,                 // Ports for interstellar travelers and trade.
            RefugeeShelter,             // Temporary buildings for displaced populations.
            EnergyCollector,            // Facilities harvesting energy from cosmic phenomena.
            WarBastion,                 // Structures designed for galactic-scale defense.
            MemoryCrypt,                // Structures storing the preserved memories of a civilization.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum UnitType {
            // --- Infantry Units (Basic Ground Forces) ---
            WorkerDrone,             // Basic labor unit for resource gathering and construction.
            InfantryMarine,          // Standard foot soldier equipped with ranged weapons.
            ShockTrooper,            // Heavily armed and armored close-combat unit.
            Scout,                   // Light, fast unit used for reconnaissance.
            Sniper,                  // Long-range precision unit specialized in eliminating targets.
            Medic,                   // Unit dedicated to healing or repairing others.
            FlamethrowerTrooper,     // Infantry equipped with flame-based weapons for area damage.
            RocketTrooper,           // Infantry with anti-armor or anti-air capabilities.
            StealthOperative,        // Cloaked or invisible unit specialized in sabotage and assassination.
            PsionicWarrior,          // Infantry with telekinetic or telepathic powers.

            // --- Specialized Ground Units ---
            ExosuitOperator,         // Infantry using powered armor for enhanced strength and durability.
            CyborgSoldier,           // Half-organic, half-mechanical soldiers with advanced capabilities.
            Engineer,                // Unit capable of building, repairing, or hacking structures and vehicles.
            DemolitionsExpert,       // Unit specializing in explosives and structure sabotage.
            BioInfantry,            // Genetically engineered soldiers designed for specific roles.
            CombatMech,              // Lightly armored mechs used for frontline combat.

            // --- Mechanized Units (Ground Vehicles) ---
            LightScoutVehicle,       // Fast, lightly armored vehicle for reconnaissance.
            ArmoredTransport,        // Vehicle for carrying infantry or supplies.
            SiegeTank,               // Heavy, long-range artillery unit.
            AssaultWalker,           // Bipedal mech armed with heavy weapons.
            AntiAircraftCrawler,    // Ground unit specialized in taking down air targets.
            HoverTank,               // Advanced vehicle with hover capabilities for terrain traversal.
            StealthTank,             // Cloaked vehicle designed for ambush tactics.
            MobileShieldGenerator,   // Unit providing area defense with energy shields.
            MissileLauncherVehicle,  // Vehicle specialized in long-range missile attacks.

            // --- Aerial Units ---
            LightFighter,            // Agile, fast aircraft for dogfighting and interception.
            Bomber,                  // Aircraft specializing in area-of-effect ground attacks.
            Gunship,                 // Heavy aerial unit armed with multiple weapons for ground support.
            Carrier,                 // Large airship capable of deploying smaller units or drones.
            InterceptorDrone,        // Small, fast units launched from carriers for quick strikes.
            SurveillanceDrone,       // Unmanned unit for scouting and reconnaissance.
            CloakedBomber,           // Stealth-capable bomber for precision strikes.
            OrbitalStrikeFighter,    // Spacecraft capable of atmospheric and orbital bombardments.
            PsionicAirship,          // Aircraft powered by telepathic or psychic energy.

            // --- Naval Units (Water-Based or Atmospheric Water Units) ---
            PatrolBoat,              // Small, fast watercraft for scouting or skirmishes.
            SubmersibleDestroyer,    // Submarine equipped with torpedoes and stealth capabilities.
            SeaBattleship,              // Heavy naval unit with powerful long-range cannons.
            AircraftCarrier,         // Watercraft that deploys and supports air units.
            AmphibiousTransport,     // Naval unit capable of deploying ground forces.
            KrakenClassSubmarine,  // Massive submersible unit for stealth and destruction.

            // --- Advanced and Experimental Units ---
            TitanMech,               // Gigantic mech unit capable of devastating ground forces.
            EnergyConstruct,         // Artificial energy-based unit, such as sentient plasma beings.
            NanobotSwarm,            // Swarm of nanomachines capable of overwhelming targets or repairing allies.
            GravWalker,              // Large mech using anti-gravity for enhanced mobility.
            TemporalAssaultUnit,     // Unit capable of manipulating time during combat.
            BlackHoleArtillery,      // Experimental weapon capable of generating miniature singularities.
            AdaptiveUnit,            // Unit capable of evolving or upgrading mid-battle based on the enemy.
            AIOverlord,             // Advanced, self-aware AI directing mechanical forces on the battlefield.
            HiveMindAvatar,         // Biological unit representing and controlling a hive-minded race.

            // --- Space Units (Fleet and Starships) ---
            FighterCraft,            // Basic space fighter for dogfighting and escort missions.
            Corvette,                // Light, fast ship with moderate weaponry for skirmishes.
            Frigate,                 // Medium-sized ship for multi-purpose roles.
            Destroyer,               // Heavily armed and armored ship for assault missions.
            Cruiser,                 // Large ship with balanced offensive and defensive capabilities.
            Battleship,              // Massive ship with heavy armament and armor.
            CarrierShip,             // Large vessel capable of deploying fighters, bombers, or drones.
            Dreadnought,             // Super-massive ship designed to dominate the battlefield.
            StealthShip,             // Cloaked vessel for infiltration and assassination missions.
            PsionicFlagship,         // Spacecraft controlled or powered by psionic abilities.
            PlanetKiller,            // Superweapon ship designed to destroy entire planets.

            // --- Support Units ---
            FieldMedic,              // Ground unit specialized in healing or reviving.
            SupplyDrone,             // Aerial unit delivering resources or repairs.
            ShieldGeneratorBot,      // Unit providing mobile energy shields to allies.
            TacticalSensorBot,       // Unit enhancing visibility and detection of cloaked enemies.
            FieldCommander,          // Tactical unit enhancing morale and coordination.

            // --- Hero Units ---
            GalacticCommander,      // High-ranking hero capable of inspiring troops and commanding fleets.
            PsionicChampion,        // Hero with unparalleled psychic abilities for combat and strategy.
            MechGeneral,            // Pilot of a massive, unique mech for leading assaults.
            TemporalGuardian,       // Hero with time-manipulation abilities, both offensively and defensively.
            ShadowAssassin,         // Elite stealth unit capable of single-handedly eliminating high-value targets.
            BattlePriest,           // Hero specializing in healing and enhancing troops while fighting.
            StarbornWarrior,        // Alien hero with celestial powers, embodying the strength of stars.
            HiveQueen,              // Leader of a hive-mind race, capable of spawning units in combat.
            ArtifactWarden,         // Hero with mastery over ancient technologies or relics.
            CosmicSentinel,         // Hero defending key intergalactic locations, with immense firepower.

            // --- Supermassive Units ---
            WorldEngine,             // Planet-sized construct used for terraforming or destruction.
            StellarFortress,        // Stationary structure that serves as a weaponized star.
            DysonSphereUnit,         // A massive defensive or offensive structure utilizing the power of a star.
            VoidLeviathan,          // Gigantic biological or mechanical entity capable of consuming fleets.
            InterdimensionalBehemoth, // A unit that phases between dimensions, causing massive destruction.
            GalacticTitan,          // Massive, humanoid war machines used to conquer entire worlds.
            WormholeColossus,       // Unit capable of creating wormholes for strategic travel or destruction.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum FleetType {
            // --- Small-Scale Fleets ---
            ScoutFleet,             // Small fleet for reconnaissance and exploration.
            PatrolFleet,            // A small group of ships patrolling borders or regions.
            TradeConvoy,            // Fleet dedicated to transporting goods and resources.
            ExplorationFleet,       // Designed to discover new planets, systems, and phenomena.
            CourierFleet,           // Fast-moving fleet for delivering messages or small cargo.
            EscortFleet,            // Small fleet assigned to protect vulnerable ships like trade convoys.

            // --- Medium-Sized Fleets ---
            DefenseFleet,           // Fleet assigned to defend a specific planet or star system.
            InvasionTaskForce,      // A tactical fleet for planetary invasions.
            StrikeForce,            // Specialized fleet for rapid, high-impact strikes.
            ResourceHarvestingFleet,// Fleet designed for mining and gathering resources in asteroid belts or gas giants.
            ScienceExpeditionFleet, // Fleet equipped with labs and observation equipment for research.
            TerraformingFleet,      // Fleet carrying equipment and resources to terraform planets.
            ReliefFleet,            // Fleet carrying supplies, medical aid, and support for disaster-stricken colonies.
            ColonyFleet,            // Fleet carrying settlers, supplies, and equipment to establish new colonies.
            CovertOpsFleet,         // Stealth fleet for reconnaissance, espionage, or sabotage.

            // --- Large-Scale Fleets ---
            BattleGroup,            // A balanced fleet of ships prepared for combat.
            CarrierFleet,           // Fleet centered around carrier ships, deploying fighters and bombers.
            AssaultFleet,           // Offensive fleet designed for large-scale assaults on enemy strongholds.
            BlockadeFleet,          // Fleet assigned to enforce a blockade on enemy systems or planets.
            SupportFleet,           // Fleet equipped with repair, refueling, and medical ships.
            TransportFleet,         // Massive fleet for moving large amounts of cargo or personnel.
            DiplomaticFleet,        // Fleet carrying ambassadors, diplomats, and peace envoys.
            RefugeeFleet,           // A civilian fleet evacuating populations from dangerous regions.
            HybridFleet,            // A multi-purpose fleet combining combat, support, and transport capabilities.

            // --- Galactic-Scale Fleets ---
            Armada,                 // A massive fleet consisting of thousands of ships, used for intergalactic war.
            ExpeditionaryForce,     // Large-scale fleet sent to explore and establish footholds in unknown regions.
            PlanetarySiegeFleet,    // Fleet equipped with planet-destroying or terraforming weapons.
            ImperialFleet,          // A core fleet used by a dominant interstellar empire to maintain control.
            PsionicFleet,           // Fleet powered or controlled by psionic energy.
            HiveFleet,              // A bio-mechanical fleet controlled by a hive mind, often organic in nature.
            SwarmFleet,             // Thousands of small, autonomous ships acting as a single, overwhelming force.
            DysonSphereFleet,       // Fleet designed to build, maintain, or exploit Dyson Sphere megastructures.
            IntergalacticRelayFleet,// Fleet tasked with establishing and maintaining wormhole or relay networks.
            DimensionalFleet,       // Fleet capable of traversing alternate dimensions or planes of existence.

            // --- Specialized Fleets ---
            MedicalFleet,           // Fleet fully dedicated to medical aid and research.
            IntelligenceFleet,      // Fleet gathering information and monitoring enemy movements.
            PirateFleet,            // Fleet operated by pirates or smugglers.
            MercenaryFleet,         // Fleet available for hire, offering military or support services.
            DiplomaticEscortFleet,  // Fleet accompanying high-value diplomatic missions.
            ExperimentalFleet,      // Fleet testing new technologies and prototypes.
            SacredFleet,            // Religious fleet protecting holy sites or relics.
            SalvageFleet,           // Fleet specializing in recovering derelict ships and artifacts.
            ArtifactHuntingFleet,   // Fleet searching for ancient ruins or powerful artifacts.

            // --- Supermassive Fleets ---
            GalacticSupremacyFleet, // Ultimate fleet aiming to dominate or conquer entire galaxies.
            TitanFleet,             // Fleet composed of massive ships like dreadnoughts and world engines.
            ArkFleet,               // Fleet carrying the remnants of a civilization, designed to restart life elsewhere.
            WorldCarrierFleet,      // Fleet transporting planetary fragments or artificial habitats.
            QuantumFleet,           // Fleet capable of quantum teleportation across vast distances.
            ChronoFleet,            // Fleet capable of manipulating or traveling through time.
            AscendantFleet,         // Mystical or godlike fleet, rumored to transcend physical boundaries.

            // --- Civilian Fleets ---
            TradeFleet,             // Fleet designed for large-scale interstellar commerce.
            MigrationFleet,         // Fleet transporting entire populations to new worlds.
            FestivalFleet,          // A cultural fleet spreading art, music, and traditions across systems.
            MiningFleet,            // Fleet dedicated to extracting resources from celestial bodies.
            LeisureFleet,           // Luxury ships providing entertainment and tourism.
            EducationalFleet,       // Fleet acting as mobile universities or research institutes.

            // --- Hybrid or Unique Fleets ---
            ParasiteFleet,          // Fleet designed to attach to or hijack other fleets or structures.
            AIControlledFleet,     // Fully automated fleet managed by advanced artificial intelligence.
            LivingFleet,            // Fleet composed of bio-organic ships that grow and evolve.
            ShadowFleet,            // Fleet specialized in stealth and espionage, hidden from detection.
            VoidFleet,              // Fleet designed to operate in deep space voids, far from stars or planets.
            EternalFleet,           // Fleet rumored to have existed for eons, operating beyond known space.
            ApocalypseFleet,        // Fleet carrying weapons capable of ending civilizations or even galaxies.

            // --- Heroic or Named Fleets ---
            VanguardFleet,          // Elite fleet leading the charge in exploration or battle.
            LegacyFleet,            // Ancient, legendary fleet with historical significance.
            GuardianFleet,          // Fleet protecting key assets or sacred locations.
            FirstLightFleet,        // The first fleet of a newly unified civilization, symbolizing hope and unity.
            CelestialFleet,         // Fleet said to be blessed or powered by cosmic entities.
            RevenantFleet,          // Lost fleet returning after being presumed destroyed or missing.
            TheLastFleet,         // Final remnants of a civilization’s navy, fighting for survival.
            NexusFleet,             // Central fleet coordinating the efforts of a galactic empire.

            // --- Meta-Fleets (Cosmic or Hypothetical) ---
            WormholeBridgeFleet,    // Fleet responsible for maintaining stable wormhole routes.
            StellarForgeFleet,      // Fleet designed to build or manipulate stars for power.
            GalacticTerraformingFleet, // Fleet capable of reshaping entire galaxies or star systems.
            OmniversalFleet,        // Fleet capable of traversing the multiverse, bridging universes.
            SingularityFleet,       // Fleet centered around black hole-based technology.
            GodmakerFleet,          // Fleet with the capability to create or destroy celestial bodies at will.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum ShipType {
            Fighter,                // Small, fast ships for dogfighting.
            Cruiser,                // Medium-sized ships for multi-purpose roles.
            Carrier,                // Large ships capable of deploying smaller units.
            Battleship,             // Heavily armed and armored ships for assault missions.
            Destroyer,              // Ships specialized in taking down larger targets.
            Scout,                  // Ships designed for reconnaissance.
            Transport,              // Ships for moving cargo or personnel.
            Support,                // Ships providing repair, refueling, or medical aid.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum NPCType {
            // --- Basic Civilian NPCs ---
            Civilian,               // Generic non-combatant living in settlements or colonies.
            Farmer,                 // Works in agricultural roles, providing food for the population.
            Miner,                  // Extracts resources from planets, asteroids, or moons.
            Trader,                 // Engages in buying and selling goods.
            Artisan,                // Crafts items, including weapons, armor, or art.
            Engineer,               // Maintains or builds infrastructure, ships, or machinery.
            Doctor,                 // Provides medical care for NPCs or players.
            Teacher,                // Educates and trains other NPCs or players.
            Entertainer,            // Performs music, storytelling, or other arts for morale.
            Scientist,              // Conducts research or assists with technology.

            // --- Military NPCs ---
            Recruit,                // Basic soldier or new member of a military force.
            Infantry,               // Standard ground forces equipped for combat.
            Pilot,                  // Operates spacecraft or aerial units in battles.
            Officer,                // Commands groups of soldiers or ships.
            Tactician,              // Specializes in strategy and battle planning.
            FleetCommander,        // Leads large groups of ships in space combat.
            Sniper,                 // Specialized marksman for long-range combat.
            MechPilot,              // Operates advanced mechanized units in battle.
            WarshipCaptain,        // Commands a single warship in a fleet.
            GalacticAdmiral,       // Oversees entire fleets or armadas.
            BattleAI,              // Artificial intelligence controlling military units or defense systems.

            // --- Political NPCs ---
            Governor,               // Oversees a colony or planetary settlement.
            Diplomat,               // Represents factions or civilizations in negotiations.
            Senator,                // Member of a galactic legislative body.
            Ambassador,             // Liaison between different civilizations or factions.
            Councilor,              // Advisor to leaders or decision-makers.
            Ruler,                  // King, queen, emperor, or other planetary leader.
            GalacticPresident,     // Leader of a multi-planet or interstellar federation.
            Warlord,                // Commands a militarized faction or rogue state.
            Revolutionary,          // Seeks to overthrow an existing government.
            Spy,                    // Gathers intelligence or sabotages enemies.

            // --- Economic NPCs ---
            Merchant,               // Sells goods or services.
            Banker,                 // Manages finances and currency exchanges.
            Industrialist,          // Owns and operates factories or production facilities.
            Shipwright,             // Builds and repairs starships.
            MinerForeman,           // Oversees mining operations.
            Smuggler,               // Trades illegal or restricted goods.
            BlackMarketDealer,      // Operates in hidden markets, selling rare or contraband items.
            Entrepreneur,           // Runs businesses or startups in colonies or cities.
            ResourceBroker,        // Deals in raw materials like ore or gas.

            // --- Exploratory NPCs ---
            Scout,                  // Explores unknown regions or systems.
            Surveyor,               // Maps terrain, planets, or star systems.
            Cartographer,           // Creates detailed star charts.
            ExpeditionLeader,      // Leads exploration missions to new frontiers.
            Archaeologist,          // Studies ancient ruins and artifacts.
            Xenobiologist,          // Studies alien lifeforms and ecosystems.
            Researcher,             // Conducts scientific experiments and discoveries.
            Astrophysicist,         // Studies stars, planets, and cosmic phenomena.
            RelicHunter,           // Searches for ancient artifacts or treasures.

            // --- Social and Cultural NPCs ---
            Priest,                 // Religious leader or figure.
            Cultist,                // Follower of a mysterious or dangerous faith.
            Historian,              // Records and studies past events and civilizations.
            Artist,                 // Creates visual or performance art.
            Poet,                   // Creates literary works with emotional or philosophical significance.
            DiplomaticEnvoy,       // Acts as a messenger or representative.
            Performer,              // Engages in theatrical, musical, or comedic acts.
            Philosopher,            // Explores and debates existential or ethical questions.

            // --- Criminal NPCs ---
            Bandit,                 // Operates in lawless regions, preying on the weak.
            Pirate,                 // Conducts raids and thefts in space.
            Mercenary,              // Hired gun or soldier of fortune.
            Assassin,               // Specialist in eliminating targets discreetly.
            CrimeLord,             // Leader of an organized crime syndicate.
            Hacker,                 // Specializes in infiltrating systems and networks.
            Fugitive,               // On the run from authorities or bounty hunters.
            SmugglerCaptain,       // Leads a crew in illegal trade across star systems.

            // --- Heroes and Legends ---
            ChosenOne,             // Heroic figure prophesied to save a people or system.
            RelicKeeper,           // Guardian of ancient artifacts and their secrets.
            StarKnight,            // Warrior trained in advanced combat techniques or wielding energy weapons.
            RebelLeader,           // Charismatic figure opposing an oppressive regime.
            LegendaryAdmiral,      // Renowned commander with a history of victory.
            CosmicDefender,        // Protector of entire regions or galaxies.

            // --- Alien and Exotic NPCs ---
            HiveQueen,             // Leader of a hive-mind species.
            Bioengineer,            // Alien scientist specializing in genetic manipulation.
            ShapeShifter,          // Alien capable of altering their form.
            Telepath,               // Alien or human with advanced mental abilities.
            SymbioticHost,         // Hosts alien symbiotes granting unique abilities.
            FirstContactSpecialist,// Expert in interacting with unknown species.
            SpaceNomad,            // Wandering alien, exploring and surviving on the edges of known space.
            Xenolinguist,           // Specializes in translating alien languages.

            // --- Cosmic and Mythical NPCs ---
            Ancient,                // Immortal or long-lived being with vast knowledge.
            StarforgedAvatar,      // Sentient being created from a star’s energy.
            CelestialGuardian,     // Protector of cosmic structures like Dyson Spheres.
            VoidEntity,            // Mysterious being from the empty spaces between galaxies.
            CosmicJudge,           // Interdimensional being enforcing universal laws.
            DimensionalTraveler,   // Being that moves between dimensions or realities.
            Chronomancer,           // Master of time manipulation.
            Primordial,             // One of the first beings to exist in the universe.
            StellarArchitect,      // Builder of stars, planets, or celestial megastructures.
            GalacticWarden,        // Oversees and protects a galaxy or large region.
            NexusKeeper,           // Protector of intergalactic pathways or wormholes.
            GodEmperor,            // Mythical ruler with divine power over a vast empire.
            UniversalOverseer,     // Being responsible for the balance of the universe.
            ShadowWeaver,          // Entity controlling shadowy forces across dimensions.

            // --- Support and Utility NPCs ---
            AIAssistant,           // Virtual intelligence designed to assist players or other NPCs.
            RobotWorker,           // Mechanical units performing simple tasks.
            DroneController,       // Operates drones for scouting or maintenance.
            RepairTechnician,      // Repairs vehicles, ships, or infrastructure.
            Logistician,            // Coordinates supply chains and resources.
            CommunicationOfficer,  // Handles long-range communication across systems.

            // --- Other NPCs ---
            Refugee,                // Displaced individuals seeking safety.
            Survivalist,            // Lives in harsh or remote environments.
            ColonyLeader,          // Oversees the well-being of a specific colony.
            AncientAI,             // Sentient artificial intelligence from a bygone era.
            Archivist,              // Custodian of vast libraries or data repositories.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum PlayerType {
            // --- Core Playstyles ---
            Explorer,              // Focuses on discovering new planets, systems, or phenomena.
            Strategist,            // Enjoys commanding fleets, managing resources, and planning large-scale operations.
            Builder,               // Prefers constructing colonies, megastructures, or crafting advanced items.
            Trader,                // Specializes in commerce, resource exchanges, and building trade empires.
            Diplomat,              // Seeks alliances, resolves conflicts, and engages in political intrigue.
            Warrior,               // Engages in direct combat, leading armies, or solo battles.
            Tactician,             // Excels in battlefield planning and efficient execution of strategies.
            Researcher,            // Focuses on advancing technologies, unlocking secrets, and improving systems.
            ExplorerBuilder,      // Combines exploration with construction and colonization.

            // --- Identity-Based Roles ---
            GalacticNomad,        // Constantly moves between systems, never settling in one place.
            ColonyLeader,         // Governs a specific colony, focusing on growth and sustainability.
            StarshipCaptain,      // Commands a personal starship and crew.
            FleetCommander,       // Leads a fleet in battles, exploration, or trade.
            MerchantPrince,       // Rules a vast trade empire, thriving on wealth and influence.
            Rebel,                 // Opposes major powers or empires, fighting for freedom or personal causes.
            Spy,                   // Works in secrecy, gathering intelligence and sabotaging enemies.
            BountyHunter,         // Tracks and captures high-value targets for rewards.
            Pirate,                // Operates on the fringes of society, looting and raiding.
            Smuggler,              // Transports illegal or restricted goods across borders.

            // --- Combat-Oriented Roles ---
            Soldier,               // Ground-based combat specialist, focused on infantry battles.
            MechPilot,            // Operates advanced mechanized units for ground or aerial combat.
            AcePilot,             // Skilled at aerial or space dogfighting.
            WarHero,              // Renowned for exceptional bravery and achievements in combat.
            PsionicWarrior,       // Combines physical combat with telepathic or psychic abilities.
            Assassin,              // Specializes in eliminating high-value targets covertly.
            Berserker,             // Thrives on aggressive, high-risk combat styles.
            Warlord,               // Commands armies or factions in large-scale conflicts.

            // --- Support and Utility Roles ---
            Medic,                 // Heals or supports allies in combat and exploration.
            Engineer,              // Repairs and maintains vehicles, structures, or equipment.
            Logistician,           // Manages resources, supply lines, and transportation.
            Scout,                 // Locates resources, enemies, or potential opportunities.
            FieldMechanic,        // Combines engineering with on-the-go battlefield repairs.
            Navigator,             // Excels in finding efficient routes through systems or regions.
            DataAnalyst,          // Interprets data for strategic or economic gains.

            // --- Economic and Social Roles ---
            Industrialist,         // Owns and operates factories, resource hubs, and production chains.
            DiplomatMerchant,     // Combines trade and diplomacy for mutual benefit.
            Banker,                // Manages financial systems, loans, or investments in the economy.
            CulturalIcon,         // Gains fame through entertainment, art, or public influence.
            Archaeologist,         // Uncovers and studies ancient ruins or artifacts for profit or knowledge.
            Historian,             // Documents events, civilizations, and their impact on the galaxy.

            // --- Hybrid Roles ---
            ExplorerWarrior,      // Combines exploration with combat in unknown territories.
            BuilderTactician,     // Balances colony construction with military planning.
            ScientistDiplomat,    // Focuses on scientific discovery and fostering alliances.
            EngineerExplorer,     // Combines repair expertise with exploration.

            // --- Cosmic and Metaphysical Roles ---
            PsionicMaster,        // Specializes in psychic abilities to influence events and combat.
            TemporalWanderer,     // Manipulates time to gain an edge in strategy or exploration.
            RelicSeeker,          // Dedicated to finding and unlocking ancient technologies or artifacts.
            DimensionalTraveler,  // Moves between realities, uncovering their secrets.
            Voidwalker,            // Thrives in the emptiness of deep space, exploring and surviving in hostile conditions.
            EnergyWeaver,         // Manipulates energy to shape the environment or influence battles.

            // --- Faction-Based Roles ---
            ImperialLoyalist,     // Fights to uphold a dominant empire or faction's rule.
            RebelLeader,          // Organizes resistance against oppressive powers.
            Mercenary,             // Works for the highest bidder, regardless of allegiance.
            RogueAgent,           // Operates independently, outside of established factions.
            HiveMindAvatar,      // Represents and leads a collective, often alien, consciousness.
            Cultist,               // Devoted to mysterious or dangerous ideologies.

            // --- High-Level Leadership Roles ---
            GalacticPresident,    // Oversees entire federations or alliances.
            Emperor,               // Supreme ruler of a vast interstellar empire.
            WardenOfTheVoid,    // Protector of regions bordering uncharted or dangerous space.
            StellarArchitect,     // Designs and creates megastructures or planetary systems.
            SupremeAdmiral,       // Commands massive fleets in galaxy-spanning wars.

            // --- Mythical and Legendary Roles ---
            TheChosenOne,        // A legendary figure destined to shape the galaxy’s fate.
            ArtifactKeeper,       // Protects or wields powerful ancient artifacts.
            CelestialWarrior,     // A mythical combatant rumored to possess supernatural abilities.
            CosmicWanderer,       // A solitary figure exploring the universe, leaving legends in their wake.
            NexusGuardian,        // Defends critical galactic gateways or networks.
            StarbornEntity,       // A player who transcends humanity, embodying cosmic power.
            PrimordialShaper,     // Manipulates the fabric of the universe itself.

            // --- Non-Traditional Roles ---
            AIConsciousness,      // An artificial intelligence navigating the galaxy in search of purpose.
            SymbioticPair,        // A bonded duo of player and alien entity sharing abilities.
            ColonyAI,             // Oversees and optimizes a colony’s growth and efficiency.
            ExperimentalBeing,    // A genetically or technologically altered individual.
            Freelancer,            // Operates independently, taking on diverse tasks and contracts.
            ShadowBroker,         // Specializes in collecting and selling intelligence and secrets.

            // --- Player-Created Archetypes ---
            CustomRole,            // Fully customizable role defined by the player’s imagination.
        }

    //--
    // Metadata
        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Entity {
            id: Principal,
            owner_id: Principal,
            entity_type: EntityType,
            coords: [f64; 2],
            metadata: Metadata,
        }
        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct StarCluster {
            name: String,                       // Name of the star cluster
            description: String,                // Brief description of the star cluster
            cluster_type: StarClusterType,      // Type of star cluster (e.g., OpenCluster, GlobularCluster)
            coords: [f64; 2],                   // Coordinates within the galaxy
            parent_galaxy_id: Principal,        // ID of the parent galaxy
            radius: f64,                        // Radius of the cluster in light-years
            mass: f64,                          // Mass of the cluster in solar masses
            age: f64,                           // Age of the cluster in billions of years
            star_count: usize,                  // Number of stars in the cluster
            star_types: Vec<String>,            // Types of stars in the cluster (e.g., ["O", "B", "A"])
            phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., Supernova, Nebula)
            composition: Composition,           // Composition of the cluster (e.g., gas, dust, metals)
            temperature: TemperatureRange,      // Temperature range in Kelvin
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., stars, planets, nebulae)
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Star {
            name: String,
            description: String,
            star_type: StarType,          // Enum for the type of star
            coords: [f64; 2],             // Coordinates within the cluster
            parent_cluster_id: Principal, // ID of the parent star cluster
            temperature: f64,             // Star surface temperature (Kelvin)
            luminosity: f64,              // Relative to the Sun (1.0 = Sun's luminosity)
            mass: f64,                    // Relative to the Sun (1.0 = Sun's mass)
            radius: f64,                  // Relative to the Sun (1.0 = Sun's radius)
            age: f64,                     // Age of the star in billions of years
            metallicity: f64,             // Fraction of the star's mass made up of elements heavier than helium
            rotation_speed: f64,          // Surface rotation speed (km/s)
            phenomena: Vec<Phenomenon>,   // Associated phenomena (from the Phenomenon enum)
            spectral_class: String,       // Detailed spectral classification (e.g., "G2V")
            life_stage: String,           // Life stage description (e.g., "Main Sequence", "Red Giant")
            hp: u64,                    // Hitpoints (required)
            shield: Option<u64>,        // Optional shield for defense
            can_move: Option<bool>,     // Optional flag for movement capability
            can_attack: Option<bool>,   // Optional flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Planet {
            name: String,                       // Name of the planet
            description: String,                // Brief description of the planet
            planet_type: PlanetType,            // Type of planet (e.g., Terrestrial, Gas Giant)
            coords: [f64; 2],                   // Coordinates within the star system
            parent_star_id: Principal,          // ID of the parent star
            radius: f64,                        // Radius relative to Earth (1.0 = Earth's radius)
            mass: f64,                          // Mass relative to Earth (1.0 = Earth's mass)
            gravity: f64,                       // Surface gravity in m/s²
            rotation_period: f64,               // Rotation period in Earth days
            orbital_period: f64,                // Orbital period in Earth days
            semi_major_axis: f64,               // Average distance from the parent star in AU
            eccentricity: f64,                  // Orbital eccentricity (0 = circular, 1 = highly elliptical)
            axial_tilt: f64,                    // Axial tilt in degrees
            atmosphere: Atmosphere,             // Atmospheric composition and properties
            temperature: TemperatureRange,      // Surface temperature range
            hydrosphere: Option<Hydrosphere>,   // Presence and composition of liquid water or other liquids
            geology: Geology,                   // Geological features and composition
            biosphere: Option<Biosphere>,       // Presence and type of life (if any)
            population: u64,                    // Population (if inhabited)
            resources: Vec<Resource>,           // List of resources available on the planet
            phenomena: Vec<Phenomenon>,         // Associated phenomena (e.g., volcanoes, storms)
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Moon {
            name: String,                       // Name of the moon
            description: String,                // Brief description of the moon
            moon_type: MoonType,                // Type of moon (e.g., Natural, Captured)
            coords: [f64; 2],                   // Coordinates within the star system
            parent_planet_id: Principal,        // ID of the parent planet
            radius: f64,                        // Radius relative to Earth's moon (1.0 = Moon's radius)
            mass: f64,                          // Mass relative to Earth's moon (1.0 = Moon's mass)
            gravity: f64,                       // Surface gravity in m/s²
            rotation_period: f64,               // Rotation period in Earth days
            orbital_period: f64,                // Orbital period around the parent planet in Earth days
            semi_major_axis: f64,               // Average distance from the parent planet in kilometers
            eccentricity: f64,                  // Orbital eccentricity (0 = circular, 1 = highly elliptical)
            axial_tilt: f64,                    // Axial tilt in degrees
            atmosphere: Option<Atmosphere>,     // Atmospheric composition and properties (if any)
            temperature: TemperatureRange,      // Surface temperature range
            hydrosphere: Option<Hydrosphere>,   // Presence and composition of liquid water or other liquids (if any)
            geology: Geology,                   // Geological features and composition
            biosphere: Option<Biosphere>,       // Presence and type of life (if any)
            population: u64,                    // Population (if inhabited)
            resources: Vec<Resource>,           // List of resources available on the moon
            phenomena: Vec<Phenomenon>,         // Associated phenomena (e.g., cryovolcanoes, tidal forces)
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Asteroid {
            name: String,                       // Name of the asteroid
            description: String,                // Brief description of the asteroid
            asteroid_type: AsteroidType,        // Type of asteroid (e.g., C-type, S-type, M-type)
            coords: [f64; 2],                   // Coordinates within the star system
            parent_star_id: Principal,          // ID of the parent star (if applicable)
            parent_planet_id: Option<Principal>, // ID of the parent planet (if applicable, e.g., for Trojans)
            radius: f64,                        // Radius in kilometers
            mass: f64,                          // Mass in kilograms
            gravity: f64,                       // Surface gravity in m/s²
            rotation_period: f64,               // Rotation period in Earth days
            orbital_period: f64,                // Orbital period in Earth days
            semi_major_axis: f64,               // Average distance from the parent body in AU
            eccentricity: f64,                  // Orbital eccentricity (0 = circular, 1 = highly elliptical)
            axial_tilt: f64,                    // Axial tilt in degrees
            composition: Composition,           // Composition of the asteroid
            temperature: TemperatureRange,      // Surface temperature range
            atmosphere: Option<Atmosphere>,     // Atmospheric composition and properties (if any)
            geology: Geology,                   // Geological features and composition
            resources: Vec<Resource>,           // List of resources available on the asteroid
            phenomena: Vec<Phenomenon>,         // Associated phenomena (e.g., dust trails, outgassing)
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Phenomenon {
            name: String,                       // Name of the phenomenon
            description: String,                // Brief description of the phenomenon
            phenomenon_type: PhenomenonType,    // Type of phenomenon (e.g., Nebula, Supernova)
            coords: [f64; 2],                   // Coordinates within the star system
            parent_star_id: Option<Principal>,  // ID of the parent star (if applicable)
            parent_planet_id: Option<Principal>, // ID of the parent planet (if applicable)
            parent_asteroid_id: Option<Principal>, // ID of the parent asteroid (if applicable)
            size: f64,                          // Size of the phenomenon in kilometers (e.g., diameter, radius)
            energy_output: f64,                 // Energy output in watts (e.g., luminosity, power)
            temperature: TemperatureRange,      // Temperature range in Kelvin
            composition: Composition,           // Composition of the phenomenon (e.g., gas, dust, plasma)
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., stars, planets, asteroids)
            phenomena: Vec<PhenomenonType>,     // Sub-phenomena or related phenomena
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Nebula {
            name: String,                       // Name of the nebula
            description: String,                // Brief description of the nebula
            nebula_type: NebulaType,            // Type of nebula (e.g., DarkNebula, HIIRegion)
            coords: [f64; 2],                   // Coordinates within the galaxy
            parent_galaxy_id: Principal,        // ID of the parent galaxy
            radius: f64,                        // Radius of the nebula in light-years
            mass: f64,                          // Mass of the nebula in solar masses
            age: f64,                           // Age of the nebula in millions of years
            temperature: TemperatureRange,      // Temperature range in Kelvin
            composition: Composition,           // Composition of the nebula (e.g., gas, dust, metals)
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., stars, star clusters)
            phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., StellarWinds, Supernova)
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct BlackHole {
            name: String,                       // Name of the black hole
            description: String,                // Brief description of the black hole
            black_hole_type: BlackHoleType,     // Type of black hole (e.g., StellarMassBlackHole, SupermassiveBlackHole)
            coords: [f64; 2],                   // Coordinates within the galaxy
            parent_galaxy_id: Principal,        // ID of the parent galaxy
            mass: f64,                          // Mass of the black hole in solar masses
            radius: f64,                        // Schwarzschild radius in kilometers
            spin: f64,                          // Spin parameter (0 = non-rotating, 1 = maximally rotating)
            charge: f64,                        // Electric charge (0 = neutral, non-zero = charged)
            accretion_rate: f64,                // Rate of matter accretion in solar masses per year
            temperature: f64,                   // Temperature of the event horizon in Kelvin
            luminosity: f64,                    // Luminosity in watts
            phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., AccretionDisk, RelativisticJets)
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., stars, planets, galaxies)
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        // Colony
            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Colony {
                name: String,                       // Name of the colony
                description: String,                // Brief description of the colony
                colony_type: ColonyType,            // Type of colony (e.g., Hamlet, Ecumenopolis)
                coords: [f64; 2],                   // Coordinates within the planet or system
                parent_planet_id: Principal,        // ID of the parent planet
                population: u64,                    // Population of the colony
                infrastructure: Infrastructure,     // Infrastructure details
                economy: Economy,                   // Economic details
                governance: Governance,             // Governance details
                culture: Culture,                   // Cultural details
                technology_level: u8,               // Technology level (1-10 scale)
                defenses: Defenses,                 // Defensive capabilities
                resources: Vec<Resource>,           // List of resources available in the colony
                associated_entities: Vec<Principal>, // IDs of associated entities (e.g., stars, planets, colonies)
                hp: u64,                            // Hitpoints (required)
                shield: Option<u64>,                // Optional shield for defense
                can_move: Option<bool>,             // Optional flag for movement capability
                can_attack: Option<bool>,           // Optional flag for attack capability
            }


            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Infrastructure {
                housing_capacity: u64,              // Total housing capacity
                transportation: Transportation,     // Transportation systems
                energy_sources: Vec<EnergySource>,  // Energy sources used by the colony
                communication: Communication,       // Communication systems
                healthcare: Healthcare,             // Healthcare facilities
                education: Education,               // Education facilities
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            enum Transportation {
                Ground,     // Ground-based transportation (e.g., roads, railways)
                Air,        // Air-based transportation (e.g., aircraft, drones)
                Space,      // Space-based transportation (e.g., shuttles, starships)
                Hyperloop,  // High-speed ground transportation
                Teleportation, // Hypothetical teleportation systems
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            enum EnergySource {
                Solar,      // Solar energy
                Nuclear,    // Nuclear energy
                Fusion,     // Fusion energy
                Geothermal, // Geothermal energy
                Antimatter, // Antimatter energy
                DarkMatter, // Hypothetical dark matter energy
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Communication {
                network_type: NetworkType, // Type of communication network
                bandwidth: f64,            // Bandwidth in terabits per second
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            enum NetworkType {
                Wired,      // Wired communication networks
                Wireless,   // Wireless communication networks
                Quantum,    // Quantum communication networks
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Healthcare {
                hospitals: u64,            // Number of hospitals
                clinics: u64,              // Number of clinics
                medical_technology_level: u8, // Medical technology level (1-10 scale)
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Education {
                schools: u64,              // Number of schools
                universities: u64,         // Number of universities
                education_technology_level: u8, // Education technology level (1-10 scale)
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Economy {
                gdp: f64,                  // Gross Domestic Product in credits
                currency: String,          // Currency used in the colony
                industries: Vec<Industry>, // Major industries
                trade_partners: Vec<Principal>, // IDs of trade partner colonies
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            enum Industry {
                Agriculture,    // Agricultural industry
                Mining,         // Mining industry
                Manufacturing,  // Manufacturing industry
                Technology,     // Technology industry
                Services,       // Service industry
                Tourism,        // Tourism industry
                Military,       // Military industry
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Governance {
                government_type: GovernmentType, // Type of government
                leader: Principal,               // ID of the leader
                laws: Vec<String>,               // List of laws
                stability: u8,                   // Stability level (1-10 scale)
            }
            
            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            enum GovernmentType {
                Democracy,      // Democratic government
                Monarchy,       // Monarchical government
                Oligarchy,      // Oligarchic government
                Theocracy,      // Theocratic government
                Dictatorship,   // Dictatorial government
                Anarchy,        // Anarchic government
                Technocracy,    // Technocratic government
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Culture {
                language: String,           // Primary language
                religion: Option<String>,   // Primary religion (if any)
                traditions: Vec<String>,    // List of traditions
                art_forms: Vec<String>,     // List of art forms
                festivals: Vec<String>,     // List of festivals
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct Defenses {
                military_units: u64,        // Number of military units
                defense_technology_level: u8, // Defense technology level (1-10 scale)
                shield_generators: u64,     // Number of shield generators
                orbital_defenses: u64,      // Number of orbital defenses
            }

        //--
        
        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Unit {
            name: String,                       // Name of the unit
            description: String,                // Brief description of the unit
            coords: [f64; 2],                   // Coordinates within the planet or system
            parent_planet_id: Principal,        // ID of the parent planet (if applicable)
            parent_colony_id: Principal,        // ID of the parent colony (if applicable)
            parent_fleet_id: Principal,         // ID of the parent fleet (if applicable)
            size: f64,                          // Size of the unit in meters
            health: u64,                        // Health points of the unit
            shield: Option<u64>,                // Shield points of the unit (if applicable)
            attack_power: u64,                  // Attack power of the unit
            defense_power: u64,                 // Defense power of the unit
            speed: f64,                         // Speed of the unit in kilometers per hour
            range: f64,                         // Range of the unit's attacks in kilometers
            technology_level: u8,               // Technology level of the unit (1-10 scale)
            resources: Vec<Resource>,           // List of resources required to build or maintain the unit
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., planets, colonies, fleets)
            phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., PsionicWarrior, TemporalAssaultUnit)
            abilities: Vec<Ability>,            // List of abilities the unit possesses
            can_move: bool,                     // Flag for movement capability
            can_attack: bool,                   // Flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Artifact {
            name: String,                       // Name of the artifact
            description: String,                // Brief description of the artifact
            artifact_type: ArtifactType,        // Type of artifact (e.g., StoneRelic, StarshipCore)
            coords: [f64; 2],                   // Coordinates where the artifact is located
            parent_planet_id: Option<Principal>, // ID of the parent planet (if applicable)
            parent_star_system_id: Option<Principal>, // ID of the parent star system (if applicable)
            parent_galaxy_id: Option<Principal>, // ID of the parent galaxy (if applicable)
            age: f64,                           // Age of the artifact in billions of years
            size: f64,                          // Size of the artifact in meters
            composition: Composition,           // Composition of the artifact (e.g., stone, metal, crystal)
            technology_level: u8,               // Technology level of the artifact (1-10 scale)
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., planets, stars, civilizations)
            phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., PsionicAmplifier, TemporalAnomaly)
            abilities: Vec<Ability>,            // List of abilities the artifact possesses
            lore: Vec<String>,                  // Lore or historical records about the artifact
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        //AncientRuins
        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct AncientRuins {
            name: String,                       // Name of the ancient ruins
            description: String,                // Brief description of the ruins
            ruins_type: AncientRuinsType,       // Type of ruins (e.g., StoneMonoliths, DysonSphereFragments)
            coords: [f64; 2],                   // Coordinates within the planet or system
            parent_planet_id: Option<Principal>, // ID of the parent planet (if applicable)
            parent_star_system_id: Option<Principal>, // ID of the parent star system (if applicable)
            parent_galaxy_id: Option<Principal>, // ID of the parent galaxy (if applicable)
            age: f64,                           // Age of the ruins in billions of years
            size: f64,                          // Size of the ruins in kilometers
            composition: Composition,           // Composition of the ruins (e.g., stone, metal, crystal)
            technology_level: u8,               // Technology level of the civilization that built the ruins (1-10 scale)
            phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., PsionicMonuments, TimeDilationChambers)
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., planets, stars, galaxies)
            resources: Vec<Resource>,           // List of resources available in the ruins
            lore: Vec<String>,                  // Lore or historical records about the ruins
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
            artifacts: Vec<Artifact>,           // List of artifacts found in the ruins
            dangers: Vec<Danger>,               // List of dangers or hazards in the ruins
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Fleet {
            name: String,                       // Name of the fleet
            description: String,                // Brief description of the fleet
            fleet_type: FleetType,              // Type of fleet (e.g., ScoutFleet, Armada)
            coords: [f64; 2],                   // Coordinates within the galaxy
            parent_galaxy_id: Principal,        // ID of the parent galaxy (if applicable)
            parent_star_system_id: Option<Principal>, // ID of the parent star system (if applicable)
            parent_colony_id: Option<Principal>, // ID of the parent colony (if applicable)
            size: u64,                          // Number of ships in the fleet
            health: u64,                        // Combined health points of the fleet
            shield: Option<u64>,                // Combined shield points of the fleet (if applicable)
            attack_power: u64,                  // Combined attack power of the fleet
            defense_power: u64,                 // Combined defense power of the fleet
            speed: f64,                         // Average speed of the fleet in kilometers per hour
            range: f64,                         // Range of the fleet's operations in light-years
            technology_level: u8,               // Technology level of the fleet (1-10 scale)
            resources: Vec<Resource>,           // List of resources required to maintain the fleet
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., galaxies, star systems, colonies)
            phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., PsionicFleet, DimensionalFleet)
            abilities: Vec<Ability>,            // List of abilities the fleet possesses
            can_move: bool,                     // Flag for movement capability
            can_attack: bool,                   // Flag for attack capability
            lore: Vec<String>,                  // Lore or historical records about the fleet
            ships: Vec<Ship>,                   // List of ships in the fleet
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Ship {
            name: String,           // Name of the ship
            ship_type: ShipType,    // Type of ship (e.g., Fighter, Cruiser, Carrier)
            health: u64,            // Health points of the ship
            shield: Option<u64>,    // Shield points of the ship (if applicable)
            attack_power: u64,      // Attack power of the ship
            defense_power: u64,     // Defense power of the ship
            speed: f64,             // Speed of the ship in kilometers per hour
            range: f64,             // Range of the ship's operations in light-years
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Building {
            name: String,                       // Name of the building
            description: String,                // Brief description of the building
            building_type: BuildingType,        // Type of building (e.g., VillageHut, Skyscraper)
            coords: [f64; 2],                   // Coordinates within the planet or system
            parent_planet_id: Principal,        // ID of the parent planet (if applicable)
            parent_colony_id: Option<Principal>, // ID of the parent colony (if applicable)
            size: f64,                          // Size of the building in square kilometers
            capacity: u64,                      // Capacity of the building (e.g., number of people, ships, etc.)
            construction_time: f64,             // Time taken to construct the building in years
            technology_level: u8,               // Technology level of the building (1-10 scale)
            resources: Vec<Resource>,           // List of resources required to build or maintain the building
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., planets, colonies, stars)
            phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., EnergyNexus, TemporalObservatory)
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
            lore: Vec<String>,                  // Lore or historical records about the building
            modules: Vec<BuildingModule>,       // List of modules or features of the building
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct BuildingModule {
            name: String,           // Name of the module
            description: String,    // Brief description of the module
            functionality: String,  // Functionality provided by the module
            energy_cost: u64,       // Energy required to operate the module
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct NPC {
            name: String,                       // Name of the NPC
            description: String,                // Brief description of the NPC
            npc_type: NPCType,                  // Type of NPC (e.g., Civilian, Pilot, Diplomat)
            coords: [f64; 2],                   // Coordinates where the NPC is located
            parent_planet_id: Option<Principal>, // ID of the parent planet (if applicable)
            parent_colony_id: Option<Principal>, // ID of the parent colony (if applicable)
            parent_star_system_id: Option<Principal>, // ID of the parent star system (if applicable)
            age: u32,                           // Age of the NPC in years
            species: String,                    // Species of the NPC (e.g., Human, Alien)
            faction: Option<String>,            // Faction or group the NPC belongs to
            abilities: Vec<Ability>,            // List of abilities the NPC possesses
            inventory: Vec<Item>,               // Items the NPC is carrying
            dialogue: Vec<String>,              // Dialogue lines the NPC can say
            lore: Vec<String>,                  // Lore or historical records about the NPC
            hp: u64,                            // Hitpoints (required)
            shield: Option<u64>,                // Optional shield for defense
            can_move: Option<bool>,             // Optional flag for movement capability
            can_attack: Option<bool>,           // Optional flag for attack capability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Player {
            id: Principal,
            username: String,
            avatar: u64,
            title: String,
            description: String,
            registration_date: u64, 
            level: u32,
            elo: f64,
            language: String,
            abilities: Vec<Ability>,            // List of abilities the player type possesses
            associated_entities: Vec<Principal>, // IDs of associated entities (e.g., factions, colonies, fleets)
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Ability {
            name: String,                       // Name of the ability
            description: String,                // Brief description of the ability
            effect: String,                     // Effect of the ability (e.g., "Heals allies", "Deals area damage")
            cooldown: f64,                      // Cooldown time in seconds
            range: f64,                         // Range of the ability in kilometers
            energy_cost: u64,                   // Energy cost of the ability
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum ItemType {
            Weapon,                 // Items used for combat.
            Tool,                   // Items used for utility or crafting.
            Artifact,               // Items with special or mystical properties.
            Consumable,             // Items that can be consumed for effects.
            Resource,               // Raw materials or resources.
            Clothing,               // Items worn for protection or aesthetics.
            Key,                    // Items used to unlock doors or containers.
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Item {
            name: String,           // Name of the item
            description: String,    // Brief description of the item
            item_type: ItemType,    // Type of item (e.g., Weapon, Tool, Artifact)
            quantity: u32,          // Quantity of the item
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Danger {
            name: String,           // Name of the danger
            description: String,    // Brief description of the danger
            effect: String,         // Effect of the danger (e.g., "Causes radiation poisoning", "Triggers traps")
            severity: u8,           // Severity of the danger (1-10 scale)
        }

        // SpaceStation
            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct SpaceStation {
                name: String,                       // Name of the space station
                description: String,                // Brief description of the station
                station_type: SpaceStationType,     // Type of space station (e.g., TradeHub, ResearchLab)
                coords: [f64; 2],                   // Coordinates within the star system
                parent_star_system_id: Principal,   // ID of the parent star system
                parent_planet_id: Option<Principal>, // ID of the parent planet (if orbiting a planet)
                size: f64,                          // Size of the station in cubic kilometers
                capacity: u64,                      // Capacity of the station (e.g., population, ships)
                technology_level: u8,               // Technology level of the station (1-10 scale)
                resources: Vec<Resource>,           // List of resources required to maintain the station
                associated_entities: Vec<Principal>, // IDs of associated entities (e.g., planets, fleets, colonies)
                phenomena: Vec<PhenomenonType>,     // Associated phenomena (e.g., EnergyNexus, TemporalAnomaly)
                hp: u64,                            // Hitpoints of the station
                shield: Option<u64>,                // Optional shield for defense
                can_move: Option<bool>,             // Optional flag for movement capability
                can_attack: Option<bool>,           // Optional flag for attack capability
                modules: Vec<StationModule>,        // List of modules installed on the station
                lore: Vec<String>,                  // Lore or historical records about the station
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            enum SpaceStationType {
                TradeHub,               // Station focused on commerce and trade.
                ResearchLab,            // Station dedicated to scientific research.
                MilitaryOutpost,        // Station designed for defense and military operations.
                ColonyHub,              // Station serving as a central hub for a colony.
                Shipyard,               // Station specializing in ship construction and repair.
                DiplomaticCenter,       // Station for hosting intergalactic diplomacy.
                ObservationPost,        // Station for monitoring cosmic phenomena.
                RefugeeShelter,         // Station providing aid and shelter for displaced populations.
                EntertainmentComplex,   // Station offering leisure and entertainment.
                TerraformingControl,    // Station managing planetary terraforming efforts.
            }

            #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
            struct StationModule {
                name: String,           // Name of the module
                description: String,    // Brief description of the module
                functionality: String,  // Functionality provided by the module
                energy_cost: u64,       // Energy required to operate the module
            }

        //--

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Atmosphere {
            composition: Vec<(String, f64)>, // List of gases and their percentages (e.g., [("Nitrogen", 78.0), ("Oxygen", 21.0)])
            pressure: f64,                   // Surface pressure in Earth atmospheres (1.0 = Earth's pressure)
            albedo: f64,                     // Reflectivity of the planet (0 = absorbs all light, 1 = reflects all light)
            greenhouse_effect: f64,          // Greenhouse effect factor (1.0 = Earth-like)
        }
        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct TemperatureRange {
            min: f64, // Minimum temperature in Kelvin
            max: f64, // Maximum temperature in Kelvin
            average: f64, // Average temperature in Kelvin
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Hydrosphere {
            water_coverage: f64, // Percentage of the surface covered by water (0.0 to 1.0)
            other_liquids: Vec<(String, f64)>, // Other liquids and their coverage percentages
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Geology {
            crust_composition: Vec<(String, f64)>, // Composition of the crust (e.g., [("Silicate", 60.0), ("Basalt", 40.0)])
            tectonic_activity: TectonicActivity,   // Level of tectonic activity
            volcanic_activity: VolcanicActivity,   // Level of volcanic activity
            magnetic_field: f64,                   // Magnetic field strength relative to Earth (1.0 = Earth's field)
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum TectonicActivity {
            None,       // No tectonic activity
            Low,        // Minor tectonic activity
            Moderate,   // Moderate tectonic activity
            High,       // High tectonic activity
            Extreme,    // Extreme tectonic activity
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum VolcanicActivity {
            None,       // No volcanic activity
            Low,        // Minor volcanic activity
            Moderate,   // Moderate volcanic activity
            High,       // High volcanic activity
            Extreme,    // Extreme volcanic activity
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Biosphere {
            life_type: LifeType, // Type of life (e.g., Carbon-based, Silicon-based)
            biodiversity: f64,   // Biodiversity index (0.0 to 1.0)
            intelligence: Option<IntelligenceLevel>, // Level of intelligence (if any)
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum LifeType {
            CarbonBased, // Life based on carbon
            SiliconBased, // Life based on silicon
            Other(String), // Other types of life
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum IntelligenceLevel {
            None,       // No intelligent life
            Primitive,  // Primitive intelligence (e.g., early humans)
            Advanced,   // Advanced intelligence (e.g., human-like civilizations)
            HighlyAdvanced, // Highly advanced intelligence (e.g., interstellar civilizations)
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Resource {
            name: String,       // Name of the resource (e.g., "Iron", "Water")
            abundance: f64,     // Abundance of the resource (0.0 to 1.0)
            accessibility: f64, // Accessibility of the resource (0.0 to 1.0)
        }

        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Composition {
            metals: f64,        // Percentage of metals (e.g., iron, nickel)
            silicates: f64,     // Percentage of silicate minerals
            carbon: f64,        // Percentage of carbonaceous material
            ice: f64,           // Percentage of ice (if any)
            organics: f64,      // Percentage of organic compounds (if any)
            other: Vec<(String, f64)>, // Other materials and their percentages
        }
    //--
//--

    // Coordinates 
        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        enum LocationParams {
            Ring { inner_radius: f64, outer_radius: f64 },
            Proximity { center: [f64; 2], max_distance: f64 },
            Random { x_range: [f64; 2], y_range: [f64; 2] },
        }
            
        #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
        struct Coordinates {
            x: f64,
            y: f64,
        }

        impl Coordinates {
            // Offset this coordinate by another coordinate
            pub fn offset(&self, other: &Coordinates) -> Self {
                Self {
                    x: self.x + other.x,
                    y: self.y + other.y,
                }
            }
            // Utility to calculate distance between two coordinates
            // fn distance_to(&self, other: &Coordinates) -> f64 {
            //     ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
            // }

            // Convert polar coordinates (radius, angle) to Cartesian (x, y)
            fn from_polar(radius: f64, angle: f64) -> Self {
                Self {
                    x: radius * angle.cos(),
                    y: radius * angle.sin(),
                }
            }

            pub fn to_array(&self) -> [f64; 2] {
                [self.x, self.y]
            }
        }


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

    // Queries
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

        #[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
        struct ExportedEntity {
            id: Principal,
            owner_id: Principal,
            entity_type: EntityType,
            coords: [f64; 2],
            metadata: String,
        }

        #[query]
        fn export_entities() -> Vec<ExportedEntity> {
            GALAXY_TREE.with(|tree| {
                tree.borrow()
                    .iter()
                    .map(|entity| {
                        let metadata_json = serde_json::to_string(&entity.metadata)
                            .unwrap_or_else(|_| "{}".to_string());
                        ExportedEntity {
                            id: entity.id,
                            owner_id: entity.owner_id,
                            entity_type: entity.entity_type.clone(),
                            coords: entity.coords,
                            metadata: metadata_json,
                        }
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

        #[query]
        fn get_player_empire_borders(player_id: Principal) -> Option<((f64, f64), (f64, f64))> {
            GALAXY_TREE.with(|tree| {
                let tree = tree.borrow();
                let player_entities: Vec<&Entity> = tree.iter()
                    .filter(|e| e.owner_id == player_id)
                    .collect();

                if player_entities.is_empty() {
                    return None;
                }

                let mut min_x = f64::MAX;
                let mut min_y = f64::MAX;
                let mut max_x = f64::MIN;
                let mut max_y = f64::MIN;

                for entity in player_entities {
                    let (x, y) = (entity.coords[0], entity.coords[1]);
                    if x < min_x { min_x = x; }
                    if y < min_y { min_y = y; }
                    if x > max_x { max_x = x; }
                    if y > max_y { max_y = y; }
                }

                Some(((min_x, min_y), (max_x, max_y)))
            })
        }

    //--
    // Helpers
        // fn map_to_range(random_value: u64, min: f64, max: f64) -> f64 {
        //     let fraction = (random_value as f64) / (u64::MAX as f64); // Normalize to [0, 1]
        //     min + fraction * (max - min) // Scale to [min, max]
        // }

        // fn validate_metadata(metadata: &str) -> Result<(), String> {
        //     serde_json::from_str::<serde_json::Value>(metadata)
        //         .map_err(|e| format!("Invalid metadata: {}", e))?;
        //     Ok(())
        // }

        // fn random_planet_type() -> (String, String, String) {
        //     // Categories and subcategories
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

        //     // Randomly select a category and subcategory
        //     let category_index = generate_random_in_range(0, (categories.len() - 1) as u64) as usize;
        //     let category = categories[category_index].to_string();
        //     let subcategory = subcategories[category_index][generate_random_in_range(
        //         0,
        //         (subcategories[category_index].len() - 1) as u64,
        //     ) as usize]
        //         .to_string();

        //     // Randomly assign planet size
        //     let sizes = vec!["Tiny", "Small", "Medium", "Large", "Huge"];
        //     let size = sizes[generate_random_in_range(0, (sizes.len() - 1) as u64) as usize].to_string();

        //     (category, subcategory, size)
        // }

        // fn random_temperature(star_type: &str) -> f64 {
        //     let current_time = ic_cdk::api::time();
        
        //     match star_type {
        //         "O" => generate_random_in_range_f64(30000.0, 50000.0),
        //         "B" => generate_random_in_range_f64(10000.0, 30000.0),
        //         "A" => generate_random_in_range_f64(7500.0, 10000.0),
        //         "F" => generate_random_in_range_f64(6000.0, 7500.0),
        //         "G" => generate_random_in_range_f64(5200.0, 6000.0),
        //         "K" => generate_random_in_range_f64(3700.0, 5200.0),
        //         "M" => generate_random_in_range_f64(2400.0, 3700.0),
        //         _ => 5000.0, // Default temperature for unknown types
        //     }
        // }
        
        // fn random_luminosity(star_type: &str) -> f64 {
        //     let current_time = ic_cdk::api::time();
        
        //     match star_type {
        //         "O" => generate_random_in_range_f64(100000.0, 1000000.0),
        //         "B" => generate_random_in_range_f64(10000.0, 100000.0),
        //         "A" => generate_random_in_range_f64(10.0, 100.0),
        //         "F" => generate_random_in_range_f64(1.0, 10.0),
        //         "G" => generate_random_in_range_f64(0.6, 1.0),
        //         "K" => generate_random_in_range_f64(0.08, 0.6),
        //         "M" => generate_random_in_range_f64(0.01, 0.08),
        //         _ => 1.0, // Default luminosity for unknown types
        //     }
        // }
        
        // fn random_star_type() -> String {
        //     // Spectral types and classes
        //     let spectral_types = vec!["O", "B", "A", "F", "G", "K", "M"];
        //     let stellar_classes = vec!["Main Sequence", "Giant", "Supergiant"];

        //     // Randomly select spectral type and subclass
        //     let spectral_index = generate_random_in_range(0, (spectral_types.len() - 1) as u64) as usize;
        //     let subclass = generate_random_in_range(0, 9); // Subclass (e.g., G2)
        //     let spectral_type = format!("{}{}", spectral_types[spectral_index], subclass);

        //     // Randomly select stellar class
        //     let class_index = generate_random_in_range(0, (stellar_classes.len() - 1) as u64) as usize;
        //     let stellar_class = stellar_classes[class_index].to_string();

        //     // Combine type and class
        //     format!("{} {}", spectral_type, stellar_class)
        // }

        // fn random_atmosphere_type() -> String {
        //     let atmospheres = vec![
        //         "Nitrogen-Oxygen",
        //         "Carbon Dioxide",
        //         "Methane",
        //         "Ammonia",
        //         "None",
        //     ];
        //     let current_time = ic_cdk::api::time();
        //     let index = generate_random_in_range(0, atmospheres.len() as u64 - 1) as usize;
        //     atmospheres[index].to_string()
        // }
        
        // fn random_gravity() -> f64 {
        //     generate_random_in_range_f64(0.5, 2.5) // Random gravity between 0.5 and 2.5
        // }
        
        // fn random_resources() -> Vec<String> {
        //     let resources = vec!["Water", "Minerals", "Metals", "Gases", "Crystals"];
        //     let current_time = ic_cdk::api::time();
        //     let num_resources = generate_random_in_range(1, resources.len() as u64) as usize;

        //     // Select resources based on deterministic randomness
        //     let mut selected_resources = Vec::new();
        //     for i in 0..num_resources {
        //         let index = (current_time as usize + i) % resources.len();
        //         selected_resources.push(resources[index].to_string());
        //     }

        //     selected_resources
        // }

        // async fn random_orbit(
        //     parent_coords: (f64, f64),
        //     min_radius: f64,
        //     max_radius: f64,
        // ) -> Result<(f64, f64), String> {
        //     let random_bytes = match raw_rand().await {
        //         Ok((bytes,)) => bytes,
        //         Err(_) => return Err("Failed to fetch randomness.".to_string()),
        //     };
        
        //     // Extract random values as u64
        //     let radius_rand = u64::from_le_bytes(random_bytes[0..8].try_into().unwrap());
        //     let angle_rand = u64::from_le_bytes(random_bytes[8..16].try_into().unwrap());
        
        //     // Map the u64 values to f64 ranges
        //     let radius = map_to_range_f64(radius_rand, min_radius, max_radius);
        //     let angle = map_to_range_f64(angle_rand, 0.0, 2.0 * std::f64::consts::PI);
        
        //     // Compute orbital position
        //     Ok((
        //         parent_coords.0 + radius * angle.cos(),
        //         parent_coords.1 + radius * angle.sin(),
        //     ))
        // }
        
        // // Helper function to map u64 to f64 range
        // fn map_to_range_f64(value: u64, min: f64, max: f64) -> f64 {
        //     let normalized = value as f64 / u64::MAX as f64; // Normalize to [0, 1]
        //     min + normalized * (max - min) // Scale to target range
        // }
        
            fn _generate_random_in_range(min: u64, max: u64) -> u64 {
                let current_time = ic_cdk::api::time(); // Nanoseconds since the Unix epoch
                min + (current_time as u64 % (max - min + 1))
            }
        
            fn generate_random_in_range_f64(min: f64, max: f64) -> f64 {
                let current_time = ic_cdk::api::time(); // Nanoseconds since the Unix epoch
                min + (current_time as f64 % (max - min + 1.0))
            }
        
            fn _generate_principal() -> Principal {
                let unique_id = ENTITY_COUNTER.with(|counter| {
                    let mut counter = counter.borrow_mut();
                    *counter += 1;
                    *counter
                });
        
                Principal::self_authenticating(&unique_id.to_be_bytes())
            }
        
//--
//Updates commented

    // #[update]
    // fn remove_entity(id: Principal) -> Result<(), String> {
    //     GALAXY_TREE.with(|tree| {
    //         let mut tree = tree.borrow_mut();

    //         // Find the entity to remove
    //         let entity_to_remove = tree.iter().find(|e| e.id == id).cloned();

    //         if let Some(entity) = entity_to_remove {
    //             tree.remove(&entity); // Remove entity
    //             Ok(())
    //         } else {
    //             Err("Entity not found.".to_string())
    //         }
    //     })
    // }

    // #[update]
    // fn update_entity(
    //     id: Principal,
    //     new_coords: (f64, f64),
    //     new_metadata: Option<Metadata>, // Updated to use the Metadata enum
    // ) -> Result<(), String> {
    //     GALAXY_TREE.with(|tree| {
    //         // Clone the entity (if found) to end the immutable borrow early
    //         let entity_to_update = tree.borrow().iter().find(|e| e.id == id).cloned();
    
    //         if let Some(entity) = entity_to_update {
    //             let mut tree_mut = tree.borrow_mut();
    //             tree_mut.remove(&entity);
    
    //             let updated_entity = Entity {
    //                 id,
    //                 owner_id: entity.owner_id, // Preserve the current owner
    //                 entity_type: entity.entity_type,
    //                 coords: [new_coords.0, new_coords.1],
    //                 metadata: new_metadata.unwrap_or(entity.metadata), // Use the new metadata if provided, otherwise keep the old one
    //             };
    
    //             tree_mut.insert(updated_entity);
    //             Ok(())
    //         } else {
    //             Err("Entity not found.".to_string())
    //         }
    //     })
    // }

    // #[update]
    // fn transfer_entity(entity_id: Principal, new_owner: Principal) -> Result<(), String> {
    //     GALAXY_TREE.with(|tree| {
    //         let mut tree_mut = tree.borrow_mut();
    //         let entity_to_transfer = tree_mut.iter().find(|e| e.id == entity_id).cloned();
    
    //         if let Some(mut entity) = entity_to_transfer {
    //             // Update ownership
    //             entity.owner_id = new_owner;
    
    //             // Remove the old entity and insert the updated one
    //             tree_mut.remove(&entity);
    //             tree_mut.insert(entity);
    
    //             Ok(())
    //         } else {
    //             Err("Entity not found.".to_string())
    //         }
    //     })
    // }

    // #[update]
    // async fn create_star(star_coords: (f64, f64), owner_id: Principal) -> Result<(), String> {
    //     // Generate a random star type and a unique Principal for the star
    //     let star_type = random_star_type();
    //     let star_id = generate_principal();
    
    //     // Create the metadata for the star using the Metadata enum
    //     let metadata = Metadata::Star(Star {
    //         name: format!("Star-{}", star_id.to_text()), // Example name
    //         temperature: random_temperature(&star_type), // Random temperature based on star type
    //         luminosity: random_luminosity(&star_type),   // Random luminosity based on star type
    //         spectral_class: star_type.clone(),
    //         description: format!("A {} star.", star_type),
    //     });
    
    //     // Create the star entity
    //     let star = Entity {
    //         id: star_id,
    //         owner_id,
    //         entity_type: EntityType::Star,
    //         coords: [star_coords.0, star_coords.1],
    //         metadata,
    //     };
    
    //     // Insert the star into the GALAXY_TREE
    //     GALAXY_TREE.with(|tree| tree.borrow_mut().insert(star));
    
    //     // Call create_planetary_system to generate a planetary system for the star
    //     create_planetary_system(star_id, owner_id).await?;
    
    //     Ok(())
    // }
    
    // #[update]
    // async fn create_planet(
    //     star_id: Principal,          // Parent star's ID
    //     owner_id: Principal,         // Owner ID
    //     planet_coords: (f64, f64),   // Planet's coordinates
    // ) -> Result<(), String> {
    //     // Generate random planet properties
    //     let (planet_type, size) = random_planet_type();
    //     let planet_id = generate_principal();
    
    //     // Create the planet metadata using the Metadata enum
    //     let metadata = Metadata::Planet(PlanetMetadata {
    //         name: format!("Planet-{}", planet_id.to_text()), // Example name
    //         atmosphere_type: random_atmosphere_type(),       // Random atmosphere type
    //         gravity: random_gravity(),                       // Random gravity
    //         population: rand::random::<u64>() % 1_000_000_000, // Random population
    //         resources: random_resources(),                   // Random resources
    //         description: format!("A {} planet orbiting star {}.", planet_type, star_id.to_text()),
    //     });
    
    //     // Create the planet entity
    //     let planet = Entity {
    //         id: planet_id,
    //         owner_id,
    //         entity_type: EntityType::Planet,
    //         coords: [planet_coords.0, planet_coords.1],
    //         metadata,
    //     };
    
    //     // Insert the planet into the GALAXY_TREE
    //     GALAXY_TREE.with(|tree| tree.borrow_mut().insert(planet));
    
    //     // Create moons for the planet
    //     let num_moons = generate_random_in_range(0, 3); // Random number of moons (0 to 3)
    //     for _ in 0..num_moons {
    //         create_moon(planet_id, owner_id).await?; // Pass planet_id to create_moon
    //     }
    
    //     Ok(())
    // }

    // #[update]
    // async fn create_moon(planet_id: Principal, owner_id: Principal) -> Result<(), String> {
    //     let moon_id = generate_principal();
    //     let moon_coords = (
    //         rand::random::<f64>() * 5.0, // Random offset from the planet
    //         rand::random::<f64>() * 5.0,
    //     );
    
    //     // Create the moon metadata using the Metadata enum
    //     let metadata = Metadata::Moon(MoonMetadata {
    //         name: format!("Moon-{}", moon_id.to_text()), // Example name
    //         parent_planet_id: planet_id,
    //         gravity: rand::random::<f64>() * 0.5 + 0.1, // Random gravity between 0.1 and 0.6
    //         resources: random_resources(),              // Random resources
    //         description: format!("A moon orbiting planet {}.", planet_id.to_text()),
    //     });
    
    //     // Create the moon entity
    //     let moon = Entity {
    //         id: moon_id,
    //         owner_id,
    //         entity_type: EntityType::Moon,
    //         coords: [moon_coords.0, moon_coords.1],
    //         metadata,
    //     };
    
    //     // Insert the moon into the GALAXY_TREE
    //     GALAXY_TREE.with(|tree| tree.borrow_mut().insert(moon));
    
    //     Ok(())
    // }

    // #[update]
    // async fn create_asteroid_belt(
    //     star_id: Principal, // Parent star's ID
    //     owner_id: Principal,
    // ) -> Result<(), String> {
    //     // Fetch the parent star's coordinates
    //     let star = get_entity_by_id(star_id).ok_or("Parent star not found")?;
    //     let star_coords = (star.coords[0], star.coords[1]);
    
    //     // Generate asteroid belt coordinates
    //     let belt_coords = random_orbit(star_coords, 0.0002, 0.0003).await?;
    
    //     // Create the asteroid belt metadata using the Metadata enum
    //     let metadata = Metadata::AsteroidBelt(AsteroidBeltMetadata {
    //         name: format!("Asteroid Belt-{}", generate_principal().to_text()), // Example name
    //         resource_density: rand::random::<f64>() * 0.5 + 0.1, // Random resource density between 0.1 and 0.6
    //         description: format!("An asteroid belt orbiting star {}.", star_id.to_text()),
    //     });
    
    //     // Create the asteroid belt entity
    //     let belt = Entity {
    //         id: generate_principal(),
    //         owner_id,
    //         entity_type: EntityType::AsteroidBelt,
    //         coords: [belt_coords.0, belt_coords.1],
    //         metadata,
    //     };
    
    //     // Insert the asteroid belt into the GALAXY_TREE
    //     GALAXY_TREE.with(|tree| tree.borrow_mut().insert(belt));
    
    //     Ok(())
    // }

    // #[update]
    // async fn create_black_hole(coords: (f64, f64), owner_id: Principal) -> Result<(), String> {
    //     // Generate a unique ID for the black hole
    //     let black_hole_id = generate_principal();
    
    //     // Create the black hole metadata using the Metadata enum
    //     let metadata = Metadata::BlackHole(BlackHoleMetadata {
    //         name: format!("Black Hole-{}", black_hole_id.to_text()), // Example name
    //         danger_level: rand::random::<u8>() % 10 + 1, // Random danger level between 1 and 10
    //         reward_level: rand::random::<u8>() % 10 + 1, // Random reward level between 1 and 10
    //         description: "A mysterious and powerful black hole.".to_string(),
    //     });
    
    //     // Create the black hole entity
    //     let black_hole = Entity {
    //         id: black_hole_id,
    //         owner_id,
    //         entity_type: EntityType::BlackHole,
    //         coords: [coords.0, coords.1],
    //         metadata,
    //     };
    
    //     // Insert the black hole into the GALAXY_TREE
    //     GALAXY_TREE.with(|tree| tree.borrow_mut().insert(black_hole));
    
    //     Ok(())
    // }

    // #[update]
    // async fn create_nebula(coords: (f64, f64), owner_id: Principal) -> Result<(), String> {
    //     // Generate a unique ID for the nebula
    //     let nebula_id = generate_principal();
    
    //     // Create the nebula metadata using the Metadata enum
    //     let metadata = Metadata::Nebulae(NebulaeMetadata {
    //         name: format!("Nebula-{}", nebula_id.to_text()), // Example name
    //         resource_type: random_resource_type(), // Random resource type
    //         visual_effect: random_visual_effect(), // Random visual effect
    //         description: "A beautiful and mysterious nebula.".to_string(),
    //     });
    
    //     // Create the nebula entity
    //     let nebula = Entity {
    //         id: nebula_id,
    //         owner_id,
    //         entity_type: EntityType::Nebulae,
    //         coords: [coords.0, coords.1],
    //         metadata,
    //     };
    
    //     // Insert the nebula into the GALAXY_TREE
    //     GALAXY_TREE.with(|tree| tree.borrow_mut().insert(nebula));
    
    //     Ok(())
    // }

    // #[update]
    // fn benchmark_spawn(count: u64) -> u64 {
    //     // Start measuring performance
    //     let start = ic_cdk::api::performance_counter(0);
    
    //     GALAXY_TREE.with(|tree| {
    //         let mut tree_mut = tree.borrow_mut();
    //         for i in 0..count {
    //             // Generate a unique ID for the entity
    //             let unique_id = ENTITY_COUNTER.with(|counter| {
    //                 let mut counter = counter.borrow_mut();
    //                 *counter += 1;
    //                 *counter
    //             });
    
    //             // Generate a unique Principal for the entity
    //             let unique_principal = Principal::self_authenticating(&unique_id.to_be_bytes());
    
    //             // Create the entity metadata using the Metadata enum
    //             let metadata = Metadata::Planet(PlanetMetadata {
    //                 name: format!("Planet-{}", unique_id),
    //                 atmosphere_type: random_atmosphere_type(), // Random atmosphere type
    //                 gravity: random_gravity(),                 // Random gravity
    //                 population: rand::random::<u64>() % 1_000_000_000, // Random population
    //                 resources: random_resources(),             // Random resources
    //                 description: format!("A planet with ID {}.", unique_id),
    //             });
    
    //             // Create the entity
    //             let entity = Entity {
    //                 id: unique_principal,
    //                 owner_id: ic_cdk::caller(),
    //                 entity_type: EntityType::Planet,
    //                 coords: [i as f64 * 10.0, i as f64 * 5.0], // Spread entities in a grid
    //                 metadata,
    //             };
    
    //             // Insert the entity into the GALAXY_TREE
    //             tree_mut.insert(entity);
    //         }
    //     });
    
    //     // End measuring performance
    //     let end = ic_cdk::api::performance_counter(0);
    //     end - start // Return the instructions used
    // }

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
                    ReferralCodeResult::_Err(err_msg) => return Err(err_msg),
                }
            }
            None => {
                // Generate a new referral code
                let (new_code, _) = assign_referral_code(caller, None).await;
                new_code
            }
        };
    
        // Create metadata for the StarCluster
        let star_cluster_metadata = Metadata::StarCluster(StarCluster {
            name: "Asterism Cluster".to_string(),
            description: "A beautiful cluster of stars".to_string(),
            cluster_type: StarClusterType::Asterism {
                min_stars: 5,
                max_stars: 10,
                star_types: vec!["G".to_string(), "K".to_string(), "M".to_string()],
                phenomena: vec!["Nebula".to_string(), "Black Hole".to_string()], // Remains as Vec<String>
            },
            coords: [500.0, 800.0],
            parent_galaxy_id: caller,
            radius: 50.0,
            mass: 1000.0,
            age: 5.0,
            star_count: 10,
            star_types: vec!["G".to_string(), "K".to_string(), "M".to_string()],
            phenomena: vec![
                PhenomenonType::Nebula,
                PhenomenonType::PsionicMonuments
            ], // Now uses PhenomenonType enum
            composition: Composition { // Initialized as struct instead of enum
                metals: 0.1,
                silicates: 0.3,
                carbon: 0.2,
                ice: 0.1,
                organics: 0.05,
                other: vec![("Gas".to_string(), 0.25)]
            },
            temperature: TemperatureRange {
                min: 3000.0,
                max: 6000.0,
                average: 4500.0, // Added average field
            },
            associated_entities: vec![],
            hp: 5000,
            shield: Some(1000),
            can_move: Some(false),
            can_attack: Some(false),
        });
    
        // Create the StarCluster entity
        add_entity(
            EntityType::StarCluster,
            LocationParams::Ring {
                inner_radius: 1000.0,
                outer_radius: 1100.0,
            },
            Some(star_cluster_metadata), // Pass the metadata here
            Some(StarClusterType::Asterism {
                min_stars: 5,
                max_stars: 10,
                star_types: vec!["G".to_string(), "K".to_string(), "M".to_string()],
                phenomena: vec!["Nebula".to_string(), "Black Hole".to_string()],
            }),
        )
        .map_err(|e| format!("Failed to create StarCluster: {}", e))?;
    
        // Register the player
        let new_player = Player {
            id: caller,
            username,
            avatar: avatar as u64, // Ensure compatibility with u64 type in Player
            title: "Starbound Initiate".to_string(),
            description: "".to_string(),
            registration_date: ic_cdk::api::time(),
            level: 1,
            elo: 1200.0,
            language,
            abilities: Vec::new(),              // Initialize with an empty list of abilities
            associated_entities: Vec::new(),    // Initialize with an empty list of associated entities
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



// --- R-Tree Points ---

    // #[query]
    // fn planets_in_area(lower: (f64, f64), upper: (f64, f64)) -> Vec<u64> {
    //     PLANET_TREE.with(|tree| {
    //         tree.borrow()
    //             .locate_in_envelope_intersecting(&AABB::from_corners([lower.0, lower.1], [upper.0, upper.1]))
    //             .map(|point| point.planet_id)
    //             .collect()
    //     })
    // }
    // // Locate nearby habitable planets, mining opportunities, or potential conflicts.
    // #[query]
    // fn nearby_planets(x: f64, y: f64, radius: f64) -> Vec<u64> {
    //     PLANET_TREE.with(|tree| {
    //         tree.borrow()
    //             .locate_within_distance([x, y], radius.powi(2))
    //             .map(|point| point.planet_id)
    //             .collect()
    //     })
    // }

    // #[query]
    // fn nearby_buildings(x: f64, y: f64, radius: f64) -> Vec<u64> {
    //     BUILDING_TREE.with(|tree| {
    //         tree.borrow()
    //             .locate_within_distance([x, y], radius.powi(2))
    //             .map(|point| point.building_id)
    //             .collect()
    //     })
    // }

    // // When navigating the galaxy or placing a new object.
    // #[query]
    // fn nearest_star_system(x: f64, y: f64) -> Option<u64> {
    //     STAR_SYSTEM_TREE.with(|tree| {
    //         tree.borrow()
    //             .nearest_neighbor(&[x, y])
    //             .map(|point| point.system_id)
    //     })
    // }

    // // Identify fleets in proximity for combat, trade, or exploration.
    // #[query]
    // fn nearby_fleets(x: f64, y: f64, radius: f64) -> Vec<u64> {
    //     FLEET_TREE.with(|tree| {
    //         tree.borrow()
    //             .locate_within_distance([x, y], radius.powi(2))
    //             .map(|point| point.fleet_id)
    //             .collect()
    //     })
    // }

    // impl StarSystemPoint {
    //     fn new(system_id: u64, coords: (i64, i64)) -> Self {
    //         StarSystemPoint {
    //             system_id,
    //             coords: [coords.0 as f64, coords.1 as f64],
    //         }
    //     }
    // }

    // impl RTreeObject for StarSystemPoint {
    //     type Envelope = AABB<[f64; 2]>;

    //     fn envelope(&self) -> Self::Envelope {
    //         AABB::from_point(self.coords)
    //     }
    // }

    // impl PointDistance for StarSystemPoint {
    //     fn distance_2(&self, point: &[f64; 2]) -> f64 {
    //         let dx = self.coords[0] - point[0];
    //         let dy = self.coords[1] - point[1];
    //         dx * dx + dy * dy
    //     }
    // }

    // impl FleetPoint {
    //     fn new(fleet_id: u64, coords: (f64, f64)) -> Self {
    //         FleetPoint {
    //             fleet_id,
    //             coords: [coords.0, coords.1],
    //         }
    //     }
    // }

    // impl RTreeObject for FleetPoint {
    //     type Envelope = AABB<[f64; 2]>;

    //     fn envelope(&self) -> Self::Envelope {
    //         AABB::from_point(self.coords)
    //     }
    // }

    // impl PointDistance for FleetPoint {
    //     fn distance_2(&self, point: &[f64; 2]) -> f64 {
    //         let dx = self.coords[0] - point[0];
    //         let dy = self.coords[1] - point[1];
    //         dx * dx + dy * dy
    //     }
    // }

    // impl PlanetPoint {
    //     fn new(planet_id: u64, coords: (f64, f64)) -> Self {
    //         PlanetPoint {
    //             planet_id,
    //             coords: [coords.0, coords.1],
    //         }
    //     }
    // }

    // impl RTreeObject for PlanetPoint {
    //     type Envelope = AABB<[f64; 2]>;

    //     fn envelope(&self) -> Self::Envelope {
    //         AABB::from_point(self.coords)
    //     }
    // }

    // impl PointDistance for PlanetPoint {
    //     fn distance_2(&self, point: &[f64; 2]) -> f64 {
    //         let dx = self.coords[0] - point[0];
    //         let dy = self.coords[1] - point[1];
    //         dx * dx + dy * dy
    //     }
    // }

    // impl BuildingPoint {
    //     fn new(building_id: u64, coords: (f64, f64)) -> Self {
    //         BuildingPoint {
    //             building_id,
    //             coords: [coords.0, coords.1],
    //         }
    //     }
    // }

    // impl RTreeObject for BuildingPoint {
    //     type Envelope = AABB<[f64; 2]>;

    //     fn envelope(&self) -> Self::Envelope {
    //         AABB::from_point(self.coords)
    //     }
    // }

    // impl PointDistance for BuildingPoint {
    //     fn distance_2(&self, point: &[f64; 2]) -> f64 {
    //         let dx = self.coords[0] - point[0];
    //         let dy = self.coords[1] - point[1];
    //         dx * dx + dy * dy
    //     }
    // }



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
    }

// --- Initialization ---

    // #[update]
    // fn start_tick() {
    //     // Check if a timer is already running to prevent duplicates
    //     TICK_TIMER.with(|timer| {
    //     if timer.borrow().is_none() {
    //         let timer_id = set_timer_interval(std::time::Duration::from_secs(1), || {
    //     // Call your batch operations here
    //     ic_cdk::println!("Tick: Updating resources and processing operations...");
    //     perform_tick_operations();
    //         });
    //         *timer.borrow_mut() = Some(timer_id);
    //         ic_cdk::println!("Tick timer started.");
    //     } else {
    //         ic_cdk::println!("Tick timer is already running.");
    //     }
    //         });
    // }

    // #[update]
    // fn stop_tick() {
    //     TICK_TIMER.with(|timer| {
    //     if let Some(timer_id) = timer.borrow_mut().take() {
    //         ic_cdk_timers::clear_timer(timer_id);
    //         ic_cdk::println!("Tick timer stopped.");
    //     } else {
    //         ic_cdk::println!("No tick timer is currently running.");
    //     }
    //         });
    // }

    // fn perform_tick_operations() {
    //     TICK_COUNT.with(|count| {
    //     let mut count = count.borrow_mut();
    //     *count += 1;
    //         });

    //         PLANETS.with(|planets| {
    //     let mut planets = planets.borrow_mut();
    //     for planet in planets.values_mut() {
    //         if let Some(resource) = planet.resources.iter_mut().find(|r| r.resource_type == ResourceType::Energy) {
    //     resource.amount += 10;
    //         }
    //     }
    //         });

    //     ic_cdk::println!("Tick operations performed.");
    // }

    // #[query]
    // fn get_tick_count() -> u64 {
    //     TICK_COUNT.with(|count| *count.borrow())
    // }



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
// Export the Candid interface
ic_cdk::export_candid!();