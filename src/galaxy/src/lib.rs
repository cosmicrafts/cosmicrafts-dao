use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk_macros::*;
use serde::Serialize;
use serde::de::DeserializeOwned;
use std::collections::HashMap;
use std::cell::RefCell;

type EntityId = u64;
type ComponentId = u64;
thread_local! {
    static STATE: RefCell<State> = RefCell::new(State::default());
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Position {
    x: f32,
    y: f32,
    z: f32,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Velocity {
    x: f32,
    y: f32,
    z: f32,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Spatial {
    //...
    x: f32,
    y: f32,
    z: f32,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Health {
    current: i32,
    max: i32,
}

const POSITION_ID: ComponentId = 1;
const VELOCITY_ID: ComponentId = 2;
const HEALTH_ID: ComponentId = 3;
const SPATIAL_ID: ComponentId = 4;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct ComponentUpdate {
    entity_id: EntityId,
    component_id: ComponentId,
    component_data: Vec<u8>,
    timestamp: u64,
}

#[derive(Default)]
struct ECS {
    entities: HashMap<EntityId, Vec<Component>>,
    next_entity_id: EntityId,
    cached_components: HashMap<(EntityId, ComponentId), Vec<u8>>, // Cache: (Entity, Component) -> Data
    pending_updates: Vec<ComponentUpdate>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
enum Component {
    Position(Position),
    Velocity(Velocity),
    Health(Health),
    Spatial(Spatial),
}

impl ECS {
    fn new() -> Self {
        ECS {
            entities: HashMap::new(),
            next_entity_id: 0,
            cached_components: HashMap::new(),
            pending_updates: Vec::new(),
        }
    }

    fn create_entity(&mut self) -> EntityId {
        let id = self.next_entity_id;
        self.next_entity_id += 1;
        self.entities.insert(id, Vec::new());
        id
    }

    fn add_component(&mut self, entity_id: EntityId, component: Component) {
        let components = self.entities.get_mut(&entity_id).unwrap();
        components.push(component.clone());
        let component_id = match component {
            Component::Position(_) => POSITION_ID,
            Component::Velocity(_) => VELOCITY_ID,
            Component::Health(_) => HEALTH_ID,
            Component::Spatial(_) => SPATIAL_ID,
        };

        let encoded = candid::encode_one(&component).unwrap();
        self.cached_components.insert((entity_id, component_id), encoded);
    }

    fn get_component<T: CandidType + Clone + DeserializeOwned>(
        &self,
        entity_id: EntityId,
        component_id: ComponentId,
    ) -> Option<T> {
        let cache_key = (entity_id, component_id);
    
        self.cached_components
            .get(&cache_key)
            .cloned()
            .and_then(|encoded| candid::decode_one(&encoded).ok()) // ✅ Fixes borrow issue
    }
    

    fn queue_update(&mut self, update: &ComponentUpdate) {
        self.pending_updates.push(update.clone());
    }

    fn clear_pending_updates(&mut self) -> Vec<ComponentUpdate> {
        std::mem::take(&mut self.pending_updates)
    }
}

trait System {
    fn update(&mut self, ecs: &mut ECS, dt: f64);
}

struct MovementSystem;

impl System for MovementSystem {
      fn update(&mut self, ecs: &mut ECS, dt: f64) {
        let now = ic_cdk::api::time();

        let mut entities_to_move: Vec<(EntityId, Position, Velocity)> = Vec::new();
        for (entity_id, components) in &ecs.entities {
            let mut position: Option<Position> = None;
            let mut velocity: Option<Velocity> = None;
            for component in components {
                match component {
                    Component::Position(p) => position = Some(p.clone()),
                    Component::Velocity(v) => velocity = Some(v.clone()),
                    _ => {}
                }
            }
            if let (Some(p), Some(v)) = (position, velocity) {
                entities_to_move.push((*entity_id, p, v));
            }
        }

        for (entity_id, mut position, velocity) in entities_to_move {
            position.x += velocity.x * (dt as f32);
            position.y += velocity.y * (dt as f32);
            position.z += velocity.z * (dt as f32);

            if let Some(components) = ecs.entities.get_mut(&entity_id) {
                for component in components {
                    if let Component::Position(ref mut p) = component {
                        *p = position.clone();
                        break;
                    }
                }
            }

            let component_data = candid::encode_one(position).unwrap();
            let update = ComponentUpdate {
                entity_id,
                component_id: POSITION_ID,
                component_data: component_data.clone(), // Use component_data directly
                timestamp: now,
            };
            ecs.queue_update(&update);
            let cache_key = (entity_id, POSITION_ID);
            ecs.cached_components.insert(cache_key, component_data); // Corrected line
        }
    }
}


struct State {
    ecs: ECS,
    motoko_canister_id: Principal,
    movement_system: MovementSystem,
}

impl Default for State {
    fn default() -> Self {
        State {
            ecs: ECS::new(),
            motoko_canister_id: Principal::management_canister(), // Replace with actual ID in post_upgrade
            movement_system: MovementSystem,
        }
    }
}

#[update]
fn initialize_state(motoko_canister_id: Principal) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        state.motoko_canister_id = motoko_canister_id;
    });
}


#[query]
fn get_cached_component_position(entity_id: EntityId) -> Option<Position> {
    STATE.with(|s| {
        let state = s.borrow();
        state.ecs.get_component::<Position>(entity_id, POSITION_ID)
    })
}

#[update]
async fn create_entity() -> EntityId {
    STATE.with(|s| {
        s.borrow_mut().ecs.create_entity()
    })
}

#[update]
async fn add_position_component(entity_id: EntityId, x: f32, y: f32, z: f32) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        let position = Position { x, y, z };
        state.ecs.add_component(entity_id, Component::Position(position));
    });
}

#[update]
async fn add_velocity_component(entity_id: EntityId, x: f32, y: f32, z: f32) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        let velocity = Velocity { x, y, z };
        state.ecs.add_component(entity_id, Component::Velocity(velocity));
    });
}

#[update]
async fn add_health_component(entity_id: EntityId, current: i32, max: i32) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        let health = Health { current, max };
        state.ecs.add_component(entity_id, Component::Health(health));
    });
}

#[update]
async fn add_spatial_component(entity_id: EntityId, x: f32, y: f32, z: f32) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        let spatial = Spatial { x, y, z };
        state.ecs.add_component(entity_id, Component::Spatial(spatial));
    });
}

async fn send_updates_to_motoko(state: &mut State) -> Result<(), String> {
    let updates = state.ecs.clear_pending_updates();
    if updates.is_empty() {
        return Ok(()); // Nothing to do.
    }

    for update in updates {
        let args = candid::encode_one(update).unwrap();

        let call_result: CallResult<()> =
            ic_cdk::api::call::call(state.motoko_canister_id, "receive_update", (args,)).await;

        call_result.map_err(|e| format!("Error calling Motoko: {:?}", e))?;
    }
    Ok(())
}

#[update]
async fn update(dt: f64) -> Result<(), String> {
    STATE.with(|s| {
        s.borrow_mut().movement_system.update(&mut s.borrow_mut().ecs, dt);
    });

    let updates = STATE.with(|s| {
        s.borrow_mut().ecs.clear_pending_updates()
    });

    if !updates.is_empty() {
        let motoko_canister_id = STATE.with(|s| s.borrow().motoko_canister_id);
        for update in updates {
            let args = candid::encode_one(update).unwrap();
            let call_result: CallResult<()> =
                ic_cdk::api::call::call(motoko_canister_id, "receive_update", (args,)).await;
            call_result.map_err(|e| format!("Error calling Motoko: {:?}", e))?;
        }
    }

    Ok(())
}

#[query]
fn get_motoko_canister_id() -> Principal {
    STATE.with(|s| s.borrow().motoko_canister_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_entity() {
        let mut ecs = ECS::new();
        let entity_id = ecs.create_entity();
        assert_eq!(entity_id, 0);
        assert_eq!(ecs.create_entity(), 1);
        assert_eq!(ecs.entities.len(), 2);
    }

    #[test]
    fn test_add_component() {
        let mut ecs = ECS::new();
        let entity_id = ecs.create_entity();
        let position = Position { x: 1.0, y: 2.0, z: 3.0 };
        ecs.add_component(entity_id, Component::Position(position.clone()));

        let components = ecs.get_components(entity_id).unwrap();
        assert_eq!(components.len(), 1);
        assert!(ecs.cached_components.contains_key(&(entity_id, POSITION_ID)));
    }

    #[test]
    fn test_get_component() {
        let mut ecs = ECS::new();
        let entity_id = ecs.create_entity();
        let position = Position { x: 1.0, y: 2.0, z: 3.0 };
        ecs.add_component(entity_id, Component::Position(position.clone()));
        let comp = ecs.get_component::<Position>(entity_id, POSITION_ID).unwrap();
        assert_eq!(comp.x, position.x);
    }
}