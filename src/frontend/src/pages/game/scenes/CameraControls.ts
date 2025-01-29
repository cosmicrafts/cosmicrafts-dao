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

    // ✅ Use native event listener for mouse wheel
    scene.input.mouse!.enabled = true; 
    scene.input.manager.canvas.addEventListener("wheel", (event: WheelEvent) => {
        event.preventDefault();
        console.log("📜 Native Mouse Wheel Event: deltaY =", event.deltaY);

        const minZoom = 0.5;
        const maxZoom = 3;
        const zoomFactor = 0.1;

        let newZoom = camera.zoom + (event.deltaY > 0 ? -zoomFactor : zoomFactor);
        newZoom = Phaser.Math.Clamp(newZoom, minZoom, maxZoom);

        // Get world point under cursor before zooming
        const worldPoint = camera.getWorldPoint(event.clientX, event.clientY);

        // Apply new zoom
        camera.setZoom(newZoom);

        // Adjust scroll to keep zoom centered on cursor
        const newWorldPoint = camera.getWorldPoint(event.clientX, event.clientY);
        camera.scrollX += worldPoint.x - newWorldPoint.x;
        camera.scrollY += worldPoint.y - newWorldPoint.y;
    });

    // Keyboard camera movement (WASD / Arrow keys)
    scene.input.keyboard?.on('keydown-W', () => { camera.scrollY -= 50 / camera.zoom; });
    scene.input.keyboard?.on('keydown-S', () => { camera.scrollY += 50 / camera.zoom; });
    scene.input.keyboard?.on('keydown-A', () => { camera.scrollX -= 50 / camera.zoom; });
    scene.input.keyboard?.on('keydown-D', () => { camera.scrollX += 50 / camera.zoom; });

    scene.input.keyboard?.on('keydown-UP', () => { camera.scrollY -= 50 / camera.zoom; });
    scene.input.keyboard?.on('keydown-DOWN', () => { camera.scrollY += 50 / camera.zoom; });
    scene.input.keyboard?.on('keydown-LEFT', () => { camera.scrollX -= 50 / camera.zoom; });
    scene.input.keyboard?.on('keydown-RIGHT', () => { camera.scrollX += 50 / camera.zoom; });
}
