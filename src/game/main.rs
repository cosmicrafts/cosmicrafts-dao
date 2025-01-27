use bevy::prelude::*;
use bevy::text::FontSmoothing;
use bevy_dev_tools::fps_overlay::{FpsOverlayConfig, FpsOverlayPlugin};
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

    let sprite_material = materials.add(
        // the other args (hframes and vframes) defines how the sprite sheet is divided for animating,
        // you can also just use `form_texture` for a single sprite
        SpriteParticle2dMaterial::new(server.load("particle.png"), 6, 1),
    );

    // Spawn particle system near the star
    commands.spawn((
        ParticleSpawner(sprite_material),
        ParticleEffectHandle(server.load("1.ron")),
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
            FpsOverlayPlugin {
                config: FpsOverlayConfig {
                    text_config: TextFont {
                        font_size: 24.0, // Adjust the font size as needed
                        font: default(), // Use the default font
                        font_smoothing: FontSmoothing::default(),
                    },
                    text_color: Color::srgb(1.0, 1.0, 0.0),
                    enabled: true,            // Enable the overlay
                },
            },
        ))
        .add_systems(Startup, setup)
        .add_systems(Update, sync_position)
        .run();
}

fn main() {
    start_game();
}