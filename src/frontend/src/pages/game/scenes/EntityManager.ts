import { Scene, GameObjects } from 'phaser';

export interface GameEntity {
    sprite: GameObjects.Sprite;
    isSelected: boolean;
    data: any; // Custom data for your entity
    selectionGraphic?: GameObjects.Graphics;
}

export class EntityManager {
    private static instance: EntityManager;
    private scene!: Scene;
    private entities: GameEntity[] = [];
    private selectedEntities: GameEntity[] = [];
    private tooltip!: GameObjects.Text;
    private selectionPanel!: GameObjects.Container;

    private constructor() {}

    static getInstance(): EntityManager {
        if (!EntityManager.instance) {
            EntityManager.instance = new EntityManager();
        }
        return EntityManager.instance;
    }

    initialize(scene: Scene) {
        this.scene = scene;
        this.createUIElements();
    }

    private createUIElements() {
        // Tooltip
        this.tooltip = this.scene.add.text(0, 0, '', {
            fontSize: '24px',
            color: '#FFFFFF',
            backgroundColor: '#000000AA',
            padding: { x: 4, y: 2 }
        }).setVisible(false).setDepth(1000);

        // Selection Panel
        this.selectionPanel = this.scene.add.container(20, this.scene.cameras.main.height - 150)
            .setVisible(false)
            .setDepth(1000);
        
        const panelBackground = this.scene.add.graphics()
            .fillStyle(0x000000, 0.7)
            .fillRoundedRect(0, 0, 300, 130, 10);
        this.selectionPanel.add(panelBackground);
    }

    createEntity(x: number, y: number, texture: string, data: any): GameEntity {
        const sprite = this.scene.add.sprite(x, y, texture)
            .setInteractive({ cursor: 'pointer' })
            .setDataEnabled();

        // Set default scale based on texture type
        const scale = texture === 'ship' ? 0.05 : 0.5;
        sprite.setScale(scale);

        const entity: GameEntity = {
            sprite,
            isSelected: false,
            data,
            selectionGraphic: undefined
        };

        this.setupEntityInteractions(entity);
        this.entities.push(entity);
        return entity;
    }

    private setupEntityInteractions(entity: GameEntity) {
        // Hover effects
        entity.sprite.on('pointerover', () => {
            // Show tooltip
            this.showTooltip(entity);
        
            // Apply hologram effect
            entity.sprite.setTint(0x5FFF6F); // Green tint
            entity.sprite.setBlendMode(Phaser.BlendModes.ADD);
        });

        entity.sprite.on('pointerout', () => {
            this.tooltip.setVisible(false);
            entity.sprite.clearTint();
        });

        // Click handling
        entity.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleSelection(entity, pointer);
            }
        });
    }

    private showTooltip(entity: GameEntity) {
        const worldPoint = entity.sprite.getCenter();
        const screenPoint = this.scene.cameras.main.getWorldPoint(worldPoint.x, worldPoint.y);
        
        this.tooltip.setText([
            `Type: ${entity.data.type}`,
            `Health: ${entity.data.health}`,
            `Owner: ${entity.data.owner}`
        ]).setPosition(screenPoint.x + 20, screenPoint.y + 20)
          .setVisible(true);
    }

    private handleSelection(entity: GameEntity, pointer: Phaser.Input.Pointer) {
        const shiftKey = this.scene.input.keyboard?.addKey('SHIFT')?.isDown;

        if (!shiftKey) {
            this.clearSelections();
        }

        entity.isSelected = !entity.isSelected;
        this.updateSelectionVisual(entity);

        if (entity.isSelected) {
            this.selectedEntities.push(entity);
            this.showSelectionPanel(entity);
        } else {
            this.selectedEntities = this.selectedEntities.filter(e => e !== entity);
        }
    }

    private updateSelectionVisual(entity: GameEntity) {
        if (entity.isSelected) {
            if (!entity.selectionGraphic) {
                // ✅ FIX: Instead of `sprite.add()`, manually position selection ring
                entity.selectionGraphic = this.scene.add.graphics()
                    .lineStyle(2, 0x00FF00, 1)
                    .strokeCircle(0, 0, entity.sprite.displayWidth * 1.1)
                    .setDepth(entity.sprite.depth - 1);
                
                // ✅ Make sure selection follows entity
                this.scene.events.on('update', () => {
                    if (entity.isSelected && entity.selectionGraphic) {
                        entity.selectionGraphic.setPosition(entity.sprite.x, entity.sprite.y);
                    }
                });
            }
        } else {
            entity.selectionGraphic?.destroy();
            entity.selectionGraphic = undefined;
        }
    }

    private clearSelections() {
        this.selectedEntities.forEach(entity => {
            entity.isSelected = false;
            this.updateSelectionVisual(entity);
        });
        this.selectedEntities = [];
        this.selectionPanel.setVisible(false);
    }

    private showSelectionPanel(entity: GameEntity) {
        this.selectionPanel.setVisible(true);
        // Update panel content based on selected entity
        const content = this.scene.add.text(20, 20, [
            `Selected: ${entity.data.type}`,
            `Position: ${Math.round(entity.sprite.x)}, ${Math.round(entity.sprite.y)}`,
            `Status: ${entity.data.status}`
        ], {
            fontSize: '16px',
            color: '#FFFFFF'
        });
        
        this.selectionPanel.add(content);
    }

    update() {
        // Update tooltip position if visible
        if (this.tooltip.visible) {
            const pointer = this.scene.input.activePointer;
            this.tooltip.setPosition(pointer.x + 20, pointer.y + 20);
        }
    }
}