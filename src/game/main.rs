use bevy::input::mouse::{MouseMotion, MouseScrollUnit, MouseWheel};
use bevy::prelude::*;

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

// Add a component to tag your camera
#[derive(Component)]
struct MainCamera;

// Add a resource to control the zoom level
#[derive(Resource)]
struct ZoomLevel(f32);

// System to move the camera
fn move_camera(
    mut q: Query<&mut Transform, With<MainCamera>>,
    mut motion_evr: EventReader<MouseMotion>,
    buttons: Res<Input<MouseButton>>,
) {
    if buttons.pressed(MouseButton::Middle) {
        for event in motion_evr.iter() {
            for mut transform in q.iter_mut() {
                transform.translation.x -= event.delta.x;
                transform.translation.y += event.delta.y;
            }
        }
    }
}

// System to zoom the camera
fn zoom_camera(
    mut q: Query<&mut OrthographicProjection, With<MainCamera>>,
    mut scroll_evr: EventReader<MouseWheel>,
    mut zoom_level: ResMut<ZoomLevel>,
) {
    for event in scroll_evr.iter() {
        let zoom_change = match event.unit {
            MouseScrollUnit::Line => event.y * 0.1,
            MouseScrollUnit::Pixel => event.y * 0.001,
        };
        zoom_level.0 = (zoom_level.0 - zoom_change).clamp(0.1, 10.0);

        for mut projection in q.iter_mut() {
            projection.scale = zoom_level.0;
        }
    }
}

// Setup system
fn setup(mut commands: Commands) {
    // Create a simple camera
    commands.spawn((Camera2dBundle::default(), MainCamera));

    // Spawn a star
    commands.spawn((
        Position { x: 0.0, y: 0.0 },
        EntityType::Star,
        SpriteBundle {
            sprite: Sprite {
                color: Color::YELLOW,
                custom_size: Some(Vec2::new(10.0, 10.0)),
                ..default()
            },
            ..default()
        },
    ));

    // Spawn a planet
    commands.spawn((
        Position { x: 50.0, y: 20.0 },
        EntityType::Planet,
        SpriteBundle {
            sprite: Sprite {
                color: Color::BLUE,
                custom_size: Some(Vec2::new(8.0, 8.0)),
                ..default()
            },
            ..default()
        },
    ));
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .insert_resource(ZoomLevel(1.0))
        .add_systems(Startup, setup)
        .add_systems(Update, (move_camera, zoom_camera))
        .run();
}
