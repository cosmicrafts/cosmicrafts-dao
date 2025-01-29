import { Scene } from 'phaser';

export function enableCameraControls(scene: Scene) {
    const camera = scene.cameras.main;
    let dragStartX = 0, dragStartY = 0;

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

    // ✅ Use native event listener for smooth zooming centered on cursor
    scene.input.mouse!.enabled = true;
    scene.input.manager.canvas.addEventListener("wheel", (event: WheelEvent) => {
        event.preventDefault();

        const minZoom = 0.1;
        const maxZoom = 3;
        const zoomFactor = 0.1;

        // ✅ Get the WORLD COORDINATES under the cursor before zooming
        const worldPointBeforeZoom = camera.getWorldPoint(event.clientX, event.clientY);

        // ✅ Apply the new zoom
        let newZoom = camera.zoom + (event.deltaY > 0 ? -zoomFactor : zoomFactor);
        newZoom = Phaser.Math.Clamp(newZoom, minZoom, maxZoom);
        camera.setZoom(newZoom);

        // ✅ Get the WORLD COORDINATES after zooming
        const worldPointAfterZoom = camera.getWorldPoint(event.clientX, event.clientY);

        // ✅ Adjust scroll to keep zoom centered on cursor
        camera.scrollX += worldPointBeforeZoom.x - worldPointAfterZoom.x;
        camera.scrollY += worldPointBeforeZoom.y - worldPointAfterZoom.y;
    });

    // ✅ Keyboard camera movement (WASD / Arrow keys)
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
