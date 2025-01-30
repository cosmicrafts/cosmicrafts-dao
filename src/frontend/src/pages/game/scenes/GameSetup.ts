import { Scene } from 'phaser';
import { EntityManager } from './EntityManager';

export function preloadGame(scene: Scene) {
    scene.load.image('background', 'assets/space-bg.png');
    scene.load.image('planet', 'assets/planet2.webp');
    scene.load.image('ship', 'assets/ship.png');
}

export function createGame(scene: Scene) {
    const entityManager = EntityManager.getInstance();
    entityManager.initialize(scene);

    const GRID_SIZE = 100;
    
    // Create entities with data
    entityManager.createEntity(
        GRID_SIZE * 6, 
        GRID_SIZE * 3, 
        'planet', 
        { type: 'Planet', health: 1000, owner: 'Neutral', status: 'Idle' }
    );

    entityManager.createEntity(
        GRID_SIZE * 5, 
        GRID_SIZE * 5, 
        'ship', 
        { type: 'Fighter', health: 100, owner: 'Player', status: 'Patrolling' }
    );
}