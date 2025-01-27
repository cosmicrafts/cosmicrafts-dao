use bevy::prelude::*;
use wasm_bindgen::prelude::*;
use bevy_pancam::{PanCam, PanCamPlugin};
use bevy_enoki::prelude::*;

// Components
#[derive(Component, Debug)]
struct Position {
    x: f32,
    y: f32,
}

#[derive(Component, Debug)]
enum EntityType {
    Star,
    Planet,
}

fn sync_position(mut query: Query<(&mut Position, &Transform)>) {
    for (mut position, transform) in &mut query {
        position.x = transform.translation.x;
        position.y = transform.translation.y;
    }
}

fn setup(
    mut commands: Commands,
    mut materials: ResMut<Assets<SpriteParticle2dMaterial>>,
    server: Res<AssetServer>,
) {
    // Spawn the main camera with PanCam
    commands.spawn((
        Camera2d,
        PanCam {
            grab_buttons: vec![MouseButton::Left], // Use LEFT mouse button for panning
            zoom_to_cursor: true,                 // Zoom towards the mouse cursor
            min_scale: 0.1,                       // Minimum zoom level
            max_scale: 10.0,                      // Maximum zoom level
            ..default()
        },
    ));

    // Spawn star
    commands.spawn((
        Position { x: 0.0, y: 0.0 },
        EntityType::Star,
        Sprite {
            color: Color::srgb(1.0, 1.0, 0.0),
            custom_size: Some(Vec2::new(10.0, 10.0)),
            ..default()
        },
        Transform::default(),
        Visibility::default(),
    ));

    // Spawn planet
    commands.spawn((
        Position { x: 50.0, y: 20.0 },
        EntityType::Planet,
        Sprite {
            color: Color::srgb(0.0, 0.0, 1.0),
            custom_size: Some(Vec2::new(8.0, 8.0)),
            ..default()
        },
        Transform::from_translation(Vec3::new(50.0, 20.0, 0.0)),
        Visibility::default(),
    ));

    // Spawn particle system near the star
    commands.spawn((
        ParticleSpawner::default(),
        ParticleEffectHandle(server.load("firework.particle.ron")),
        Transform::from_translation(Vec3::new(10.0, 0.0, 0.0)), // Position the particle system near the star
    ));
}

#[wasm_bindgen]
pub fn start_game() {
    App::new()
        .add_plugins((
            DefaultPlugins.set(WindowPlugin {
                primary_window: Some(Window {
                    fit_canvas_to_parent: true,
                    prevent_default_event_handling: false,
                    canvas: Some("#game-canvas".to_string()),
                    ..default()
                }),
                ..default()
            }),
            PanCamPlugin::default(),
            EnokiPlugin,
        ))
        .add_systems(Startup, setup)
        .add_systems(Update, sync_position)
        .run();
}

fn main() {
    start_game();
}