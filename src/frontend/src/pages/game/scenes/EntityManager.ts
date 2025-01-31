import { Scene, GameObjects, Tweens } from 'phaser';
import { EventBus } from '../EventBus';

export interface GameEntity {
    sprite: GameObjects.Sprite;
    isSelected: boolean;
    data: any;
    selectionGraphic?: GameObjects.Graphics;
    selectionTween?: Tweens.Tween;
    glowSprite?: GameObjects.Sprite; // ✅ Glow effect reference
    nameText?: GameObjects.Text; // ✅ Name tag reference
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
            // ✅ Add selection panel initialization
        this.selectionPanel = this.scene.add.container(20, this.scene.cameras.main.height - 150)
        .setVisible(false)
        .setDepth(1000);
    }

    createEntity(x: number, y: number, texture: string, data: any): GameEntity {
        const sprite = this.scene.add.sprite(x, y, texture)
            .setInteractive({ cursor: 'pointer' })
            .setDataEnabled();
    
        // Set default scale based on texture type
        const scale = texture === 'ship' ? 0.05 : 0.5;
        sprite.setScale(scale);
    
        // ✅ Create floating name tag
        const nameText = this.scene.add.text(x, y - sprite.displayHeight * 0.6, data.type, {
            fontSize: '36px',
            fontStyle: "bold",
            color: '#00FF00', // Green color
            fontFamily: 'Montserrat',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(1000);
    
        const entity: GameEntity = {
            sprite,
            isSelected: false,
            data,
            selectionGraphic: undefined,
            selectionTween: undefined,
            glowSprite: undefined,
            nameText // ✅ Store reference
        };
    
        this.setupEntityInteractions(entity);
        this.entities.push(entity);
    
        // ✅ Make sure name follows entity movement
        this.scene.events.on('update', () => {
            if (entity.nameText) {
                entity.nameText.setPosition(entity.sprite.x, entity.sprite.y - entity.sprite.displayHeight * 0.6);
            }
        });
    
        return entity;
    }

    private setupEntityInteractions(entity: GameEntity) {
        entity.sprite.on('pointerover', () => {
            this.showTooltip(entity);

            // ✅ Add glow effect
            entity.sprite.setTint(0xA5FFAE); // Light green tint
            entity.sprite.setBlendMode(Phaser.BlendModes.ADD);

            if (!entity.glowSprite) {
                entity.glowSprite = this.scene.add.sprite(entity.sprite.x, entity.sprite.y, entity.sprite.texture.key)
                    .setTint(0xffffff) // Pure white glow
                    .setAlpha(0.5)
                    .setBlendMode(Phaser.BlendModes.ADD)
                    .setScale(entity.sprite.scaleX * 1.2)
                    .setDepth(entity.sprite.depth - 1);

                this.scene.tweens.add({
                    targets: entity.glowSprite,
                    scaleX: { from: entity.sprite.scaleX * 1.1, to: entity.sprite.scaleX * 1.3 },
                    scaleY: { from: entity.sprite.scaleY * 1.1, to: entity.sprite.scaleY * 1.3 },
                    alpha: { from: 0.6, to: 0.3 },
                    duration: 600,
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        entity.sprite.on('pointerout', () => {
            EventBus.emit('hide-tooltip');
            entity.sprite.clearTint();
            entity.sprite.setBlendMode(Phaser.BlendModes.NORMAL);

            if (entity.glowSprite) {
                entity.glowSprite.destroy();
                entity.glowSprite = undefined;
            }
        });

        entity.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleSelection(entity, pointer);
            }
        });
    }

    private showTooltip(entity: GameEntity) {
        EventBus.emit('show-tooltip', {
            type: entity.data.type,
            health: entity.data.health,
            owner: entity.data.owner
        });
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
            EventBus.emit('entity-selected', entity.data); // ✅ Emit event to Vue
        } else {
            this.selectedEntities = this.selectedEntities.filter(e => e !== entity);
            if (this.selectedEntities.length === 0) {
                EventBus.emit('clear-selection'); // ✅ Clear UI if no selection
            }
        }
    }
    
    private updateSelectionVisual(entity: GameEntity) {
        if (entity.isSelected) {
            if (!entity.selectionGraphic) {
                entity.selectionGraphic = this.scene.add.graphics()
                    .lineStyle(2, 0x00FF00, 1)
                    .strokeCircle(0, 0, entity.sprite.displayWidth * 1.1)
                    .setDepth(entity.sprite.depth - 1)
                    .setAlpha(0.75);

                this.scene.events.on('update', () => {
                    if (entity.isSelected && entity.selectionGraphic) {
                        entity.selectionGraphic.setPosition(entity.sprite.x, entity.sprite.y);
                    }
                });

                // ✅ Smooth animation
                entity.selectionTween = this.scene.tweens.add({
                    targets: entity.selectionGraphic,
                    alpha: { from: 0, to: 1 },
                    scaleX: { from: 0.4, to: 0.6 },
                    scaleY: { from: 0.4, to: 0.6 },
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.circinOut'
                });
            }
        } else {
            if (entity.selectionGraphic) {
                this.scene.tweens.add({
                    targets: entity.selectionGraphic,
                    alpha: 0,
                    scaleX: 0.25,
                    scaleY: 0.25,
                    duration: 400,
                    ease: 'Sine.BackinOut',
                    onComplete: () => {
                        entity.selectionGraphic?.destroy();
                        entity.selectionGraphic = undefined;
                    }
                });

                entity.selectionTween?.stop();
                entity.selectionTween = undefined;
            }
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

}
