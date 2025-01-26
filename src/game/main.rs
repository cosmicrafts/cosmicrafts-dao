use bevy::input::mouse::{MouseMotion, MouseScrollUnit, MouseWheel};
use bevy::prelude::*;
use wasm_bindgen::prelude::*;

// Components
#[derive(Component, Debug)]
struct Position {
    x: f32,
    y: f32,
}
// Resource for zoom level
#[derive(Resource)]
struct ZoomLevel(f32);

#[derive(Component, Debug)]
enum EntityType {
    Star,
    Planet,
}

#[derive(Component, Debug)]
struct EntityData {
    name: String,
    description: String,
    size: f32,
    owner: String,
}

fn sync_position(mut query: Query<(&mut Position, &Transform)>) {
      for (mut position, transform) in &mut query {
          // Synchronize Position with Transform
          position.x = transform.translation.x;
          position.y = transform.translation.y;
      }
  }


// Tag component for the camera
#[derive(Component)]
struct MainCamera;

// Move camera system (panning)
fn move_camera(
    mut q: Query<&mut Transform, With<MainCamera>>,
    mut motion_evr: EventReader<MouseMotion>,
    buttons: Res<ButtonInput<MouseButton>>,
    windows: Query<&Window>,
) {
    if buttons.pressed(MouseButton::Middle) {
        let window = windows.single();
        let window_size = Vec2::new(window.width(), window.height());

        for event in motion_evr.read() {
            for mut transform in &mut q {
                // Adjust translation based on window size and zoom level
                transform.translation.x -= event.delta.x * transform.scale.x;
                transform.translation.y += event.delta.y * transform.scale.y;

                // Clamp camera movement to prevent going out of bounds
                transform.translation.x = transform.translation.x.clamp(-window_size.x, window_size.x);
                transform.translation.y = transform.translation.y.clamp(-window_size.y, window_size.y);
            }
        }
    }
}

// Zoom camera system
fn zoom_camera(
      mut q: Query<(&mut Transform, &mut OrthographicProjection), With<MainCamera>>,
      mut scroll_evr: EventReader<MouseWheel>,
      mut zoom_level: ResMut<ZoomLevel>, // Access ZoomLevel here
      windows: Query<&Window>,
  ) {
      let window = windows.single();
      let window_size = Vec2::new(window.width(), window.height());
  
      for event in scroll_evr.read() {
          let zoom_change = match event.unit {
              MouseScrollUnit::Line => event.y * 0.1,
              MouseScrollUnit::Pixel => event.y * 0.001,
          };
  
          // Update the global zoom level
          zoom_level.0 = (zoom_level.0 - zoom_change).clamp(0.1, 10.0);
  
          for (mut transform, mut projection) in &mut q {
              projection.scale = zoom_level.0; // Use the global zoom level
  
              // Adjust translation to zoom towards the mouse position
              let mouse_pos = window.cursor_position().unwrap_or_default();
              let mouse_world_pos = transform.translation + Vec3::new(
                  (mouse_pos.x - window_size.x / 2.0) * projection.scale,
                  (mouse_pos.y - window_size.y / 2.0) * projection.scale,
                  0.0,
              );
  
              transform.translation = mouse_world_pos;
          }
      }
}
  

 fn log_entity_data(query: Query<&EntityData>) {
      for data in &query {
          println!(
              "Entity: {}, Description: {}, Size: {}, Owner: {}",
              data.name, data.description, data.size, data.owner
          );
      }
  }
  
  fn setup(mut commands: Commands) {
      // Spawn the main camera
      commands.spawn((
          Camera2d,
          MainCamera,
      ));
  
      // Spawn star
      commands.spawn((
          Position { x: 0.0, y: 0.0 },
          EntityType::Star,
          EntityData {
              name: "Star".to_string(),
              description: "A shining star.".to_string(),
              size: 10.0,
              owner: "Player1".to_string(),
          },
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
          EntityData {
              name: "Planet".to_string(),
              description: "A small blue planet.".to_string(),
              size: 8.0,
              owner: "Player2".to_string(),
          },
          Sprite {
              color: Color::srgb(0.0, 0.0, 1.0),
              custom_size: Some(Vec2::new(8.0, 8.0)),
              ..default()
          },
          Transform::from_translation(Vec3::new(50.0, 20.0, 0.0)),
          Visibility::default(),
      ));
  }
  
  #[wasm_bindgen]
  pub fn start_game() {
      App::new()
          .add_plugins(DefaultPlugins.set(WindowPlugin {
              primary_window: Some(Window {
                  fit_canvas_to_parent: true,
                  ..default()
              }),
              ..default()
          }))
          .insert_resource(ZoomLevel(1.0))
          .add_systems(Startup, setup)
          .add_systems(Update, (move_camera, zoom_camera, sync_position, log_entity_data)) // Add log_entity_data
          .run();
  }
  

