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
    private playbackFrames: any[] = [];  // Store all frames for playback
    private playbackIndex: number = 0;   // Current frame index
    private playbackInterval: number = 1000 / 30; // 30 FPS playback
    private playbackTimer: NodeJS.Timeout | null = null;

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

    startPlayback() {
        if (this.playbackTimer) return;  // Prevent multiple intervals

        this.playbackTimer = setInterval(() => {
            this.playNextFrame();
        }, this.playbackInterval);
    }

    stopPlayback() {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
    }

    storeFrame(frame: any) {
        this.playbackFrames.push(frame);
    }

    private playNextFrame() {
        if (this.playbackFrames.length === 0) return;

        const currentFrame = this.playbackFrames[this.playbackIndex];
        this.updateEntities(currentFrame);

        this.playbackIndex++;
        if (this.playbackIndex >= this.playbackFrames.length) {
            this.playbackIndex = this.playbackFrames.length - 1;  // Hold at last frame
        }
    }

    createEntity(x: number, y: number, texture: string, data: any): GameEntity {
        const sprite = this.scene.add.sprite(x, y, texture)
            .setInteractive({ cursor: 'pointer' })
            .setDataEnabled();
    
        const baseSize = textureSizes[texture] || { width: 64, height: 64 };  
        const scaleFactor = 0.1;  
        sprite.setDisplaySize(baseSize.width * scaleFactor, baseSize.height * scaleFactor);
    
        const entity: GameEntity = { sprite, isSelected: false, data };
        EntityGraphics.attachVisuals(this.scene, entity);
        this.setupEntityInteractions(entity);
    
        this.entityMap.set(data.id.toString(), entity);
        return entity;
    }

    updateEntities(parsedEntities: any[]) {
        const newEntityIds = new Set(parsedEntities.map(e => e.id.toString()));

        this.entityMap.forEach((entity, id) => {
            if (!newEntityIds.has(id)) {
                this.removeEntity(id);
            }
        });

        parsedEntities.forEach(parsedEntity => {
            const existingEntity = this.entityMap.get(parsedEntity.id.toString());

            if (!existingEntity) {
                const newEntity = this.createEntity(parsedEntity.x, parsedEntity.y, parsedEntity.texture, parsedEntity);
                if (parsedEntity.targetPosition) {
                    this.startEntityTween(newEntity, parsedEntity.targetPosition, parsedEntity.speed);
                }
            } else {
                this.updateExistingEntity(existingEntity, parsedEntity);
            }
        });
    }

    private updateExistingEntity(existingEntity: GameEntity, parsedEntity: any) {
        existingEntity.sprite.setPosition(parsedEntity.x, parsedEntity.y);

        if (parsedEntity.targetPosition) {
            if (!existingEntity.data.targetPosition ||
                existingEntity.data.targetPosition.x !== parsedEntity.targetPosition.x ||
                existingEntity.data.targetPosition.y !== parsedEntity.targetPosition.y) {
                this.startEntityTween(existingEntity, parsedEntity.targetPosition, parsedEntity.speed);
            }
        } else if (existingEntity.tween) {
            existingEntity.tween.stop();
            existingEntity.tween = undefined;
        }

        existingEntity.data = parsedEntity;
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

        const dt = 0.01;
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
