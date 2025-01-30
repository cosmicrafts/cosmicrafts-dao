import { Scene } from 'phaser';

export function enableCameraControls(scene: Scene) {
    const camera = scene.cameras.main;
    let velocityX = 0, velocityY = 0;
    const speed = 1000;
    let dragStartX = 0, dragStartY = 0;
    let tileSprite;

    scene.input.keyboard!.on('keydown', (event) => {
        if (event.key === 'w' || event.key === 'ArrowUp') velocityY = -speed;
        if (event.key === 's' || event.key === 'ArrowDown') velocityY = speed;
        if (event.key === 'a' || event.key === 'ArrowLeft') velocityX = -speed;
        if (event.key === 'd' || event.key === 'ArrowRight') velocityX = speed;
    });
    
    scene.input.keyboard.on('keyup', (event) => {
        if (['w', 'ArrowUp', 's', 'ArrowDown'].includes(event.key)) velocityY = 0;
        if (['a', 'ArrowLeft', 'd', 'ArrowRight'].includes(event.key)) velocityX = 0;
    });
    
    scene.events.on('update', (_, delta) => {
        const factor = delta / 1000;
        camera.scrollX += velocityX * factor;
        camera.scrollY += velocityY * factor;
        if (tileSprite) {
            tileSprite.x = camera.scrollX + camera.width / 2;
            tileSprite.y = camera.scrollY + camera.height / 2;
            tileSprite.tilePositionX = camera.scrollX;
            tileSprite.tilePositionY = camera.scrollY;
        }
    });
    
    scene.input.on('wheel', (event) => {
        camera.setZoom(Phaser.Math.Clamp(camera.zoom * (event.deltaY > 0 ? 0.9 : 1.1), 0.1, 100));
    });
    
    scene.input.on('pointerdown', (pointer) => {
        dragStartX = pointer.x;
        dragStartY = pointer.y;
    });
    
    scene.input.on('pointermove', (pointer) => {
        if (!pointer.isDown) return;
        camera.scrollX -= (pointer.x - dragStartX) / camera.zoom;
        camera.scrollY -= (pointer.y - dragStartY) / camera.zoom;
        dragStartX = pointer.x;
        dragStartY = pointer.y;
    });
    
    // Background Renderer Integration
    const texture = scene.textures.get('background');
    const tileSize = texture ? texture.getSourceImage().width : 2048;
    tileSprite = scene.add.tileSprite(
        camera.scrollX + camera.width / 2,
        camera.scrollY + camera.height / 2,
        camera.width * 10,
        camera.height * 10,
        'background'
    ).setOrigin(0.5, 0.5).setDepth(-1);
}
