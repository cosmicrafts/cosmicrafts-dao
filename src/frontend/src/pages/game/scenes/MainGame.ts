import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainGame extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;

    constructor() {
        super('MainGame');
    }

    preload() {
        this.load.image('background', 'assets/space-bg.png');
        this.load.image('planet', 'assets/planet2.webp');
        this.load.image('ship', 'assets/ship.png');
    }

    create() {
        console.log("Game started - Checking input system...");

        // Ensure mouse input is enabled
        this.input.mouse!.enabled = true;
        this.input.mouse!.preventDefaultWheel = true;

        // Log mouse events
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log("🖱️ Mouse Click Detected at: ", pointer.x, pointer.y);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            //console.log("🎯 Mouse Moving at: ", pointer.x, pointer.y);
        });

        this.input.on('wheel', (pointer: Phaser.Input.Pointer, deltaX: number, deltaY: number) => {
            console.log("📜 Mouse Wheel Scrolled: ", deltaY);
            console.log("Pointer Object: ", pointer);
        });

        // Set up the camera
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.setZoom(1);

        // Add space background
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        this.background.setDisplaySize(this.scale.width, this.scale.height);
        this.background.setAlpha(0.95);

        // Draw the grid
        this.drawGrid();

        // Example: Add a planet and a ship
        const GRID_SIZE = 100;
        this.add.image(GRID_SIZE * 6, GRID_SIZE * 3, 'planet').setScale(0.1);
        this.add.image(GRID_SIZE * 5, GRID_SIZE * 5, 'ship').setScale(0.05);

        // Enable camera controls
        this.enableCameraControls();

        // Notify Vue that the scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    drawGrid() {
        const GRID_SIZE = 100;
        const SUBDIVISIONS = 2;
        const LSUBDIVISIONS = 4;
        const SUB_GRID_SIZE = GRID_SIZE / SUBDIVISIONS;
        const LSUB_GRID_SIZE = GRID_SIZE / LSUBDIVISIONS;

        const graphics = this.add.graphics();

        // Main grid lines
        graphics.lineStyle(0.5, 0x555555, 0.5);
        for (let x = 0; x < this.scale.width; x += GRID_SIZE) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.scale.height);
        }
        for (let y = 0; y < this.scale.height; y += GRID_SIZE) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.scale.width, y);
        }

        // Fractional grid lines
        graphics.lineStyle(0.4, 0x777777, 0.4);
        for (let x = 0; x < this.scale.width; x += SUB_GRID_SIZE) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.scale.height);
        }
        for (let y = 0; y < this.scale.height; y += SUB_GRID_SIZE) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.scale.width, y);
        }

        // Smaller fractional grid lines
        graphics.lineStyle(0.3, 0x777777, 0.3);
        for (let x = 0; x < this.scale.width; x += LSUB_GRID_SIZE) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.scale.height);
        }
        for (let y = 0; y < this.scale.height; y += LSUB_GRID_SIZE) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.scale.width, y);
        }

        graphics.strokePath();
    }

    enableCameraControls() {
        const camera = this.camera;
        let dragStartX = 0, dragStartY = 0;
        
        // Panning with mouse drag
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!pointer.rightButtonDown()) {
                dragStartX = pointer.x;
                dragStartY = pointer.y;
            }
        });
    
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown && !pointer.rightButtonDown()) {
                camera.scrollX -= (pointer.x - dragStartX) / camera.zoom;
                camera.scrollY -= (pointer.y - dragStartY) / camera.zoom;
                dragStartX = pointer.x;
                dragStartY = pointer.y;
            }
        });
    
        // ✅ Use native event listener for mouse wheel
        this.input.mouse!.enabled = true; // Ensure mouse is enabled
        this.input.manager.canvas.addEventListener("wheel", (event: WheelEvent) => {
            event.preventDefault(); // Prevent page scrolling
            console.log("📜 Native Mouse Wheel Event: deltaY =", event.deltaY);
    
            const minZoom = 0.5;
            const maxZoom = 3;
            const zoomFactor = 0.1; // Adjust zoom speed
    
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
        this.input.keyboard?.on('keydown-W', () => { camera.scrollY -= 50 / camera.zoom; });
        this.input.keyboard?.on('keydown-S', () => { camera.scrollY += 50 / camera.zoom; });
        this.input.keyboard?.on('keydown-A', () => { camera.scrollX -= 50 / camera.zoom; });
        this.input.keyboard?.on('keydown-D', () => { camera.scrollX += 50 / camera.zoom; });
    
        this.input.keyboard?.on('keydown-UP', () => { camera.scrollY -= 50 / camera.zoom; });
        this.input.keyboard?.on('keydown-DOWN', () => { camera.scrollY += 50 / camera.zoom; });
        this.input.keyboard?.on('keydown-LEFT', () => { camera.scrollX -= 50 / camera.zoom; });
        this.input.keyboard?.on('keydown-RIGHT', () => { camera.scrollX += 50 / camera.zoom; });
    }
    
    
    
}