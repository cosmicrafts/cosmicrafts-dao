
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

    // Add background
    const bg = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, 'background');
    bg.setDisplaySize(scene.scale.width, scene.scale.height);
    bg.setAlpha(0.95);

    // Example: Add a planet and a ship
    const GRID_SIZE = 100;
    scene.add.image(GRID_SIZE * 6, GRID_SIZE * 3, 'planet').setScale(0.1);
    scene.add.image(GRID_SIZE * 5, GRID_SIZE * 5, 'ship').setScale(0.05);
}
