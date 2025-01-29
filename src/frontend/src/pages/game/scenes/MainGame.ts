import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainGame extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera; // Ensures it's assigned in create()
    background!: Phaser.GameObjects.Image;

    constructor() {
        super('MainGame');
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/space-bg.png'); // Starry background
        this.load.image('planet', 'assets/planet.webp'); // Placeholder planet
        this.load.image('ship', 'assets/ship.png'); // Placeholder ship
    }

    create() {
        // Set up the camera
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000); // Space is black

        // Add space background, ensuring it scales properly
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        this.background.setDisplaySize(this.scale.width, this.scale.height);
        this.background.setAlpha(.95);

        // Draw a grid for debugging (can be removed later)
        this.drawGrid();

        // Example: Add one planet and one ship
        this.add.image(600, 300, 'planet').setScale(0.1);
        this.add.image(500, 500, 'ship').setScale(0.05);

        // Notify Vue that the scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    drawGrid() {
        const GRID_SIZE = 100; // Base grid size
        const SUBDIVISIONS = 2; // Number of times each grid cell can be divided
        const LSUBDIVISIONS = 4;
        const SUB_GRID_SIZE = GRID_SIZE / SUBDIVISIONS; // Smaller grid division
        const LSUB_GRID_SIZE = GRID_SIZE / LSUBDIVISIONS;

        const graphics = this.add.graphics();
        
        // Main grid lines
        graphics.lineStyle(0.5, 0x555555, 0.5);
        for (let x = 0; x < this.scale.width; x += GRID_SIZE) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.scale.height);
        }
        for (let y = 0; y < this.scale.height; y += GRID_SIZE) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.scale.width, y);
        }
    
        // Fractional grid lines (subdivisions)
        graphics.lineStyle(0.4, 0x777777, 0.4);
        for (let x = 0; x < this.scale.width; x += SUB_GRID_SIZE) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.scale.height);
        }
        for (let y = 0; y < this.scale.height; y += SUB_GRID_SIZE) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.scale.width, y);
        }

        // Smaller fractional grid lines (subdivisions of sub)
        graphics.lineStyle(0.3, 0x777777, 0.3);
        for (let x = 0; x < this.scale.width; x += LSUB_GRID_SIZE) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.scale.height);
        }
        for (let y = 0; y < this.scale.height; y += LSUB_GRID_SIZE) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.scale.width, y);
        }
    
        graphics.strokePath();
    }
    

}
