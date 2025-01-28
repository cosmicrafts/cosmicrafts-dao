mod types;
use ic_cdk::{query, update};
use rstar::{RTree, AABB};
use std::cell::RefCell;
use types::{Acceleration, Entity, EntityId, EntityType, Position, Velocity};

thread_local! {
    static ENTITY_COUNTER: RefCell<EntityId> = RefCell::new(0);
    static GALAXY_TREE: RefCell<RTree<Entity>> = RefCell::new(RTree::new());
}

fn next_entity_id() -> EntityId {
    ENTITY_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        *counter
    })
}

#[update]
fn add_entity(entity_type: EntityType, position: Position) -> EntityId {
    let entity_id = next_entity_id();
    let entity = Entity {
        id: entity_id,
        entity_type,
        position,
        velocity: None,
        acceleration: None,
    };

    GALAXY_TREE.with(|tree| {
        tree.borrow_mut().insert(entity);
    });

    entity_id
}

#[update]
fn move_entity(entity_id: EntityId, target: Position, duration: f64) -> Result<(), String> {
    GALAXY_TREE.with(|tree| {
        let mut galaxy_tree = tree.borrow_mut();

        // Find the entity and clone it (immutable borrow)
        let entity = galaxy_tree
            .iter()
            .find(|e| e.id == entity_id)
            .ok_or("Entity not found")?
            .clone();

        // Calculate required velocity
        let dx = target.x - entity.position.x;
        let dy = target.y - entity.position.y;

        let velocity = Velocity {
            dx: dx / duration,
            dy: dy / duration,
        };

        // Create updated entity
        let mut updated_entity = entity.clone();
        updated_entity.velocity = Some(velocity);
        updated_entity.acceleration = None;

        // Remove the old entity and insert the updated one (mutable borrow)
        galaxy_tree.remove(&entity);
        galaxy_tree.insert(updated_entity);

        Ok(())
    })
}

/// Automatic position updater (call this periodically)
#[update]
fn update_positions(dt: f64) {
    GALAXY_TREE.with(|tree| {
        let mut galaxy_tree = tree.borrow_mut();

        // Collect updated entities into a Vec
        let updated_entities: Vec<Entity> = galaxy_tree
            .iter()
            .map(|entity| {
                let mut updated = entity.clone();

                // Apply velocity
                if let Some(vel) = &updated.velocity {
                    updated.position.x += vel.dx * dt;
                    updated.position.y += vel.dy * dt;
                }

                updated
            })
            .collect();

        // Replace the old tree with a new tree containing the updated entities
        *galaxy_tree = RTree::bulk_load(updated_entities);
    });
}

#[query]
fn export_entities() -> Vec<Entity> {
    GALAXY_TREE.with(|tree| tree.borrow().iter().cloned().collect())
}

#[query]
fn entities_in_area(lower: Position, upper: Position) -> Vec<Entity> {
    GALAXY_TREE.with(|tree| {
        tree.borrow()
            .locate_in_envelope_intersecting(&AABB::from_corners(
                [lower.x, lower.y],
                [upper.x, upper.y],
            ))
            .cloned()
            .collect()
    })
}

#[query]
fn entities_within_radius(center: Position, radius: f64) -> Vec<Entity> {
    GALAXY_TREE.with(|tree| {
        tree.borrow()
            .locate_within_distance([center.x, center.y], radius.powi(2))
            .cloned()
            .collect()
    })
}

#[update]

fn add_movement(
    entity_id: EntityId,
    velocity: Option<Velocity>,
    acceleration: Option<Acceleration>,
) -> Result<(), String> {
    GALAXY_TREE.with(|tree| {
        let mut galaxy_tree = tree.borrow_mut();

        // Find the entity first without mutating the tree
        let entity_opt = galaxy_tree.iter().find(|e| e.id == entity_id).cloned();

        if let Some(entity) = entity_opt {
            let mut updated_entity = entity.clone();
            updated_entity.velocity = velocity;
            updated_entity.acceleration = acceleration;

            // Mutate the tree after the iterator's borrow ends
            galaxy_tree.remove(&entity);
            galaxy_tree.insert(updated_entity);
            Ok(())
        } else {
            Err("Entity not found".to_string())
        }
    })
}

ic_cdk::export_candid!();