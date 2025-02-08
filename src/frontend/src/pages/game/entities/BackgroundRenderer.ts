import { Scene } from 'phaser';

export class BackgroundRenderer {
    private tileSprite!: Phaser.GameObjects.TileSprite;
    private scene: Scene;
    private tileSize: number = 2048;

    constructor(scene: Scene) {
        this.scene = scene;
        this.initBackground();
    }

    private initBackground() {
        const camera = this.scene.cameras.main;

        // **Get the actual texture size dynamically**
        const texture = this.scene.textures.get('background');
        if (texture) {
            this.tileSize = texture.getSourceImage().width; // Get the real width
        }

        // **Create a tileSprite instead of multiple images**
        this.tileSprite = this.scene.add.tileSprite(
            camera.worldView.centerX,  // Centered on camera
            camera.worldView.centerY,
            camera.worldView.width * 10, // Covers a large area
            camera.worldView.height * 10,
            'background'
        ).setOrigin(0.5, 0.5);

        this.tileSprite.setDepth(-1); // Send to the back
    }

    update() {
        const camera = this.scene.cameras.main;

        // Move the tileSprite to always center on the camera
        this.tileSprite.x = camera.worldView.centerX;
        this.tileSprite.y = camera.worldView.centerY;

        // Adjust the tiling offset based on camera movement
        this.tileSprite.tilePositionX = camera.scrollX;
        this.tileSprite.tilePositionY = camera.scrollY;
    }
}
