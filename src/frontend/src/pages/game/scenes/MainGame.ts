import { EventBus } from '../EventBus';
import { Scene, Math as PhaserMath } from 'phaser';
import { preloadGame, createGame } from './GameSetup';
import { enableCameraControls } from './CameraControls';
import { GridRenderer } from './GridRenderer';
import { BackgroundRenderer } from './BackgroundRenderer';
import { EntityManager } from './EntityManager';

export class MainGame extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    backgroundRenderer!: BackgroundRenderer;
    gridRenderer!: GridRenderer;
    private entityManager = EntityManager.getInstance();

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

        // ✅ Initialize the background renderer
        this.backgroundRenderer = new BackgroundRenderer(this);

        // ✅ Initialize the grid renderer
        this.gridRenderer = new GridRenderer(this);

        // ✅ Listen for reset event
        EventBus.on('reset-camera', () => {
            this.resetCamera();
        });
    }

    update() {
        this.entityManager.update();
        this.gridRenderer.updateGrid(); // ✅ Update grid only when needed
        this.backgroundRenderer.update(); // ✅ Ensure the background tiles correctly
    }

    resetCamera() {
        this.tweens.add({
            targets: this.camera,
            scrollX: 0,
            scrollY: 0,
            zoom: 1,
            duration: 1000, // Smooth transition in ms
            ease: PhaserMath.Easing.Cubic.Out
        });
    }
}