use candid::{CandidType, Deserialize};
use rstar::{RTreeObject, AABB, PointDistance};

pub type EntityId = u64;

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum EntityType {
    Planet,
    Star,
    Ship,
    Mine,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct Velocity {
    pub dx: f64,
    pub dy: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct Acceleration {
    pub ax: f64,
    pub ay: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct Entity {
    pub id: EntityId,
    pub entity_type: EntityType,
    pub position: Position,
    pub velocity: Option<Velocity>,
    pub acceleration: Option<Acceleration>,
}

impl RTreeObject for Entity {
    type Envelope = AABB<[f64; 2]>;

    fn envelope(&self) -> Self::Envelope {
        AABB::from_point([self.position.x, self.position.y])
    }
}

impl PointDistance for Entity {
    fn distance_2(&self, point: &[f64; 2]) -> f64 {
        let dx = self.position.x - point[0];
        let dy = self.position.y - point[1];
        dx * dx + dy * dy
    }
}