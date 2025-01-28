use ic_cdk::{query, update};
use ic_cdk_timers::TimerId;
use std::cell::RefCell;
use std::time::Duration;
use std::collections::HashMap;
use candid::{CandidType, Deserialize};

// Simplified Entity and Component Types
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
struct Position {
    x: f64,
    y: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
struct Velocity {
    dx: f64,
    dy: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum EntityType {
    Planet,
    Star,
    Ship,
    Mine,
    Player,
}


#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
struct Entity {
    id: u64,
    entity_type: EntityType,
    position: Position,
    velocity: Velocity, 
}

// Constants
const MAP_WIDTH: f64 = 1000.0;
const MAP_HEIGHT: f64 = 1000.0;

thread_local! {
    static ENTITIES: RefCell<HashMap<u64, Entity>> = RefCell::new(HashMap::new());
    static ENTITY_COUNTER: RefCell<u64> = RefCell::new(0);
    static TIMER_ID: RefCell<Option<TimerId>> = RefCell::new(None);
}

// Deterministic ID Generation
fn next_entity_id() -> u64 {
    ENTITY_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        *counter
    })
}

// Deterministic Position Generation (using time and entity ID)
fn generate_deterministic_position(entity_id: u64) -> Position {
    let current_time = ic_cdk::api::time();
    let x = (current_time as f64 * entity_id as f64) % MAP_WIDTH;
    let y = (current_time as f64 / (entity_id as f64 + 1.0)) % MAP_HEIGHT; 
    Position { x, y }
}

// Simplified Spawn Function
#[update]
fn spawn_entity(entity_type: EntityType) -> u64 {
    let entity_id = next_entity_id();
    let position = generate_deterministic_position(entity_id);

    let entity = Entity {
        id: entity_id,
        entity_type,
        position,
        velocity: Velocity { dx: 0.0, dy: 0.0 }, // Initial velocity
    };

    ENTITIES.with(|entities| {
        entities.borrow_mut().insert(entity_id, entity);
    });

    entity_id
}

// Movement Update
#[update]
fn move_entity(entity_id: u64, target_x: f64, target_y: f64) -> Result<(), String> {
    ENTITIES.with(|entities| {
        let mut entities = entities.borrow_mut();
        if let Some(entity) = entities.get_mut(&entity_id) {
            // Simple velocity calculation (you can add smoothing/acceleration here)
            let dx = target_x - entity.position.x;
            let dy = target_y - entity.position.y;
            let distance = (dx * dx + dy * dy).sqrt();
            let speed = 10.0;

            entity.velocity = if distance > 1.0 {
                Velocity {
                    dx: dx / distance * speed,
                    dy: dy / distance * speed,
                }
            } else {
                Velocity { dx: 0.0, dy: 0.0 }
            };

            Ok(())
        } else {
            Err("Entity not found".to_string())
        }
    })
}

// Game Loop
fn update_world(dt: f64) {
    ENTITIES.with(|entities| {
        let mut entities = entities.borrow_mut();
        for entity in entities.values_mut() {
            entity.position.x += entity.velocity.dx * dt;
            entity.position.y += entity.velocity.dy * dt;

            // Keep entity within bounds
            entity.position.x = entity.position.x.max(0.0).min(MAP_WIDTH);
            entity.position.y = entity.position.y.max(0.0).min(MAP_HEIGHT);
        }
    });
}

#[update]
fn start_game_loop() {
    let timer_id = ic_cdk_timers::set_timer_interval(Duration::from_millis(100), || {
        ic_cdk::spawn(async {
            update_world(0.1); 
        });
    });
    TIMER_ID.with(|id| {
        *id.borrow_mut() = Some(timer_id);
    });
}

// Export Entities
#[query]
fn export_entities() -> Vec<Entity> {
    ENTITIES.with(|entities| entities.borrow().values().cloned().collect())
}

//... (Simplified spatial queries if needed)

ic_cdk::export_candid!();