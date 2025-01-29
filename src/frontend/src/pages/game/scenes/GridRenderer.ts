import { Scene } from 'phaser';

export class GridRenderer {
    private graphics!: Phaser.GameObjects.Graphics;
    private lastCameraX = 0;
    private lastCameraY = 0;
    private lastZoom = 1;

    constructor(private scene: Scene) {
        this.graphics = scene.add.graphics();
        this.graphics.setName('gridGraphics'); // Give the graphics object a name
    }

    updateGrid() {
        const camera = this.scene.cameras.main;

        // Avoid unnecessary redraws
        if (
            Math.abs(camera.scrollX - this.lastCameraX) < 1 && // Reduced threshold
            Math.abs(camera.scrollY - this.lastCameraY) < 1 && // Reduced threshold
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

        // Define grid levels based on zoom
        const gridLevels = [
            { minZoom: 0.1, size: 400, alpha: 0.2 },
            { minZoom: 0.3, size: 200, alpha: 0.3 },
            { minZoom: 0.7, size: 100, alpha: 0.4 },
            { minZoom: 1.2, size: 50, alpha: 0.5 },
            { minZoom: 2.0, size: 25, alpha: 0.6 },
        ];

        // Select appropriate grid level
        let selectedLevel = gridLevels[0];
        for (const level of gridLevels) {
            if (camera.zoom >= level.minZoom) {
                selectedLevel = level;
            }
        }

        const { size, alpha } = selectedLevel;

        // Get camera viewport bounds
        const left = Math.floor(camera.worldView.x / size) * size;
        const right = Math.ceil((camera.worldView.x + camera.worldView.width) / size) * size;
        const top = Math.floor(camera.worldView.y / size) * size;
        const bottom = Math.ceil((camera.worldView.y + camera.worldView.height) / size) * size;

        // Draw grid lines
        this.graphics.lineStyle(0.5, 0x555555, alpha); // Use alpha from grid level

        for (let x = left; x <= right; x += size) {
            this.graphics.moveTo(x, top);
            this.graphics.lineTo(x, bottom);
        }

        for (let y = top; y <= bottom; y += size) {
            this.graphics.moveTo(left, y);
            this.graphics.lineTo(right, y);
        }

        this.graphics.strokePath();
    }
}