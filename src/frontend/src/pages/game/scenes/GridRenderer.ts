import { Scene } from 'phaser';

export class GridRenderer {
    private graphics!: Phaser.GameObjects.Graphics;
    private lastCameraX = 0;
    private lastCameraY = 0;
    private lastZoom = 1;

    constructor(private scene: Scene) {
        this.graphics = scene.add.graphics();
    }

    updateGrid() {
        const camera = this.scene.cameras.main;

        // Avoid unnecessary redraws unless camera moved or zoom changed
        if (
            Math.abs(camera.scrollX - this.lastCameraX) < 5 &&
            Math.abs(camera.scrollY - this.lastCameraY) < 5 &&
            camera.zoom === this.lastZoom
        ) {
            return;
        }

        this.lastCameraX = camera.scrollX;
        this.lastCameraY = camera.scrollY;
        this.lastZoom = camera.zoom;

        this.drawGrid();
    }

    private drawGrid() {
        const camera = this.scene.cameras.main;
        this.graphics.clear();

        // Set base grid size (scales based on zoom)
        let baseGridSize = 100;
        if (camera.zoom > 2) baseGridSize = 50; // More detailed grid when zoomed in
        if (camera.zoom > 3) baseGridSize = 25; // Even smaller grid for ultra zoom
        if (camera.zoom < 1) baseGridSize = 200; // Less detail when zoomed out
        if (camera.zoom < 0.5) baseGridSize = 400;

        // Get camera viewport bounds
        const left = Math.floor(camera.worldView.x / baseGridSize) * baseGridSize;
        const right = Math.ceil((camera.worldView.x + camera.worldView.width) / baseGridSize) * baseGridSize;
        const top = Math.floor(camera.worldView.y / baseGridSize) * baseGridSize;
        const bottom = Math.ceil((camera.worldView.y + camera.worldView.height) / baseGridSize) * baseGridSize;

        // Draw grid lines
        this.graphics.lineStyle(0.5, 0x555555, 0.5);

        for (let x = left; x <= right; x += baseGridSize) {
            this.graphics.moveTo(x, top);
            this.graphics.lineTo(x, bottom);
        }

        for (let y = top; y <= bottom; y += baseGridSize) {
            this.graphics.moveTo(left, y);
            this.graphics.lineTo(right, y);
        }

        this.graphics.strokePath();
    }
}
