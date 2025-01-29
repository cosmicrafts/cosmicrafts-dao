
import { Scene } from 'phaser';

export function preloadGame(scene: Scene) {
    scene.load.image('background', 'assets/space-bg.png');
    scene.load.image('planet', 'assets/planet2.webp');
    scene.load.image('ship', 'assets/ship.png');
}

export function createGame(scene: Scene) {
    // Enable mouse input
    scene.input.mouse!.enabled = true;
    scene.input.mouse!.preventDefaultWheel = true;

    // Example: Add a planet and a ship
    const GRID_SIZE = 100;
    scene.add.image(GRID_SIZE * 6, GRID_SIZE * 3, 'planet').setScale(0.5);
    scene.add.image(GRID_SIZE * 5, GRID_SIZE * 5, 'ship').setScale(0.05);
}
