import { Scene } from 'phaser';
export function enableCameraControls(scene: Scene) {
    const camera = scene.cameras.main;
    let dragStartX = 0, dragStartY = 0;

    // Custom property to track the last wheel event time
    let lastWheelTime = Date.now();

    // Panning with mouse drag
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!pointer.rightButtonDown()) {
            dragStartX = pointer.x;
            dragStartY = pointer.y;
        }
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown && !pointer.rightButtonDown()) {
            camera.scrollX -= (pointer.x - dragStartX) / camera.zoom;
            camera.scrollY -= (pointer.y - dragStartY) / camera.zoom;
            dragStartX = pointer.x;
            dragStartY = pointer.y;
        }
    });

    // Smooth zooming centered on cursor
    scene.input.mouse!.enabled = true;
    scene.input.manager.canvas.addEventListener("wheel", (event: WheelEvent) => {
        event.preventDefault();

        const minZoom = 0.1;
        const maxZoom = 10;
        const baseZoomFactor = 0.05; // Base zoom speed
        const accelerationFactor = 0.005; // How much faster it gets per scroll
        const maxAcceleration = 0.1; // Maximum zoom speed

        // Calculate time since the last scroll event
        const now = Date.now();
        const timeSinceLastScroll = now - lastWheelTime;
        lastWheelTime = now;

        // Calculate acceleration based on scroll speed
        let zoomSpeed = baseZoomFactor + (accelerationFactor * (1 / Math.max(1, timeSinceLastScroll)));
        zoomSpeed = Math.min(zoomSpeed, maxAcceleration); // Cap the speed

        // Apply zoom
        const worldPointBeforeZoom = camera.getWorldPoint(event.clientX, event.clientY);
        const zoomDelta = (event.deltaY > 0 ? -zoomSpeed : zoomSpeed); // Use zoomSpeed instead of fixed zoomFactor
        let newZoom = Phaser.Math.Clamp(camera.zoom + zoomDelta, minZoom, maxZoom);
        camera.setZoom(newZoom);

        // Adjust scroll to keep zoom centered on cursor
        const worldPointAfterZoom = camera.getWorldPoint(event.clientX, event.clientY);
        camera.scrollX += worldPointBeforeZoom.x - worldPointAfterZoom.x;
        camera.scrollY += worldPointBeforeZoom.y - worldPointAfterZoom.y;
    });

    // Keyboard camera movement (WASD / Arrow keys)
    const keySpeed = 50;
    scene.input.keyboard?.on('keydown-W', () => camera.scrollY -= keySpeed / camera.zoom);
    scene.input.keyboard?.on('keydown-S', () => camera.scrollY += keySpeed / camera.zoom);
    scene.input.keyboard?.on('keydown-A', () => camera.scrollX -= keySpeed / camera.zoom);
    scene.input.keyboard?.on('keydown-D', () => camera.scrollX += keySpeed / camera.zoom);

    scene.input.keyboard?.on('keydown-UP', () => camera.scrollY -= keySpeed / camera.zoom);
    scene.input.keyboard?.on('keydown-DOWN', () => camera.scrollY += keySpeed / camera.zoom);
    scene.input.keyboard?.on('keydown-LEFT', () => camera.scrollX -= keySpeed / camera.zoom);
    scene.input.keyboard?.on('keydown-RIGHT', () => camera.scrollX += keySpeed / camera.zoom);
}