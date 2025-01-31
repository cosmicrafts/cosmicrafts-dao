import { Scene, GameObjects, Tweens } from 'phaser';
import { EventBus } from '../EventBus';
import { EntityGraphics } from './EntityGraphics';
import { EntityMovement } from './EntityMovement';
import { textureSizes } from './Preload';

export interface GameEntity {
    sprite: GameObjects.Sprite;
    isSelected: boolean;
    data: any;
    tween?: Tweens.Tween;
}

export class EntityManager {
    private static instance: EntityManager;
    private scene!: Scene;
    private entityMap: Map<string, GameEntity> = new Map();

    private constructor() {}

    static getInstance(): EntityManager {
        if (!EntityManager.instance) {
            EntityManager.instance = new EntityManager();
        }
        return EntityManager.instance;
    }

    initialize(scene: Scene) {
        this.scene = scene;
    }

    createEntity(x: number, y: number, texture: string, data: any): GameEntity {
        const sprite = this.scene.add.sprite(x, y, texture)
            .setInteractive({ cursor: 'pointer' })
            .setDataEnabled();
    
        // Fetch predefined size from `textureSizes`
        const baseSize = textureSizes[texture] || { width: 64, height: 64 };  // Default size if not found
        const scaleFactor = 0.1;  // Adjust as needed
    
        sprite.setDisplaySize(baseSize.width * scaleFactor, baseSize.height * scaleFactor);
    
        console.log(`${data.type} - Display Size: ${sprite.displayWidth}x${sprite.displayHeight}`);
    
        const entity: GameEntity = { sprite, isSelected: false, data };
        EntityGraphics.attachVisuals(this.scene, entity);
        this.setupEntityInteractions(entity);
    
        this.entityMap.set(data.id.toString(), entity);
        return entity;
    }

    updateEntities(parsedEntities: any[]) {
        const newEntityIds = new Set(parsedEntities.map(e => e.id.toString()));

        // Remove entities not in the latest fetch
        this.entityMap.forEach((entity, id) => {
            if (!newEntityIds.has(id)) {
                this.removeEntity(id);
            }
        });

        parsedEntities.forEach(parsedEntity => {
            const existingEntity = this.entityMap.get(parsedEntity.id.toString());

            if (!existingEntity) {
                // New entity
                const newEntity = this.createEntity(parsedEntity.x, parsedEntity.y, parsedEntity.texture, parsedEntity);
                if (parsedEntity.targetPosition) {
                    this.startEntityTween(newEntity, parsedEntity.targetPosition, parsedEntity.speed);
                }
            } else {
                // Update existing entity
                existingEntity.sprite.setPosition(parsedEntity.x, parsedEntity.y);
                
                if (parsedEntity.targetPosition) {
                    if (!existingEntity.data.targetPosition || 
                        existingEntity.data.targetPosition.x !== parsedEntity.targetPosition.x || 
                        existingEntity.data.targetPosition.y !== parsedEntity.targetPosition.y) {
                        this.startEntityTween(existingEntity, parsedEntity.targetPosition, parsedEntity.speed);
                    }
                } else {
                    // Target cleared, stop movement
                    if (existingEntity.tween) {
                        existingEntity.tween.stop();
                        existingEntity.tween = undefined;
                    }
                }

                existingEntity.data = parsedEntity;
            }
        });
    }

    private setupEntityInteractions(entity: GameEntity) {
        entity.sprite.on('pointerover', () => {
            EventBus.emit('show-tooltip', {
                id: entity.data.id,
                type: entity.data.type,
                speed: entity.data.speed,
                position: `(${entity.data.x}, ${entity.data.y})`,
                target: entity.data.targetPosition
                    ? `(${entity.data.targetPosition.x}, ${entity.data.targetPosition.y})`
                    : 'None'
            });
            EntityGraphics.onHover(entity);
        });

        entity.sprite.on('pointerout', () => {
            EventBus.emit('hide-tooltip');
            EntityGraphics.onHoverEnd(entity);
        });

        entity.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleSelection(entity);
            }
        });
    }

    private handleSelection(entity: GameEntity) {
        const shiftKey = this.scene.input.keyboard?.addKey('SHIFT')?.isDown;
        if (!shiftKey) this.clearSelections();

        entity.isSelected = !entity.isSelected;
        EntityGraphics.onSelect(entity, entity.isSelected);

        if (entity.isSelected) {
            EventBus.emit('entity-selected', entity.data);
        } else {
            EventBus.emit('clear-selection');
        }
    }

    private clearSelections() {
        this.entityMap.forEach(entity => {
            entity.isSelected = false;
            EntityGraphics.onSelect(entity, false);
        });
    }

    private startEntityTween(entity: GameEntity, target: { x: number; y: number }, speed: number) {
        if (!entity || !target) return;
    
        if (entity.tween) {
            entity.tween.stop();
            entity.tween = undefined;
        }
    
        // ✅ Use EntityMovement logic instead of a blind tween
        const dt = 0.01; // Match backend frame timing
        EntityMovement.moveEntity(entity, target, speed, dt);
    }

    private removeEntity(id: string) {
        const entity = this.entityMap.get(id);
        if (entity) {
            entity.sprite.destroy();
            this.entityMap.delete(id);
        }
    }

    
}
