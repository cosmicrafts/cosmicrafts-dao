import { Scene } from 'phaser';
import { EntityManager } from './EntityManager';

export function preloadGame(scene: Scene) {
    scene.load.image('background', 'assets/space-bg.png');
    scene.load.image('planet', 'assets/planet3.webp');
    scene.load.image('ship', 'assets/ship.png');
}