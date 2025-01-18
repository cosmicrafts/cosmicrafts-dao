use candid::{CandidType, Deserialize};
use ic_cdk::api::time;
use ic_cdk::{update, query};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Star {
    id: u64,
    name: String,
    spectral_type: String,
    luminosity: f64,
    // Add more properties as needed
}

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Planet {
    id: u64,
    name: String,
    planet_type: String,
    moons: Vec<Moon>,
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
    static NEXT_STAR_SYSTEM_ID: RefCell<u64> = RefCell::new(1);
    static STAR_SYSTEMS: RefCell<HashMap<u64, StarSystem>> = RefCell::new(HashMap::new());
}

// Function to generate a new star system
#[update]
fn generate_star_system(name: String) -> u64 {
    let system_id = NEXT_STAR_SYSTEM_ID.with(|id| {
        let mut id = id.borrow_mut();
        let current_id = *id;
        *id += 1;
        current_id
    });

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

// Query function to get a star system by its ID
#[query]
fn get_star_system(id: u64) -> Option<StarSystem> {
    STAR_SYSTEMS.with(|systems| systems.borrow().get(&id).cloned())
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
// Export the Candid interface
ic_cdk::export_candid!();