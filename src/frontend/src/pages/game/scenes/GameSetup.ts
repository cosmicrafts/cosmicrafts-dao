import { Scene } from 'phaser';
import { EntityManager } from './EntityManager';

export function preloadGame(scene: Scene) {
    scene.load.image('background', 'assets/space-bg.png');
    scene.load.image('planet', 'assets/planet.png');
    scene.load.image('ship', 'assets/ship.png');
}

export function createGame(scene: Scene) {
    const entityManager = EntityManager.getInstance();
    entityManager.initialize(scene);
}