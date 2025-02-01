use ic_cdk_timers::TimerId;
use std::cell::RefCell;
use std::time::Duration;
use std::collections::HashMap;
use serde::Serialize;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::init;
use std::collections::VecDeque;

#[init]
fn init() {
    ic_cdk::println!("Init function executed.");
    start_game_loop();
    spawn_entity(EntityType::Ship);
}
// Simplified Entity and Component Types
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
struct GameFrame {
    frame_number: u64,
    timestamp: u64,          // Time in nanoseconds at the end of this frame
    entities: Vec<Entity>,   // Snapshot of all entities
}
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
struct Position {
    x: f64,
    y: f64,
}
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
struct TargetPosition {
    x: f64,
    y: f64,
}
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
struct Entity {
    id: u64,
    entity_type: EntityType,
    position: Position,
    target_position: Option<TargetPosition>, // Where the entity is moving towards
    speed: f64, // Base speed of the entity
}
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum EntityType {
    Planet,
    Star,
    Ship,
    Mine,
    Player,
}
// Constants
const MAP_WIDTH: f64 = 1000.0;
const MAP_HEIGHT: f64 = 1000.0;
const DEFAULT_ENTITY_SPEED: f64 = 100.0;
thread_local! {
    static GAME_FRAMES: RefCell<VecDeque<GameFrame>> = RefCell::new(VecDeque::with_capacity(200));
    static FRAME_NUMBER: RefCell<u64> = RefCell::new(0);


    static ENTITIES: RefCell<HashMap<u64, Entity>> = RefCell::new(HashMap::new());
    static ENTITY_COUNTER: RefCell<u64> = RefCell::new(0);
    static TIMER_ID: RefCell<Option<TimerId>> = RefCell::new(None);

    static PLAYERS: RefCell<HashMap<Principal, Player>> = RefCell::new(HashMap::new());
    static MULTIPLIER_BY_PLAYER: RefCell<HashMap<Principal, f64>> = RefCell::new(HashMap::new());
    static AVAILABLE_AVATARS: RefCell<HashMap<Principal, Vec<u32>>> = RefCell::new(HashMap::new());
    static AVAILABLE_TITLES: RefCell<HashMap<Principal, Vec<u32>>> = RefCell::new(HashMap::new());

}
fn next_entity_id() -> u64 {
    ENTITY_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        *counter
    })
}
fn generate_deterministic_position(entity_id: u64) -> Position {
    let current_time = ic_cdk::api::time();
    let x = (current_time as f64 * entity_id as f64) % MAP_WIDTH;
    let y = (current_time as f64 / (entity_id as f64 + 1.0)) % MAP_HEIGHT;
    Position { x, y }
}
#[ic_cdk::update]
fn spawn_entity(entity_type: EntityType) -> u64 {
    let entity_id = next_entity_id();
    let position = generate_deterministic_position(entity_id);

    let entity = Entity {
        id: entity_id,
        entity_type,
        position,
        target_position: None,
        speed: DEFAULT_ENTITY_SPEED,
    };

    ENTITIES.with(|entities| {
        entities.borrow_mut().insert(entity_id, entity);
    });

    entity_id
}
#[ic_cdk::update]
fn spawn_multiple_entities(entity_type: EntityType, count: u64) -> Vec<u64> {
    let mut entity_ids = Vec::new();

    ENTITIES.with(|entities| {
        let mut entities = entities.borrow_mut();
        for _ in 0..count {
            let entity_id = next_entity_id();
            let position = generate_deterministic_position(entity_id);

            let entity = Entity {
                id: entity_id,
                entity_type: entity_type.clone(),
                position,
                target_position: None,
                speed: DEFAULT_ENTITY_SPEED,
            };

            entities.insert(entity_id, entity);
            entity_ids.push(entity_id);
        }
    });

    entity_ids
}
#[ic_cdk::update]
fn move_entity(entity_id: u64, target_x: f64, target_y: f64) -> Result<(), String> {
    ENTITIES.with(|entities| {
        let mut entities = entities.borrow_mut();
        if let Some(entity) = entities.get_mut(&entity_id) {
            entity.target_position = Some(TargetPosition {
                x: target_x,
                y: target_y,
            });
            Ok(())
        } else {
            Err("Entity not found".to_string())
        }
    })
}

fn update_world(dt: f64) {
    ENTITIES.with(|entities| {
        let mut entities = entities.borrow_mut();

        // (1) update positions as you do now
        let mut to_remove = Vec::new();
        for (entity_id, entity) in entities.iter_mut() {
            if let Some(target_pos) = &entity.target_position {
                let dx = target_pos.x - entity.position.x;
                let dy = target_pos.y - entity.position.y;
                let distance = (dx*dx + dy*dy).sqrt();
                if distance <= entity.speed * dt {
                    entity.position.x = target_pos.x;
                    entity.position.y = target_pos.y;
                    to_remove.push(*entity_id);
                } else {
                    let move_x = dx / distance * entity.speed * dt;
                    let move_y = dy / distance * entity.speed * dt;
                    entity.position.x += move_x;
                    entity.position.y += move_y;
                    entity.position.x = entity.position.x.max(0.0).min(MAP_WIDTH);
                    entity.position.y = entity.position.y.max(0.0).min(MAP_HEIGHT);
                }
            }
        }
        for entity_id in to_remove {
            if let Some(entity) = entities.get_mut(&entity_id) {
                entity.target_position = None;
            }
        }
    });

    // (2) increment FRAME_NUMBER
    let current_frame = FRAME_NUMBER.with(|f| {
        let mut frame = f.borrow_mut();
        *frame += 1;
        *frame
    });

    // (3) snapshot the entire entity list
    let timestamp = ic_cdk::api::time();
    let snapshot = ENTITIES.with(|entities| {
        entities.borrow().values().cloned().collect::<Vec<Entity>>()
    });

    let game_frame = GameFrame {
        frame_number: current_frame,
        timestamp,
        entities: snapshot,
    };

    // (4) store the frame
    GAME_FRAMES.with(|frames| {
        let mut frames = frames.borrow_mut();
        frames.push_back(game_frame);

        // if we exceed capacity, pop the oldest
        if frames.len() > 200 {
            frames.pop_front();
        }
    });
}


#[ic_cdk::update]
fn start_game_loop() {
    ic_cdk::println!("Game loop started.");
    let timer_id = ic_cdk_timers::set_timer_interval(Duration::from_millis(100), || {
        ic_cdk::spawn(async {
           // ic_cdk::println!("Updating world...");
            update_world(0.1); // Update every 100ms (0.1 seconds)
        });
    });
    TIMER_ID.with(|id| {
        *id.borrow_mut() = Some(timer_id);
    });
}



#[ic_cdk::query]
fn export_entities() -> Vec<Entity> {
    ENTITIES.with(|entities| entities.borrow().values().cloned().collect())
}

// Return all frames AFTER a given frame number (exclusive)
#[ic_cdk::query]
fn get_frames_since(frame_number: u64) -> Vec<GameFrame> {
    GAME_FRAMES.with(|frames| {
        frames
            .borrow()
            .iter()
            .filter(|f| f.frame_number > frame_number)
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn get_latest_frame_number() -> u64 {
    FRAME_NUMBER.with(|f| *f.borrow())
}

// User reg

    // --- Player Management ---

    #[ic_cdk::query]
    fn get_player() -> Option<Player> {
        let caller = ic_cdk::caller();
        PLAYERS.with(|players| players.borrow().get(&caller).cloned())
    }

    #[ic_cdk::update]
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
        associated_entities: Vec<Principal>, // IDs of associated entities (e.g., factions, colonies, fleets)
    }
    enum ReferralCodeResult {
        Ok(String),
        _Err(String),
    }


    //... (Simplified spatial queries if needed)

ic_cdk::export_candid!();