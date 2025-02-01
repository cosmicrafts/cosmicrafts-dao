import { Scene } from 'phaser';

export function preload(scene: Scene) {
    scene.load.image('background', 'assets/space-bg.png');
    scene.load.image('planet', 'assets/planet3.webp');
    scene.load.image('ship', 'assets/ship.png');
}

export const textureSizes: { [key: string]: { width: number; height: number } } = {
    'planet': { width: 256, height: 256 },  // Adjust as needed
    'ship': { width: 32, height: 32 },
    'star': { width: 1024, height: 1024 },
    'mine': { width: 80, height: 80 }
};