// MainGame.ts
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
    }

    update(time: number, delta: number) {
        this.gridRenderer.updateGrid();
        this.backgroundRenderer.update();

        // Calculate FPS and emit it via the EventBus.
        const fps = (1000 / delta).toFixed(1);
        EventBus.emit('update-fps', fps);
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
