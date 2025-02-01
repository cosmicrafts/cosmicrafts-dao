import { EventBus } from '../EventBus';
import { Scene, Math as PhaserMath } from 'phaser';
import { preload } from './Preload';
import { enableCameraControls } from './CameraControls';
import { GridRenderer } from './GridRenderer';
import { BackgroundRenderer } from './BackgroundRenderer';
import { EntityManager } from './EntityManager';
import { EntityService } from './EntityService';

export class MainGame extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    backgroundRenderer!: BackgroundRenderer;
    gridRenderer!: GridRenderer;
    private entityManager!: EntityManager;
    private fpsText!: Phaser.GameObjects.Text; // Add FPS text element

    constructor() {
        super('MainGame');
    }

    preload() {
        preload(this);
    }

    create() {
        console.log("Game started - Checking input system...");
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.setZoom(1);

        this.createGame();
        enableCameraControls(this);
        this.backgroundRenderer = new BackgroundRenderer(this);
        this.gridRenderer = new GridRenderer(this);
        EntityService.startPolling(this);

        EventBus.on('reset-camera', () => {
            this.resetCamera();
        });

        // Add FPS text overlay
        this.fpsText = this.add.text(10, 10, 'FPS: 0', {
            font: '14px Arial',
            fill: '#00FF00',
            stroke: '#000',
            strokeThickness: 3
        }).setScrollFactor(0); // Ensure it stays in place
    }

    update(time: number, delta: number) {
        this.gridRenderer.updateGrid();
        this.backgroundRenderer.update();

        // Update FPS dynamically
        const fps = (1000 / delta).toFixed(1);
        this.fpsText.setText(`FPS: ${fps}`);
    }

    resetCamera() {
        this.tweens.add({
            targets: this.camera,
            scrollX: 0,
            scrollY: 0,
            zoom: 1,
            duration: 1000,
            ease: PhaserMath.Easing.Cubic.Out
        });
    }

    private createGame() {
        this.entityManager = EntityManager.getInstance();
        this.entityManager.initialize(this);
    }
}
