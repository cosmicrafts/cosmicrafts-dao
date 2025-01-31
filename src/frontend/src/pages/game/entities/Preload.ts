import { Scene } from 'phaser';

export function preload(scene: Scene) {
    scene.load.image('background', 'assets/space-bg.png');
    scene.load.image('planet', 'assets/planet3.webp');
    scene.load.image('ship', 'assets/ship.png');
}

export const textureSizes: { [key: string]: { width: number; height: number } } = {
    'planet': { width: 1024, height: 1024 },  // Adjust as needed
    'ship': { width: 128, height: 128 },
    'star': { width: 128, height: 128 },
    'mine': { width: 80, height: 80 }
};