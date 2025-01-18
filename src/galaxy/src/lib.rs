use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::{update, query};
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk_timers::{TimerId, set_timer_interval};

// --- Data Structures ---

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Player {
id: Principal,
name: String,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
enum ResourceType {
Energy,
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
    owner_id: Principal, // Change to Principal
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
    planet_type: String,
    moons: Vec<Moon>,
    owner_id: Option<Principal>, // Update to use Principal
    resources: Vec<Resource>,
    buildings: Vec<Building>,
    orbiting_fleets: Vec<u64>, // Fleet IDs
}


#[derive(CandidType, Deserialize, Clone, Debug)]
struct Star {
id: u64,
name: String,
spectral_type: String,
luminosity: f64,
// Add more properties as needed
}

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Moon {
id: u64,
name: String,
// Add more properties as needed
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
}

thread_local! {
static PLAYERS: RefCell<HashMap<Principal, Player>> = RefCell::new(HashMap::new());

static TICK_TIMER: RefCell<Option<TimerId>> = RefCell::new(None);
static TICK_COUNT: RefCell<u64> = RefCell::new(0);

static NEXT_PLAYER_ID: RefCell<u64> = RefCell::new(1);
static NEXT_BUILDING_ID: RefCell<u64> = RefCell::new(1);
static NEXT_FLEET_ID: RefCell<u64> = RefCell::new(1);
static NEXT_SHIP_ID: RefCell<u64> = RefCell::new(1);
static NEXT_STAR_SYSTEM_ID: RefCell<u64> = RefCell::new(1);
static NEXT_PLANET_ID: RefCell<u64> = RefCell::new(1);

static STAR_SYSTEMS: RefCell<HashMap<u64, StarSystem>> = RefCell::new(HashMap::new());
static PLANETS: RefCell<HashMap<u64, Planet>> = RefCell::new(HashMap::new());
static FLEETS: RefCell<HashMap<u64, Fleet>> = RefCell::new(HashMap::new());
}


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


// --- Initialization ---

#[update]
fn init_game() {
    // Create an initial star system with some planets
    let initial_system_id = generate_star_system("Sol System".to_string());

    // Add a few planets to the initial system
    let planet_names = vec!["Earth", "Mars", "Venus"];
    for name in planet_names {
        // Pass `initial_system_id` to `create_planet`
        let planet = create_planet(name.to_string(), initial_system_id);
        add_planet_to_system(initial_system_id, planet).expect("Failed to add planet to system");
    }
}


// --- Player Management ---

#[update]
fn register_player(name: String) -> String {
    let caller = ic_cdk::caller(); // Get the caller's Principal

    // Prevent a player from registering with a duplicate name.
    let existing_player = PLAYERS.with(|players| {
        players.borrow().values().find(|player| player.name == name).cloned()
    });

    if existing_player.is_some() {
        return "Player with that name already exists".to_string();
    }

    let player = Player {
        id: caller,
        name,
    };

    PLAYERS.with(|players| {
        players.borrow_mut().insert(caller, player);
    });

    caller.to_string() // Return the Principal as a string
}

#[query]
fn get_player() -> Option<Player> {
    let caller = ic_cdk::caller();
    PLAYERS.with(|players| players.borrow().get(&caller).cloned())
}

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

// Function to add an asteroid belt to a star system
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

    // Update function to remove a star system
    #[update]
    fn remove_star_system(id: u64) -> Result<(), String> {
    STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if systems.remove(&id).is_some() {
            Ok(())
        } else {
            Err("Star system not found.".to_string())
        }
    })
}

// Function to remove a star from a star system
#[update]
fn remove_star_from_system(system_id: u64, star_id: u64) -> Result<(), String> {
    STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if let Some(system) = systems.get_mut(&system_id) {
            if let Some(index) = system.stars.iter().position(|s| s.id == star_id) {
                system.stars.remove(index);
                system.last_updated = time();
                Ok(())
            } else {
                Err("Star not found in this star system.".to_string())
            }
        } else {
            Err("Star system not found.".to_string())
        }
    })
}

// Function to remove a planet from a star system
#[update]
fn remove_planet_from_system(system_id: u64, planet_id: u64) -> Result<(), String> {
    STAR_SYSTEMS.with(|systems| {
        let mut systems = systems.borrow_mut();
        if let Some(system) = systems.get_mut(&system_id) {
            if let Some(index) = system.planets.iter().position(|p| p.id == planet_id) {
                system.planets.remove(index);
                system.last_updated = time();
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

// --- Star System Management ---

#[update]
fn generate_star_system(name: String) -> u64 {
    let system_id = NEXT_STAR_SYSTEM_ID.with(|id| {
        let mut id = id.borrow_mut();
        let current_id = *id;
        *id += 1;
        current_id
    });

    // Correct initialization of `StarSystem`
    let new_system = StarSystem {
        id: system_id,
        name,
        stars: vec![],
        planets: vec![],
        moons: vec![],
        asteroid_belts: vec![],
        last_updated: time(),
    };

    STAR_SYSTEMS.with(|systems| {
        systems.borrow_mut().insert(system_id, new_system);
    });

    system_id
}

#[query]
fn get_star_system(system_id: u64) -> Option<StarSystem> {
STAR_SYSTEMS.with(|systems| systems.borrow().get(&system_id).cloned())
}

// --- Planet Management ---

#[update]
fn create_planet(name: String, system_id: u64) -> Planet {
    let planet_id = NEXT_PLANET_ID.with(|id| {
        let mut id = id.borrow_mut();
        let current_id = *id;
        *id += 1;
        current_id
    });

    let energy_resource = Resource {
        resource_type: ResourceType::Energy,
        amount: 1000, // Starting amount
    };

    let planet = Planet {
        id: planet_id,
        name,
        system_id, // Include system_id
        planet_type: "Terrestrial".to_string(),
        moons: vec![],
        owner_id: None,
        resources: vec![energy_resource],
        buildings: vec![],
        orbiting_fleets: vec![],
    };

    PLANETS.with(|planets| {
        planets.borrow_mut().insert(planet_id, planet.clone());
    });

    planet
}


#[query]
fn get_planet(planet_id: u64) -> Option<Planet> {
PLANETS.with(|planets| planets.borrow().get(&planet_id).cloned())
}

#[update]
fn claim_planet(planet_id: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();

    // Check if the player is registered
    if !PLAYERS.with(|players| players.borrow().contains_key(&caller)) {
        return Err("Player not registered.".to_string());
    }

    PLANETS.with(|planets| {
        let mut planets = planets.borrow_mut();
        if let Some(planet) = planets.get_mut(&planet_id) {
            if planet.owner_id.is_none() {
                planet.owner_id = Some(caller); // Assign the caller's Principal
                Ok(())
            } else {
                Err("Planet is already owned.".to_string())
            }
        } else {
            Err("Planet not found.".to_string())
        }
    })
}

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

// --- Building Management ---

#[update]
fn build_structure(planet_id: u64, building_type: BuildingType) -> Result<u64, String> {
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

    // Proceed with building the structure
    let building_id = NEXT_BUILDING_ID.with(|id| {
        let mut id = id.borrow_mut();
        let current_id = *id;
        *id += 1;
        current_id
    });

    let cost = match building_type {
        BuildingType::Mine => 500, // Example cost for a mine
        BuildingType::Shipyard => 1000, // Example cost for a shipyard
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

                let building = Building {
                    id: building_id,
                    building_type,
                    level: 1, // Initial level
                };
                planet.buildings.push(building);

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
            planet.owner_id == Some(caller) &&
            planet.buildings.iter().any(|b| b.building_type == BuildingType::Shipyard)
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
        Ok::<(), String>(()) // Indicate success
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

        let mut new_fleet = Fleet {
            id: new_fleet_id,
            owner_id: caller,
            ships: vec![],
        };

        new_fleet.ships.push(new_ship);
        fleets.insert(new_fleet_id, new_fleet);
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

    let new_fleet = Fleet {
        id: fleet_id,
        owner_id: caller, // Set the owner of the fleet
        ships: Vec::new(),
    };

    FLEETS.with(|fleets| {
        fleets.borrow_mut().insert(fleet_id, new_fleet);
    });

    Ok(fleet_id)
}

// Export the Candid interface
ic_cdk::export_candid!();