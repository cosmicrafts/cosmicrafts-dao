import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { preloadGame, createGame } from './GameSetup';
import { enableCameraControls } from './CameraControls';
import { GridRenderer } from './GridRenderer';

export class MainGame extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;
    gridRenderer!: GridRenderer;

    constructor() {
        super('MainGame');
    }

    preload() {
        preloadGame(this);
    }

    create() {
        console.log("Game started - Checking input system...");
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.setZoom(1);

        createGame(this);
        enableCameraControls(this);

        // Initialize the grid renderer
        this.gridRenderer = new GridRenderer(this);
    }

    update() {
        this.gridRenderer.updateGrid(); // ✅ Redraw only when necessary
    }
}
